# 0007 — Severidad del compilador de TypeScript

- **Estado:** Aceptado
- **Fecha:** 2026-09-01
- **Decide:** Luciano Melo Claps

## Decisión

Sobre el `tsconfig.json` que genera `create-next-app` —que trae `strict: true`—
se agregan **cinco** opciones: `noUncheckedIndexedAccess`, `erasableSyntaxOnly`,
`verbatimModuleSyntax`, `noImplicitReturns` y `noFallthroughCasesInSwitch`.

Se rechazan explícitamente, con su disparador, `exactOptionalPropertyTypes`,
`noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noUnusedLocals` y
`noUnusedParameters`.

La configuración se fija **antes de escribir la primera línea de código de la
aplicación**, y ese momento es parte de la decisión.

## Contexto

El proyecto tiene **cero líneas de código**. El [ADR 0003](0003-stack-nextjs-postgresql.md)
fijó Next.js 16, React 19 y TypeScript; el [ADR 0005](0005-acceso-a-datos-drizzle.md)
eligió Drizzle apoyándose en que tipa la columna `JSONB` en compilación.

Tres decisiones previas apoyan su cumplimiento sobre el compilador:

1. El [ADR 0001](0001-modelo-de-entidad-unica-con-jsonb.md) pone los atributos de
   cada tipo en un **descriptor** en código, no en la base. La base **no valida
   nada** de lo que entra en `datos`.
2. El [ADR 0005](0005-acceso-a-datos-drizzle.md) eligió Drizzle explícitamente
   porque `jsonb().$type<Datos>()` sostiene ese tipado. Su propio texto lo dice:
   si `datos` sale como `any`, *"el descriptor deja de proteger al código que
   lee"* y **la decisión 0001 se vacía de contenido**.
3. El [ADR 0002](0002-monolito-modular-un-solo-deploy.md) admite que la regla de
   límite *"la sostiene la disciplina, no la red"*, y confía en `server-only`
   para **detectar violaciones en compilación**.

Tres ADR delegan su cumplimiento en el compilador. Cuánto revisa el compilador
dejó de ser una preferencia de estilo.

Un hecho más, que fija el momento: hoy activar cualquiera de estas opciones
cuesta **cero errores**, porque no hay código.

## Problema

Con qué severidad revisa el compilador, y **cuándo se decide**.

El problema no es "elegir buenas opciones". Es que esta decisión tiene una
**curva de costo invertida**: activar una opción estricta con cero líneas
escritas cuesta nada; activarla con cinco mil líneas cuesta un día de arreglos y
un diff que nadie quiere revisar. En la práctica, lo que no se activa hoy no se
activa nunca — no porque se haya decidido que no, sino porque el momento barato
pasó y nadie vuelve.

Postergar esto no es neutral: **es decidir que no, sin escribirlo.**

## Alternativas consideradas

### A. La plantilla tal cual (`strict` y nada más)
Aceptar lo que genera `create-next-app` y no tocar nada. Es lo que hace la
mayoría de los proyectos.

### B. Severidad máxima
Todas las opciones de severidad que ofrece TypeScript, incluidas
`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`,
`noUnusedLocals` y `noUnusedParameters`.

### C. Cinco opciones elegidas por el error concreto que atrapan
Cada una justificada por un modo de falla nombrado de **este** producto.

### D. Posponer y ajustar cuando duela
Arrancar con el default y endurecer cuando el proyecto tenga forma.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Solo la plantilla | Cero trabajo y cero fricción; es el default conocido | `strict` **no** cubre el acceso por índice: `filas[0].nombre` compila y rompe en la primera ficha con un *slug* inexistente. Nada impide un `enum Tipo` que duplique el discriminador del ADR 0001. El import de valor al esquema de Drizzle desde el cliente es invisible en el código | **Alto**: es la opción que se adopta por omisión y de la que después no se sale |
| B. Severidad máxima | Máxima red de seguridad | Mezcla *lint* con tipos: `noUnusedLocals` hace fallar `tsc` mientras escribís, y eso enseña a ignorar la salida del compilador. `exactOptionalPropertyTypes` **no protege los tipos que infiere Zod**, que son la mayoría de los tipos del proyecto, y sí fricciona con los tipos de inserción de Drizzle. `noPropertyAccessFromIndexSignature` obliga a `process.env['X']` en todo el proyecto | Trivial |
| C. Cinco elegidas | Cada opción se paga con un error concreto que este producto va a cometer; la fricción se acota a lo que vale | Hay que justificar opción por opción, y una elección de más se paga en cada archivo | Trivial (bajar una opción es una línea) |
| D. Posponer | Coherente con "no anticipar problemas que no existen" | Es la única alternativa **cara**: el costo no es de la decisión, es del momento, y crece con cada línea. Es la misma combinación —"cara de retrasar, barata de tomar"— con la que el ADR 0005 decidió el ORM rápido | Alto, y creciente |

## Decisión elegida

**Alternativa C.** Cinco opciones sobre `strict`:

| Opción | Qué error concreto atrapa **en este proyecto** |
| ------ | --------------------------------------------- |
| `noUncheckedIndexedAccess` | Indexar una lista devuelve `T \| undefined`. El caso presente y concreto es la **ficha**: una consulta por *slug* devuelve `Entidad[]`, y sin esta opción `filas[0].nombre` compila — con un *slug* inexistente el chico ve un 500 donde correspondía un 404. El segundo caso es el armado de **distractores** del quiz, que indexa una lista de otras entidades del mismo tipo. |
| `erasableSyntaxOnly` | Prohíbe `enum`, `namespace` con runtime, propiedades de parámetro e `import =`. Dos efectos: los `.ts` de herramienta —`drizzle.config.ts`, el script de **importación** del ADR 0004— se ejecutan con `node` pelado, sin `tsx` ni paso de build, **una dependencia menos**; y un `enum Tipo` queda prohibido, con lo cual el discriminador solo puede derivarse del registro de descriptores, que es lo que el ADR 0001 exige. |
| `verbatimModuleSyntax` | Obliga a marcar `import type`. El ADR 0002 apoya su regla de límite en `server-only`, que falla **en runtime**, cuando el módulo ya entró al grafo del cliente, y no dice por qué entró. Con esta opción, lo que no dice `type` se emite y punto: el import de valor que cruza la costura servidor/cliente **se lee en el diff** en vez de depender de reglas de elisión que nadie tiene en la cabeza. |
| `noImplicitReturns` | Es lo más parecido a exhaustividad sobre el `switch (entidad.tipo)` que se consigue con una opción. Si al switch le falta un caso, hay un camino que devuelve `undefined` y deja de compilar. Agregar un tipo de entidad y olvidarse del renderizador de la ficha **rompe el build**: es la promesa del ADR 0001 sostenida por el compilador y no por la memoria. |
| `noFallthroughCasesInSwitch` | Un `case` que se cae al siguiente. **Es la más floja de las cinco** y hay que decirlo: con `case 'procer': return <FichaProcer/>` no se dispara nunca. Entra porque el `switch` sobre `tipo` es la estructura de control central del catálogo y el seguro cuesta cero. Si hubiera que recortar, es la primera que sale. |

**Se rechazan, con disparador:**

| Opción | Por qué no | Disparador |
| ------ | ---------- | ---------- |
| `exactOptionalPropertyTypes` | **No protege lo que importa.** Zod infiere la forma laxa —`{ campo?: T \| undefined }`, con el `\| undefined` explícito—, así que un `Datos` derivado de un descriptor sigue aceptando `{ fechaDeMuerte: undefined }` con la opción prendida. Paga fricción con los tipos de inserción de Drizzle a cambio de no cubrir el camino principal | Que `moderacion` implemente **propuestas de modificación parciales**, donde "clave ausente" y "clave en `undefined`" signifiquen cosas distintas. Y el aviso que va con el disparador: la primera respuesta ahí **no es prender la opción**, es modelar la ausencia explícitamente en el descriptor de la propuesta |
| `noPropertyAccessFromIndexSignature` | Obliga a `process.env['DATABASE_URL']` en todo el proyecto. Fricción alta, valor nulo acá | Ninguno a la vista |
| `noImplicitOverride` | Solo aplica a herencia de clases, y este stack —Drizzle, Zod, componentes de función— no tiene ninguna | Ninguno a la vista |
| `noUnusedLocals`, `noUnusedParameters` | No son seguridad de tipos, son higiene. En el compilador hacen fallar `tsc --noEmit` mientras el código está a medio escribir, y eso **enseña a ignorar la salida del compilador**, que es lo contrario de lo que esta decisión busca | El cimiento del linter. Van ahí, como advertencia |

**Alcance:** un solo `tsconfig.json` en la raíz, para todo el repositorio. Las
cinco opciones van comentadas en el archivo con una línea cada una — Next.js
serializa el `tsconfig.json` con `comment-json`, así que los comentarios
sobreviven a que la herramienta lo reescriba.

## Motivo

**El argumento principal es el momento, no las opciones.** Cualquiera de las
cinco es defendible a solas; lo que no se recupera es el día en que activarlas
cuesta cero. Esta es una de las pocas decisiones del proyecto donde *decidir
tarde* es estrictamente peor que *decidir mal*: si elegimos de más, se baja una
opción en una línea; si no elegimos, en seis meses el costo de entrada ya es
prohibitivo y la decisión quedó tomada por omisión. Por eso la alternativa D es
la única que se descarta de plano: es la que se ve barata y no lo es.

**Sobre la objeción obvia, que hay que responder de frente.** El
[índice de estos ADR](README.md) dice que *no* se escriba un ADR para decisiones
reversibles con bajo costo, y nombra Tailwind, pnpm y Vitest. Bajar una opción
del `tsconfig.json` es, literalmente, una línea. ¿Por qué esto lleva ADR?

Porque **el ADR no registra qué está prendido: eso ya lo dice el archivo, que
está versionado y admite comentarios.** El ADR registra **qué se rechazó, por
qué, y bajo qué condición se revisa**, y eso en un archivo de configuración no
se puede escribir. No hay forma de que el `tsconfig.json` diga
"`exactOptionalPropertyTypes` está apagada a propósito porque Zod infiere la
forma laxa y la distinción solo importa en propuestas de modificación". Sin eso,
en seis meses alguien la prende porque "es más seguro", o —peor— apaga
`noUncheckedIndexedAccess` porque le molestó una vez, y nadie sabe qué se perdió.

De ahí una condición sobre este propio documento: **si el ADR se escribiera sin
la tabla de rechazos y sus disparadores, no valdría la pena escribirlo.** Esa
tabla es el ADR; el resto es contexto.

**Sobre el hecho incómodo:** ninguno de estos errores existe hoy, porque no hay
código. Es anticipación, y el principio del proyecto dice que no se anticipa. La
excepción se justifica por la curva de costo invertida: es el único caso del
proyecto donde esperar a tener el problema garantiza no poder resolverlo. Donde
esa curva **no** está invertida —el linter, el almacenamiento de imágenes, el
adaptador HTTP del ADR 0002— seguimos esperando.

**Verificado** contra el código fuente de Next.js en el tag `v16.2.9`
(`packages/create-next-app/templates/app-empty/ts/tsconfig.json` y
`packages/next/src/lib/typescript/writeConfigurationDefaults.ts`):

- La plantilla genera `strict: true` y nada más allá de eso.
- Next.js **nunca borra** opciones que no conoce: las cinco sobreviven.
- Ninguna de las cinco está en la lista de opciones que Next.js sobrescribe.
- Poner `verbatimModuleSyntax: true` hace que Next.js **deje de exigir**
  `isolatedModules`: no pelean.
- `erasableSyntaxOnly` requiere **TypeScript ≥ 5.8**.

## Consecuencias

**Aceptamos:**
- Hay que chequear `filas[0]` antes de usarlo, incluso cuando "sabemos" que hay
  una fila. Es el costo más alto de los cinco.
- Hay que escribir `import type` explícito en todo import de solo tipos.
- Nada de `enum`, `namespace`, propiedades de parámetro ni `import =`. Ninguno
  está en uso ni previsto.
- **El `tsconfig.json` de la raíz no puede usar `extends` ni `references`.** Si
  los usa, Next.js abandona su configuración automática y deja de agregar el
  plugin `next` y los tipos generados de rutas — en silencio. Es una restricción
  que hay que respetar el día que se quiera un `tsconfig` aparte para
  herramientas.
- `erasableSyntaxOnly` impone un piso de TypeScript 5.8, así que el
  `package.json` declara `typescript: "^5.9"` en vez del `^5` de la plantilla, y
  esa línea va **en el mismo commit** que las opciones: separarlas dejaría un
  commit intermedio donde la opción puede no estar soportada.

**Obtenemos:**
- La ficha de un *slug* inexistente pasa de ser un error de runtime a un caso
  que el compilador obliga a manejar.
- Olvidar un caso al agregar un tipo de entidad deja de compilar: la promesa del
  ADR 0001 pasa de intención a verificación.
- Una sola fuente de verdad para `tipo`, por construcción.
- El límite del ADR 0002 con una protección visible en el código fuente y no
  solo declarativa.
- Los `.ts` de herramienta se ejecutan con `node` sin dependencias ni build.
- La decisión tomada en el único momento en que cuesta cero.

**Deuda técnica asumida:**
- `exactOptionalPropertyTypes` queda apagada y su curva de costo también se
  invierte con el tiempo. Se mitiga con una **convención**: las propiedades
  opcionales que escribamos a mano se declaran `campo?: T | undefined`, que es
  la forma que ya usan `@types/react` y Zod. Con esa convención sostenida,
  prenderla más adelante deja de ser caro — y por eso el rechazo no cae en la
  trampa del "ahora o nunca" que justifica a las otras cinco.

**Revisar si:**
- `moderacion` implementa propuestas de modificación parciales (ver disparador).
- Aparece una dependencia cuyos `.d.ts` sean incompatibles con
  `verbatimModuleSyntax`. Si pasa, se baja **esa** opción y se escribe el ADR
  que supersede esta parte, con el error concreto que la obligó.
- Alguna opción empieza a generar supresiones repetidas (`@ts-expect-error`,
  `!`): esa es la señal de que atrapa ruido y no errores.
- Alguien propone bajar una de las cinco. No se baja en silencio: se supersede
  este ADR, con el caso concreto que lo motivó.

## Comprobado

**Las dos comprobaciones que quedaban pendientes se hicieron, y las dos dieron
lo esperado.** Se verificaron con el compilador contra el código del #27 —el
registro de descriptores y el descriptor de `procer`, commit `3913516`—, que es
justamente el caso que motivaba la duda. La decisión de arriba queda como está:
esta sección solo registra el resultado, no la cambia.

Las dos afirmaciones eran estas, y en su momento se apoyaban en documentación y
en lectura del código fuente, **no en una corrida del compilador**, porque
cuando se escribió este ADR no había TypeScript instalado:

1. Que `noUncheckedIndexedAccess` **no** afecta a un `Record<UniónDeLiterales, X>`
   —es decir, que el registro de descriptores del ADR 0001, que es el lugar donde
   más se indexa en todo el sistema, no paga fricción—. Si resultara falso, hay
   que reevaluar la opción.
2. Que Zod infiere la forma laxa `{ campo?: T | undefined }`, que es la base del
   rechazo de `exactOptionalPropertyTypes`. Está en la documentación de Zod, pero
   no se compiló.
