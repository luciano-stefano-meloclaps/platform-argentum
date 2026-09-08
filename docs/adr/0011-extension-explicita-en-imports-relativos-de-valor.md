# 0011 — Extensión explícita en los imports relativos de valor

- **Estado:** Aceptado
- **Fecha:** 2026-09-08
- **Decide:** Luciano Melo Claps

## Decisión

**Todo import relativo de valor lleva la extensión `.ts` explícita; los
`import type` no la llevan.** Rige en todo el repositorio, sin condicionarse a
qué archivos atraviesa un script. Lo hacen posible
`"allowImportingTsExtensions": true` en `tsconfig.json` y lo hace cumplir la
regla `import/extensions` de ESLint.

Este ADR **extiende** al ADR 0007 (agrega una opción al compilador, sin aflojar
ninguna de las cinco que aquel cerró) y **completa** al ADR 0009 en un punto que
quedó corto. No supersede a ninguno de los dos.

## Contexto

El ADR 0009 decidió que el contenido curado se escribe en TypeScript y que el
script de **importación** lo ejecuta con `node` directo, sin agregar un
compilador al camino, "como ya hace `src/db/ping.mts`". Para justificarlo fijó
una restricción de **sintaxis**: los archivos se limitan a TypeScript de tipos
borrables, sin `enum`, `namespace` ni decoradores.

Al arrancar el ticket #29 —la importación idempotente del contenido curado— el
`backend-specialist` verificó empíricamente que esa restricción no alcanza. La
importación necesita el **registro de descriptores**, y
`src/catalogo/descriptores/registro.ts` importaba `./procer` sin extensión. ESM
no adivina extensiones, así que Node falla con `ERR_MODULE_NOT_FOUND` sobre
código que es perfectamente borrable.

`ping.mts` no había expuesto el problema porque no tiene un solo import
relativo: la frase del ADR 0009 era cierta para él y no se extiende a un script
que entra a `src/`.

Verificado sobre las versiones instaladas: Node 22.23.2, TypeScript 5.9.3,
Next.js 16.3.4, Vitest 4.1.11, ESLint 9.39.5.

## Problema

El ADR 0009 fijó una restricción de **sintaxis** para que un script corra con
`node`, pero la ejecución bajo ESM también impone una restricción de
**resolución de módulos**, que no se enunció. Sin ella, el ADR 0009 no se puede
cumplir.

Y hay una segunda pregunta detrás, que es la que de verdad decide el alcance:
cuál es la regla, dado que la restricción solo aplica a lo que Node realmente
resuelve.

## Alternativas consideradas

### A. Extensión solo donde hace falta
La lleva un import cuando es **de valor** *y* algún script ejecutado con `node`
va a **atravesar** ese archivo.

### B. Extensión en todo import relativo de valor
La lleva todo import relativo que sobrevive al borrado de tipos, sin importar
quién lo atraviese. Los `import type` quedan afuera.

### C. Extensión en todo import relativo, incluidos los `import type`
Uniformidad total; se habilita con `checkTypeImports: true` en la misma regla de
ESLint.

### D. Meter un compilador en el camino (`tsx`), o un *resolve hook* de Node
Evitar la regla resolviendo el problema con herramienta.

### E. No decidir: que lo resuelva quien escriba la importación
Aplicar la extensión donde haga falta y seguir.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Solo donde hace falta | Toca lo mínimo (1 línea hoy); no aparece ruido donde no hace falta | La condición "lo atraviesa node" es **no local**: depende del grafo entero y cambia cuando alguien agrega un import a tres saltos de distancia. **Nada la verifica**, y su violación aparece como error de ejecución en la importación, tarde y fuera de CI | Bajo |
| B. Todo import de valor | La condición se decide **leyendo la línea**; `verbatimModuleSyntax` (ADR 0007) ya la hace visible en el diff; enforceable con la regla de ESLint en su default; cuesta 3 líneas más que A | Pone extensión donde nadie la necesita (verificado: no molesta a `tsc`, Turbopack ni Vitest) | Bajo |
| C. Todo import, incluidos los de tipo | Máxima uniformidad; blinda contra un cambio hipotético en TS que quitara la exención de TS5097 a los `import type` | **Borra la señal**: si todo la lleva, la extensión deja de significar "esto existe en tiempo de ejecución". Y no compra seguridad real: convertir un `import type` en import de valor ya dispara la regla en B | Bajo |
| D. `tsx` o *resolve hook* | Ningún cambio en el código fuente | Lo prohíbe el ADR 0009 (es un compilador en el camino) o es maquinaria propia que esconde la regla y reaparece en cada script nuevo. Dependencia nueva sin problema presente que la justifique | Medio |
| E. No decidir | No gasta tiempo ahora | La regla existe igual, sin registro: en seis meses alguien saca la extensión "porque el resto del repo no la tiene" y rompe la importación. Es exactamente el caso que este proyecto declaró querer evitar | — |

## Decisión elegida

**Alternativa B**, en todo el repositorio, con tres piezas concretas.

**1. La regla, en una frase:** *todo import relativo de valor lleva `.ts`; los
`import type` no.*

**2. `"allowImportingTsExtensions": true`** en `tsconfig.json`. Sin esto `tsc`
rechaza el especificador con `TS5097`. Es legal porque el proyecto tiene
`noEmit: true`.

**3. `import/extensions` en `eslint.config.mjs`**, en `error`, con
`ignorePackages` y `always` para `.ts`, `.tsx`, `.mts` y `.cts`. La regla exime
los `import type` **por defecto** (`checkTypeImports: false`), que es justo la
línea decidida, y cubre además los re-exports y el `import()` dinámico —el que
la importación va a usar sobre `contenido/`—. Cero dependencias nuevas:
`eslint-plugin-import` ya viene con `eslint-config-next` y se toma la regla por
nombre sin volver a declarar el plugin.

Alcance: **el repositorio entero**, incluidos los imports por alias `@/` y los
archivos que Node nunca va a tocar. La regla que se puede explicar en una frase
vale más que los tres caracteres ahorrados en un archivo de pantalla.

## Motivo

La razón decisiva es **dónde se decide la regla**. La condición de la
alternativa A tiene dos partes, y son de naturaleza distinta: "es un import de
valor" se contesta leyendo la línea, y "algún script lo atraviesa" se contesta
recorriendo el grafo completo. La segunda es un invariante no local que ningún
compilador evalúa, que cambia sin que nadie lo advierta y cuya violación se
descubre en tiempo de ejecución, en el circuito editorial del ADR 0009. Comprar
la salida de ese invariante cuesta **tres líneas**, y eso lo vuelve una compra
obvia.

Que ese invariante ya estaba por cambiar no es hipotético: la importación va a
necesitar `esquema.ts` además de `registro.ts`, porque `src/db/cliente.ts`
empieza con `import "server-only"`, un paquete que resuelve a un `throw` fuera
de la condición `react-server` y por lo tanto no se puede atravesar con `node`.
Con la alternativa A, el conjunto de archivos alcanzados habría cambiado en la
misma rebanada en que se fijó la regla.

**Los `import type` quedan afuera** por tres razones, en orden de peso: Node
nunca los resuelve, así que la extensión sería información sin destinatario; la
asimetría le da un significado a la extensión —"esto existe en tiempo de
ejecución"—, que es la misma señal que el ADR 0007 le pidió a
`verbatimModuleSyntax`, y que la alternativa C borraría; y ni siquiera hacen
falta para compilar (verificado: `.ts` en un `import type` sin la bandera da
cero errores). El riesgo de la asimetría —alguien convierte un `import type` en
import de valor y se olvida de la extensión— está cubierto: en el momento en que
desaparece la palabra `type`, la regla de ESLint da error.

**Esto no afloja el ADR 0007**, que dice textualmente que sus opciones no se
aflojan para que compile algo. `TS5097` no es un chequeo de seguridad de tipos:
es un guardarraíl de **emisión**, que existe porque un `.js` emitido conservaría
un especificador apuntando a un archivo inexistente. Este proyecto nunca emite
con `tsc` —Turbopack, esbuild y Node hacen la emisión, y `noEmit: true` lo
declara—, y `./procer.ts` es estrictamente **más** información que `./procer`,
no menos. Verificado una por una: ninguna de las cinco banderas del ADR 0007
cambia de comportamiento, y con `erasableSyntaxOnly` y `verbatimModuleSyntax`
activas el árbol compila sin errores.

## Consecuencias

**Aceptamos:**
- Una convención que hay que conocer, y que se aparta de lo que la mayoría del
  ecosistema escribe. La mitiga que la haga cumplir el linter y no la memoria.
- La extensión aparece también en archivos que Node nunca va a atravesar
  —pantallas, componentes— y en los imports por alias `@/`. Es el precio de que
  la regla sea local.
- `tsc` deja de poder emitir mientras la bandera esté puesta: con
  `noEmit: false` da `TS5096`. Es un error duro y ruidoso, no una degradación
  silenciosa.

**Obtenemos:**
- El ADR 0009 se vuelve ejecutable: la cadena `registro.ts` → `procer.ts` → `zod`
  y `esquema.ts` → `drizzle-orm/pg-core` corre con `node` a secas, verificado.
- La condición se lee en la línea, sin conocer el grafo del proyecto.
- CI la hace cumplir. Sin la regla, `tsc`, Turbopack y Vitest resuelven igual con
  o sin extensión, y la única que rompe es la importación, en ejecución.
- Cero dependencias nuevas y ningún compilador agregado al camino.

**Deuda técnica asumida:**
- El alias `@/` **no funciona bajo `node`**, con extensión o sin ella: Node no lee
  los `paths` de `tsconfig`. Hoy no hay un solo `@/` en el árbol, así que no hay
  problema que resolver, y construir algo para eso ahora contradiría el
  principio de arquitectura. **Disparador:** si aparece un `@/` dentro de la
  cadena que atraviesa la importación, la salida a evaluar primero es el campo
  `imports` de `package.json` (subpath imports `#*`), que Node soporta nativo y
  que `moduleResolution: "bundler"` entiende. **No verificado.**

**Revisar si:**
- **El proyecto necesita emitir con `tsc`** (`noEmit: false`). La salida está
  verificada y es una bandera: `rewriteRelativeImportExtensions: true` acepta el
  especificador `.ts` y reescribe a `.js` en la emisión, **sin tocar el código
  fuente**.
- **Una actualización de TypeScript quita la exención de `TS5097` a los
  `import type`.** No está documentado si esa exención es especificada o
  incidental de la 5.9.3. Si cambiara, los `import type` empezarían a fallar el
  typecheck; el arreglo es agregarles la extensión, y CI lo agarra.
- **Desaparece `eslint-plugin-import` de `eslint-config-next`.** ESLint falla
  ruidosamente con "regla desconocida"; ahí se agrega como dependencia directa.

## Verificación

Con los cambios aplicados, sobre el árbol real:

- `pnpm typecheck` — sin errores.
- `pnpm lint` — sin hallazgos.
- `pnpm test` — 6 pruebas, 2 archivos, todo pasa.
- `pnpm build` — compila con **Turbopack** y genera las 3 rutas. Turbopack
  resuelve el especificador `.ts` explícito sin objetarlo, que era el riesgo
  abierto de esta decisión. `next build` y `next typegen` **no** reescriben ni
  objetan `allowImportingTsExtensions`.
- `node --input-type=module -e "await import('./src/catalogo/descriptores/registro.ts')"`
  y lo mismo sobre `src/db/esquema.ts` — ambos cargan.
- `drizzle-kit generate` — lee el esquema y reporta la tabla sin cambios.
