# 0016 — Arquitectura de la capa web

- **Estado:** Aceptado — parcialmente superseded por
  [0017](0017-nombre-del-punto-de-entrada-de-un-modulo.md), **solo** en el nombre del archivo del puerto de entrada: donde este documento dice
  `src/catalogo/index.ts`, léase `src/catalogo/catalogo.ts`. El resto —las
  once reglas y todo lo demás— sigue vigente sin cambios, y el texto de abajo
  no se edita.
- **Fecha de la decisión:** 2026-09-09
- **Fecha de este documento:** 2026-09-16 (recuperado y renumerado; ver nota)
- **Decide:** el usuario (el patrón); **redacta:** el `super-architect`

> **Nota de procedencia.** Este ADR se escribió originalmente el 2026-09-09 en
> la rama `feat/importacion-del-contenido-curado`, numerado **0015**, y lo
> redactó el `frontend-specialist`. Esa rama nunca se mergeó completa a
> `development` —solo lo hicieron por separado los PR #47 y #56, sin el
> archivo del ADR— y mientras tanto otra rama tomó el número 0015 para la
> identidad visual v2 (`0015-identidad-visual-argentum-v2.md`, hoy Aceptado).
> Resultado: esta decisión, **ya implementada en código** (el módulo
> `catalogo` tiene hoy exactamente las tres funciones que este documento
> describe), no tenía ADR vigente en el árbol. Los tickets #59 y #60 la
> señalaron como pendiente de corrección asumiendo que el archivo 0015
> seguía ahí; en realidad había que recuperarlo primero. Se recupera acá con
> el número libre siguiente, **0016**, sin reabrir el contenido de sus once
> reglas, y con las dos correcciones que pedía el #59 ya aplicadas (ver
> Regla 1/2 y la sección de Consecuencias) y su autoría resuelta: la escribe
> el arquitecto, como corresponde a un ADR (`CLAUDE.md`), tomando el borrador
> del `frontend-specialist` como insumo.

## Decisión

La arquitectura del sistema es **hexagonal (puertos y adaptadores)**, y la capa
web se organiza con **MVVM**. Lo declara el usuario, y este ADR fija qué significa
cada una de las dos cosas *en este stack*, porque las dos tienen una forma que
funciona con React Server Components y otra que rompería el producto:

- **Hexagonal:** el núcleo es el módulo (`catalogo` y los otros cuatro del
  ADR 0002); la capa web es un **adaptador de entrada**; la base es un
  **adaptador de salida**. Nada del núcleo importa Next, y nada de la web importa
  Drizzle.
- **MVVM:** cada pantalla tiene su **vista-modelo**, y es una **función pura que
  corre en el servidor** —no una clase con estado observable—. La vista es JSX
  tonto que recibe lo que la vista-modelo ya resolvió.

Más las once reglas internas de abajo, para que la primera pantalla no las decida
por acumulación.

## Contexto

El proyecto está por escribir su primera pantalla de producto. Existen el
esqueleto de Next.js 16, el descriptor de `procer`, la importación del contenido
curado, la tabla `entidad` con una fila cargada, y los tokens de la identidad
Argentum con sus dos tipografías (ticket #26, cerrado). **No existe todavía el
módulo `catalogo`** (ticket #31), y `src/app/` solo tiene el layout y una página
de arranque.

Los tickets abiertos de la primera rebanada son #31 (módulo), #32 (la ficha en
`/catalogo/<slug>`) y #33 (el índice en `/catalogo`).

Restricciones reales: un solo desarrollador, producto sin validar, cero usuarios,
sin cuentas en el MVP, y una aplicación mobile mencionada como posibilidad **a
muy largo plazo, sin fecha ni compromiso** (ADR 0002, Contexto).

## Problema

Las decisiones de estructura de una capa de interfaz no se toman: se acumulan.
La primera pantalla elige dónde vive un componente, si hay `/api`, si el
descriptor renderiza, qué se cachea y qué se prueba — y las veinte siguientes
copian. El problema concreto es que **hoy esas once decisiones cuestan cero y en
tres rebanadas cuestan una refactorización**, y ninguna está escrita.

Hay además una pregunta explícita que hay que contestar: si conviene adoptar un
patrón arquitectónico de nombre conocido (Clean, hexagonal, MVC, MVVM) para la
capa web, sobre todo pensando en una eventual aplicación mobile.

## Alternativas consideradas

### A. Adoptar un patrón con nombre en la capa web
Clean Architecture, MVC o MVVM, con sus carpetas canónicas: `controllers/`,
`viewmodels/`, `usecases/`, `entities/`, `presenters/`.

### B. Adaptador de entrega delgado sobre los módulos
La capa web no tiene arquitectura propia: es la vista del módulo. Las reglas que
la ordenan son un límite de importación, una convención de carpetas y una regla
de tipos. Ningún concepto nuevo.

### C. No decidir: que lo resuelva la primera pantalla
Escribir #32 y #33 y ver qué sale.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Hexagonal + MVVM | Vocabulario conocido y explícito; el núcleo queda aislado del framework; archivos chicos y de una sola responsabilidad, que es lo que un agente puede modificar sin leer el resto; los puertos son interfaces que se leen como un manual | Boilerplate: mapeadores, interfaces y dobles de prueba. Y dos formas mal entendidas que hacen daño: puertos que son un `interface` de una sola implementación escrito por deporte, y vista-modelos con estado que arrastran `'use client'` a toda la pantalla | Medio |
| B. Adaptador delgado sin nombre | Cero conceptos nuevos; lo que ya decidió el ADR 0002 alcanza | El orden lo sostienen reglas escritas, no una estructura que se vea sola; el vocabulario no es transferible | Bajo |
| C. No decidir | Rápido hoy | Las once decisiones se toman igual, una por una, sin quedar escritas, y la segunda pantalla las hereda sin saberlo | Alto |

## Decisión elegida

**Alternativa A: hexagonal con MVVM**, declarada por el usuario, con la
delimitación de la Regla 0 y las once reglas de abajo.

### Regla 0 — Qué es hexagonal acá, y qué es MVVM acá

El ADR 0002 ya había elegido puertos y adaptadores **sin ponerle el nombre**: un
núcleo modular, una regla de límite y un adaptador HTTP previsto para mobile. Esta
decisión lo hace explícito y le agrega MVVM en la capa web. **No supersede al
ADR 0002: le pone el vocabulario y lo lleva a la estructura de carpetas.**

**El hexágono, con sus tres piezas nombradas:**

| Pieza | Qué es acá | Quién la escribe |
| ----- | ---------- | ---------------- |
| Núcleo | `src/catalogo/` y los otros cuatro módulos: descriptores, reglas, validación y —cuando exista— autorización | `backend-specialist` |
| Puerto de entrada | La interfaz pública del módulo: `src/catalogo/index.ts` | `backend-specialist` |
| Adaptador de entrada | `src/app/**`: rutas, vista-modelos y componentes | `frontend-specialist` |
| Puerto de salida | La interfaz de persistencia que el núcleo declara y no implementa | **Sin decidir — ver abajo** |
| Adaptador de salida | La implementación con Drizzle sobre PostgreSQL | `database-specialist` / `backend-specialist` |

Dos invariantes, y son los que hacen que esto sea hexagonal y no carpetas con
nombres lindos:

1. **El núcleo no importa el framework.** Ningún archivo de `src/catalogo/`
   importa `next/*`, ni React, ni nada de `src/app/`. La flecha va en un solo
   sentido, y hoy ya es así.
2. **El adaptador de entrada no conoce el adaptador de salida.** `src/app/**` no
   importa `src/db/*` ni Drizzle. Esto deja de ser disciplina y pasa a ser una
   regla de ESLint (Regla 1).

**Lo que queda fuera de este ADR y necesita el suyo:** el **puerto de salida**. El
hexagonal completo pide que `catalogo` declare una interfaz de persistencia y que
Drizzle sea una implementación intercambiable. Eso toca el módulo, el esquema y la
importación —tres dueños, ninguno yo—, tiene un costo real de boilerplate
(interfaz, mapeadores, doble de prueba) y un beneficio real (probar el módulo sin
PostgreSQL levantado, que hoy no se puede). **Lo decide el arquitecto con el
`backend-specialist` y el `database-specialist`, en un ADR aparte** — hoy abierto
como ticket #60, sin resolver todavía. Este ADR no lo presupone ni lo contradice:
la capa web ve el puerto de entrada y nada más, así que esa decisión se puede
tomar después sin tocar una sola pantalla.

**MVVM acá: la vista-modelo es una función pura del servidor.**

| Pieza de MVVM | Qué es en este stack |
| ------------- | -------------------- |
| Modelo | `Entidad`, que devuelve el puerto de entrada ya validada y con el tipo estrecho |
| Vista-modelo | Una **función pura** por pantalla, sin JSX y sin estado, que convierte `Entidad` en lo que la pantalla necesita mostrar: orden, etiquetas, opcionales resueltos, formato |
| Vista | El componente: JSX que recorre lo que la vista-modelo devolvió y no decide nada |

**La forma que se prohíbe, y es la parte importante de esta regla:** una
vista-modelo como **clase con estado observable**, o como hook, o como cualquier
cosa que necesite `'use client'`. En este stack eso no es una variante estilística:
arrastra la pantalla entera al navegador, rompe el prerenderizado estático de la
Regla 5, mete el paquete de JavaScript que hoy no existe y convierte una página que
es HTML en una que hidrata. El estado observable de MVVM resuelve un problema
—sincronizar una vista viva con un modelo que cambia— que una ficha prerenderizada
**no tiene**. Cuando aparezca uno que sí lo tenga (el quiz, la tarjeta que se da
vuelta), ahí la vista-modelo de *esa* pantalla podrá tener estado, y va a ser un
componente de cliente chico y declarado, no la pantalla completa.

**Por qué esta forma sirve al motivo que dio el usuario.** Un agente que tiene que
cambiar cómo se ordena la ficha abre **un** archivo de sesenta líneas, sin JSX, sin
consultas y sin framework, y lo prueba con Vitest sin DOM ni base. Un agente que
tiene que cambiar cómo se ve abre el componente, que no tiene lógica. Esa es la
ganancia concreta de contexto acotado, y se obtiene con la función pura; con la
clase observable se obtiene lo contrario, porque el archivo pasa a mezclar estado,
efectos y render.

**Sobre mobile:** el ADR 0002 ya escribió la consecuencia —*"agregar `/api/v1/*`
como segundo consumidor de los mismos módulos, sin reescribir nada"*—. Con el
vocabulario de hoy: mobile es **otro adaptador de entrada** sobre el mismo puerto.
No reusa nada de `src/app/**` y no hace falta que lo haga. Lo que sí es reusable es
el núcleo, y por eso la Regla 2 —cero lógica en las pantallas— es la única
inversión que abarata ese día.

### Regla 1 — Una sola superficie de importación

`src/catalogo/index.ts` es **la** interfaz del módulo: exporta `listarPorTipo`,
`obtenerPorSlug` y `listarSlugs`, más los tipos que cruzan (`Entidad`, `Tipo`). La
capa web importa **solo** de ahí. Nunca de `src/db/*`, nunca de un archivo interno
del módulo.

**Por qué son tres y no las dos que fijó el ticket #31.** La ficha vive en
`/catalogo/<slug>`, sin el tipo en la dirección, así que para prerenderizarla hace
falta la lista de **todos los slugs de todos los tipos**, y `listarPorTipo` no la
puede dar: obliga a la capa web a recorrer los tipos, o sea a importar el registro
de descriptores, que es justo el import que este ADR prohíbe. La interfaz de dos
funciones no soporta la ruta elegida. Las salidas eran tres y las otras dos son
peores: un `listarPorTipo(tipo?)` opcional agrega un **modo** —dos operaciones
distintas con el mismo nombre— y devuelve sesenta entidades con su prosa entera
para descartar todo salvo el slug; exportar la lista de tipos le da a la pantalla
un conocimiento que no necesita y rompe el límite. Una tercera función de una línea
mantiene el módulo profundo: la capa web pide *lo que la ruta necesita* y sigue sin
saber que los tipos existen.

Firma: `listarSlugs(): Promise<string[]>`. **No** `{ slug: string }[]`, aunque sea
la forma exacta que `generateStaticParams` pide: encajar la firma del módulo en la
convención de un framework es el módulo sabiendo de Next. El `.map((slug) => ({ slug }))`
es una línea y es precisamente el trabajo del adaptador (Regla 0).

**`import 'server-only'` no alcanza para sostener esto.** Rompe el build cuando un
componente de *cliente* importa el módulo; no hace nada contra un Server Component
que importe `@/db/cliente.ts` y consulte directo. Eso compila, funciona y se
despliega. Por eso el límite se hace mecánico con dos reglas de ESLint cuyo
disparador ya está escrito en `eslint.config.mjs` y se cumple con el ticket #31:

- `no-restricted-imports` por glob: `src/app/**` no puede importar `@/db/*` ni
  `@/catalogo/*` salvo `@/catalogo/index.ts`.
- `@typescript-eslint/switch-exhaustiveness-check`, que recién tiene superficie
  cuando exista la unión discriminada por `tipo`.

No contradice al ADR 0002: hace cumplir su regla de límite, que ese ADR admite
que hoy "la sostiene la disciplina".

### Regla 2 — No hay HTTP interno, y no lo va a haber hasta que haya un segundo consumidor

**No se crea `src/app/api/`.** El default es llamar la función del módulo desde un
Server Component. Un Route Handler que serializa a JSON lo que ya está en el mismo
proceso agrega HTTP, JSON, manejo de errores y una segunda copia del contrato a
cambio de nada; con prerenderizado, además, **ni siquiera se ejecutaría en
producción**, y sería una superficie pública que deja el catálogo raspable y que
el día de la autorización es la puerta que alguien se olvida de cerrar.

Esto no es una postura de este ADR: es la deuda que el ADR 0002 ya declaró
—*"El adaptador HTTP no existe y no se va a construir hasta que haya un consumidor
real"*—.

**Server Actions: ninguna hasta que haya mutaciones.** El MVP del catálogo es
lectura pura. Consecuencia que conviene tener escrita: la primera Server Action
**no** llega con el quiz, porque `docs/decisiones-pendientes.md` §2 prohíbe
persistir progreso hasta la rebanada 5; llega con la **propuesta** de moderación.

**Cómo se verifica el módulo, entonces:** con Vitest sobre sus **tres** funciones
(corrección aplicada — ver nota de procedencia arriba: el borrador original decía
"dos", quedó desalineado con la Regla 1 cuando esta pasó de dos funciones a tres),
con `pnpm build` (que al prerenderizar ejecuta la página contra la base real) y con
el navegador. Para inspeccionarlo sin pantalla, un script `.mts`, patrón que ya
existe (`src/db/ping.mts`, `src/catalogo/importacion/importar.mts`). **Nunca un
Route Handler creado para poder curlear.**

### Regla 3 — Rutas

`src/app/catalogo/page.tsx` (índice) y `src/app/catalogo/[slug]/page.tsx` (ficha).
Sin el tipo en la URL: el slug es único global (#32). `params` es una `Promise`
(Next 15+); se tipa con el helper generado por `next typegen`,
`PageProps<"/catalogo/[slug]">`, no con un `type Props` escrito a mano — es el
idioma que ya usa `layout.tsx` con `LayoutProps<"/">`.

**Regla interina sobre colisiones.** Un índice por tipo en `/catalogo/tipo/procer`
(tres segmentos) **no** colisiona con `/catalogo/<slug>` (dos): son profundidades
distintas. El riesgo real es otro y es silencioso: un **hermano estático** a la
misma profundidad —`/catalogo/buscar`— vuelve inalcanzable para siempre a la
entidad cuyo slug sea `buscar`. Mientras no se decida:

> No se agrega ningún segmento estático hermano de `[slug]` bajo `/catalogo/`.
> Toda pantalla nueva del catálogo baja un nivel.

### Regla 4 — Server Components por defecto

`'use client'` solo con estado, efecto, evento del navegador o API del navegador,
y en el componente más chico posible. La primera rebanada tiene **cero**, con una
única excepción impuesta por el framework: **`error.tsx` es Client Component
obligatorio** (un error boundary de React necesita estado). Se dice así, y no
"cero", para que la excepción no se convierta en precedente.

### Regla 5 — Prerenderizado estático, sin Cache Components

`generateStaticParams` + prerenderizado en el build, y **`export const
dynamicParams = false`** en la ficha.

`dynamicParams` vale `true` por defecto, y con ese default un slug no
prerenderizado **abre una conexión a la base en tiempo de petición**. Con `false`:
404 sin tocar la base, la aplicación desplegada deja de consultar PostgreSQL en
runtime por completo, y una caída de Neon no voltea el catálogo. En desarrollo el
comportamiento no cambia (el 404 se aplica bajo `isProduction`), así que importar
una ficha y recargar sigue funcionando.

**No se activa `cacheComponents` (`use cache`, PPR).** No hay nada que revalidar:
el contenido cambia solo cuando alguien corre la importación, que es manual.
Encenderlo hoy obliga a fronteras de Suspense que nunca suspenden y adopta una
superficie que se renombró dos veces en dos versiones (`experimental.ppr` →
`dynamicIO` → `cacheComponents`). Migrar después es barato **por la Regla 1**: las
tres funciones del módulo toman valores serializables y devuelven JSON puro, así
que la migración futura es una línea de configuración, dos directivas `'use cache'`
y los `cacheTag` que hagan falta. Horas, no una migración.

**Regla interina:** se prerenderiza todo en el build y el contenido nuevo se
publica con un despliegue nuevo.

### Regla 6 — Estructura de carpetas

Cada ruta separa las tres piezas de MVVM en tres archivos, y esa es la estructura:

```
src/app/catalogo/
├── page.tsx                     ← ruta: pide al puerto, llama a la vista-modelo
├── vista-modelo.ts              ← función pura, sin JSX, sin framework
├── _componentes/                ← la vista: JSX sin lógica
└── [slug]/
    ├── page.tsx
    ├── vista-modelo.ts
    ├── presentacion.ts          ← el mapa total por tipo (Regla 7)
    └── _componentes/
```

`page.tsx` es la única pieza que toca Next (`params`, `generateStaticParams`,
`generateMetadata`, `notFound`). `vista-modelo.ts` **no importa nada de `next/*` ni
React**, y por eso se prueba con Vitest sin DOM ni base. `_componentes/` no importa
el puerto de entrada: recibe por props.

Co-ubicación primero. **La segunda vez que un componente se usa en otra ruta, se
promueve** a `src/app/_componentes/` — dentro de `src/app`, y no en
`src/componentes`, para que toda la capa web sea un solo glob y la Regla 1 se pueda
escribir en una línea.

Nombres en español, minúsculas con guiones, como el resto del árbol
(`marco-de-retrato.tsx`). Imports de valor **con extensión**, incluida `.tsx`
(ADR 0011); `import type` sin ella.

Los tokens `@theme` se consumen, no se tocan: son del `brand-specialist`
(ADR 0008). Ningún color, tamaño ni espaciado escrito a mano en una clase.

### Regla 7 — La ficha se arma desde el descriptor, pero no lo recorre

**El descriptor gobierna qué campos existen. La pantalla gobierna cómo se ve cada
clase de campo. El compilador une las dos cosas.** Concretamente, un mapa **total**
de presentación por tipo, en la capa web:

```ts
} satisfies Record<keyof DatosDe<"procer">, Presentacion>;
```

Las claves salen del descriptor, así que **no hay lista de campos duplicada**, que
es lo que exige el criterio de #32. Verificado compilando contra el `registro.ts`
real con la severidad del ADR 0007: si falta un campo, `TS1360`; si sobra uno que
el descriptor ya no tiene, `TS2353`; un campo opcional llega como `| undefined` y
obliga a decidir qué se muestra cuando falta. La omisión que el criterio teme es
un **error de build**, no un hallazgo visual.

**No se construye un renderizador genérico que recorra el shape de Zod**, por dos
motivos:

1. **Pelea con nuestra propia severidad.** Verificado: `Object.keys` + indexar el
   mapa es error de compilación (`TS7053`), y `Object.entries` degrada la clave a
   `string`. Iterar genéricamente obliga a reintroducir una lista de claves a mano
   —justo lo prohibido— o a escribir helpers de tipos para ahorrar siete líneas de
   JSX.
2. **La prosa épica no es un campo de tabla.** `contexto` y `semblanza` son el
   producto (ADR 0012): necesitan medida de línea, ritmo vertical y jerarquía. Un
   motor que los emite como fila de un `<dl>` convierte lo mejor del catálogo en un
   formulario.

Clases de campo, que son cuatro y no un motor: `retrato` (la imagen, con el marco
circular del sistema de diseño), `prosa` (contexto, semblanza), `dato`
(nombre completo, años, en un `<dl>`) y `oculto-en-ficha` (`resumen`, que el propio
descriptor documenta como etiqueta de listado).

**La metadata de presentación —etiqueta, orden, clase— vive en la capa web, no en
el descriptor Zod.** Zod 4 permitiría `.meta()` (existe y está documentado), así
que el rechazo es por propiedad, no por capacidad: la etiqueta es copy en
castellano, el descriptor es del `backend-specialist` y es el contrato de
validación de `contenido/` y de la importación, y hoy la flecha de dependencia va
en un solo sentido (`src/db/esquema.ts` importa del registro; el registro no
importa nada de `src/app`). Además, `docs/decisiones-pendientes.md` §3 deja
abierto si la identidad visual se bifurca con la versión para chicos: con la
presentación afuera, esa bifurcación es un segundo archivo de presentación; con la
presentación adentro, es una migración del descriptor, del contenido y de la
importación.

**Crecimiento por tipo:** ruta, `generateStaticParams`, `generateMetadata` y el 404
son genéricos y se escriben una vez; el cuerpo es una rama por tipo, estrechada por
`tipo` sobre la unión discriminada y vigilada por `noFallthroughCasesInSwitch` más
`switch-exhaustiveness-check`. Agregar un tipo cuesta **un mapa de presentación**,
no una pantalla nueva.

### Regla 8 — Estados

- **Un solo `not-found.tsx`, el global** (`src/app/not-found.tsx`). Verificado
  levantando un build de prueba: con `dynamicParams = false`, el 404 de un slug no
  prerenderizado **usa el `not-found.tsx` global y nunca el del segmento**, porque
  la página ni siquiera se ejecuta. Un `catalogo/[slug]/not-found.tsx` sería código
  muerto en producción y —peor— se mostraría en desarrollo, donde el slug
  desconocido sí cae en la página: dos 404 distintos según el entorno. Se escribe
  uno solo, con lenguaje humano y salida al índice y al inicio.
- `notFound()` se sigue llamando en la página igual, porque `obtenerPorSlug`
  devuelve `Entidad | undefined` y es lo que estrecha el tipo.
- `error.tsx` para el fallo inesperado, con `'use client'` (Regla 4). Mensaje en
  lenguaje humano: qué pasó y qué puede hacer el lector.
- Estado vacío del índice escrito a mano (#33). No merece abstracción.
- **`loading.tsx` no se agrega**, y es válido **porque** rige la Regla 5: con
  `dynamicParams = false` no hay espera que mostrar. Si algún día se vuelve al
  default, hay que reponerlo.
- **`generateMetadata` tiene que resolver el slug inexistente.** Corre antes que la
  página, así que si asume que la entidad existe revienta con una pantalla de error
  antes de que la página llegue a llamar a `notFound()`.

### Regla 9 — Pruebas de la capa web

**No se instala nada**: ni Testing Library, ni Playwright, ni jsdom. Hoy no existe
`vitest.config.ts` ni entorno de DOM, así que la puerta cuesta tres dependencias y
una configuración, no una.

La verificación es: `pnpm build` (que ejecuta la página contra la base real),
Vitest sobre el módulo, la revisión del `ui-reviewer` y el ojo del usuario.

**El agujero conocido:** el compilador caza que un campo *falte en el mapa*, no que
esté en el mapa y no llegue al JSX. Lo tapa **la vista-modelo**, sin instalar nada:
`camposDeFicha(entidad)` ordena, resuelve opcionales y descarta lo oculto, y se
prueba con el Vitest que ya está —"para esta entidad, la ficha rinde estos campos,
en este orden"—. Es la contrapartida concreta de MVVM en la Regla 0: **la única
lógica de la pantalla vive en un archivo sin JSX, sin framework y sin base, así que
es el único que necesita prueba**, y el JSX que la consume queda tan tonto que no
la necesita.

### Regla 10 — Accesibilidad, que no es decoración

Vigente después del ADR 0012: contraste AA, objetivos táctiles amplios, foco
visible siempre, `prefers-reduced-motion`, el color nunca como único portador de
significado, HTML semántico (`<button>` para actuar, `<a>` para navegar), texto
alternativo en toda imagen. Lo que envejeció es la justificación ("chicos de ocho
años"), no el requisito.

**Falta un insumo y lo aporta el `brand-specialist`:** el `@theme` no tiene token de
anillo de foco ni mínimo de objetivo táctil, y el sistema de diseño no los menciona.
Sin token, cada pantalla inventa el suyo. Se pide antes de que #33 llegue al
`ui-reviewer`, que los va a marcar igual.

## Motivo

**El patrón lo declara el usuario**, y el motivo que dio es de trabajo con agentes,
no de gusto: archivos chicos con una sola responsabilidad, y puertos escritos como
interfaces que se leen como un manual de qué entra y qué sale. Ese motivo es
correcto y esta forma lo cumple: la lógica de una pantalla queda en un archivo sin
JSX ni framework, la vista queda sin lógica, y el contrato entre capas es un solo
archivo (`src/catalogo/index.ts`) con cinco nombres.

Lo que este ADR agrega es **la delimitación**, porque los dos patrones tienen una
lectura que en este stack hace daño y hay que dejarla escrita antes de la primera
pantalla y no después de veinte: un puerto no es un `interface` de una sola
implementación escrito por deporte, y una vista-modelo con estado observable
arrastra `'use client'` y destruye el prerenderizado. La versión que queda escrita
es la que paga: separación real, cero capas vacías.

El resto —las once reglas— es el ADR 0002 aplicado a once situaciones concretas que
la primera pantalla iba a tener que resolver igual, en silencio y de a una.

Verificaciones que apoyan las reglas 3, 5 y 7, hechas contra el árbol y la doc y no
de memoria: `params` como `Promise` y el helper `PageProps` generado
(`.next/types/routes.d.ts`); `typedRoutes` en `false` por defecto en Next 16.3.4;
`dynamicParams` y su excepción en desarrollo (doc oficial y el template del runtime
de Next, vía Context7); `cacheComponents` como reemplazo de `experimental.ppr`
(guía de actualización a Next 16); los tres errores del compilador de la Regla 7,
compilados contra `src/catalogo/descriptores/registro.ts` con la severidad real del
proyecto; y la secuencia local completa —`docker compose up -d`, `pnpm db:migrate`,
`pnpm contenido:importar`, `pnpm dev`— corrida de punta a punta.

## Consecuencias

**Aceptamos:**
- **Tres archivos por pantalla en lugar de uno** (`page.tsx`, `vista-modelo.ts`,
  `_componentes/`). Es el boilerplate que el usuario ya declaró aceptable, y se
  paga en cada pantalla nueva.
- Agregar un tipo cuesta un mapa de presentación (~30 líneas), no cero. Se acepta
  porque agregar un tipo ya cuesta un descriptor y N fichas de prosa investigada:
  optimizar las treinta líneas mientras la prosa cuesta días es optimizar el número
  equivocado, y se paga con sesenta fichas idénticas.
- Una ficha recién importada **no existe hasta el próximo despliegue** (Regla 5).
- `pnpm build` depende de que la base esté viva, así que una base caída convierte
  un despliegue en un build fallido.
- Nada verifica automáticamente la salida en el DOM hasta que exista el agente de
  testing que `CLAUDE.md` ya anuncia.

**Obtenemos:**
- **Un archivo por responsabilidad**, que es el motivo declarado: cambiar el orden
  de la ficha es abrir `vista-modelo.ts`; cambiar cómo se ve es abrir el
  componente; cambiar de dónde salen los datos es abrir el puerto. Ninguna de las
  tres obliga a leer las otras dos.
- **La lógica de pantalla se prueba sin DOM, sin navegador y sin base**, porque la
  vista-modelo es una función pura. Es la parte de hexagonal que paga sola.
- Un vocabulario transferible: puerto, adaptador, núcleo, vista-modelo.
- La aplicación desplegada no consulta la base en tiempo de petición: el catálogo
  es HTML.
- El límite del ADR 0002 deja de depender de la disciplina.
- Un camino a mobile que no toca nada de esto: se le agrega `/api/v1/*` al módulo.

**Deuda técnica asumida:**
- **(Resuelto — corrección aplicada, ver nota de procedencia.)** ~~La convención
  de la ruta de la imagen queda escrita a los dos lados de la costura.~~ Decidido:
  la ruta se resuelve **una sola vez**, como **campo ya calculado dentro de
  `Entidad`** (no como una cuarta función del módulo, ni como un helper propio de
  la capa web) — dos razones: una función `rutaDeImagen(entidad)` en la interfaz
  del módulo sería una cuarta entrada donde Regla 1 fija tres con motivo explícito,
  y un campo viaja pegado al dato, así que ningún consumidor puede olvidarse de
  llamarlo. **El código de hoy todavía no implementa esta decisión**: existe
  `src/app/catalogo/ruta-de-imagen.ts`, una función en la capa web que reconstruye
  la misma convención (`<tipo>/<slug>.webp`) que ya calcula
  `src/catalogo/importacion/contenido.mts` — exactamente la duplicación que esta
  deuda señalaba. Queda como ticket nuevo, chico, para el `backend-specialist`:
  mover el cálculo a `aEntidad()` en `src/catalogo/catalogo.ts`, agregar el campo a
  `Entidad`, y simplificar `ruta-de-imagen.ts` y `ficha-procer.tsx` para que lean
  el campo en lugar de recalcularlo. No lo corta ni lo prioriza este ADR; lo corta
  el `delivery-specialist` cuando el usuario lo autorice.
- La imagen se dimensiona a mano en el `<Image>` porque la ruta se deriva en
  runtime y no hay import estático. El marco de retrato es circular, así que
  alcanza un cuadrado fijo con `object-cover`; que la imagen sea cuadrada lo
  debería validar la importación, no adivinarlo la pantalla.
- `obtenerPorSlug` se llama dos veces por ficha (metadata y página). No se
  deduplica sin una medición.

**Revisar si:**
- Aparece un segundo consumidor real (mobile, integración): se escribe el adaptador
  HTTP del ADR 0002 y **no cambia nada de este ADR**.
- Aparece contenido que cambie sin despliegue (una propuesta aprobada por
  moderación, progreso por visitante): ahí se reevalúan la Regla 5 entera y
  `cacheComponents`.
- Se pide una pantalla del catálogo que no sea una ficha: se decide la Regla 3.
- Un componente se necesita en una tercera ruta y `src/app/_componentes/` empieza a
  ser una bolsa: ahí se subdivide, no antes.
