# 0029 — Los `*.datos.ts` son la vista-modelo de la capa web

- **Estado:** Aceptado — **supersede parcialmente** al
  [ADR 0016](0016-arquitectura-de-la-capa-web.md), **solo** en la primera mitad
  de su Regla 6:
  - el árbol de carpetas con `vista-modelo.ts`, `presentacion.ts` y
    `_componentes/`;
  - el párrafo que describe esas piezas.

  Siguen vigentes del 0016:
  - de la Regla 6: la promoción a `src/app/_componentes/`, los nombres en
    español, la extensión en los imports y el consumo de tokens;
  - la Regla 0: la vista-modelo es una función del servidor, no una clase
    con estado;
  - la Regla 7: el mapa total de presentación, con su nuevo lugar fijado acá;
  - la Regla 9: la lógica de la pantalla se prueba sin DOM y sin base.
- **Fecha:** 2026-10-04
- **Decide:** el usuario; **redacta:** el `super-architect`; **revisaron:** el
  `frontend-specialist` y el `typescript-specialist`

## Decisión

La **vista-modelo** de MVVM que define el ADR 0016 es, en este repositorio, el
archivo **`<nombre>.datos.ts`**, que va al lado del componente que lo consume.
No existen archivos `vista-modelo.ts` ni carpetas `_componentes/`: la vista es
el `<nombre>.tsx` hermano.

Adentro de un `*.datos.ts` conviven dos cosas, separadas:

- **La transformación.** Funciones **síncronas** que reciben lo que devolvió el
  módulo y devuelven la forma que necesita la vista. No dependen del framework
  ni de la base, y es lo que se prueba.
- **La composición.** Una función `async` que consulta el punto de entrada del
  módulo y le pasa el resultado a la transformación, sin lógica propia.

## Contexto

La Regla 6 del 0016 prescribía, antes de la primera pantalla, estas piezas por
ruta:

- `page.tsx`, que pide al puerto;
- `vista-modelo.ts`, una función pura que recibe `Entidad`;
- `presentacion.ts`, el mapa de la Regla 7;
- `_componentes/`.

Lo que se construyó después es otra cosa, y se construyó de forma consistente:

- En `src/app/` **no hay ningún `vista-modelo.ts`, `presentacion.ts` ni
  `_componentes/`**.
- **Hay siete `*.datos.ts`**, cada uno pareado con su componente:
  - `salas-del-catalogo`, `estadisticas-catalogo` y `laminas-destacadas`, de
    la home;
  - `ficha-entidad`;
  - `tarjetas-repaso`;
  - `quiz-pregunta`;
  - `resultado-quiz`.

  Dos consultan el módulo de verdad: `salas-del-catalogo.datos.ts` llama a
  `listarPorTipo` (#88), y `estadisticas-catalogo.datos.ts` reusa ese primero.
  Los otros cinco son simulados y lo dicen en su encabezado.
- `docs/decisiones-pendientes.md` §4 ya da por establecido que «los datos de
  una pantalla viven en un `*.datos.ts`», y agrega la regla del encabezado
  simulado o real.
- `/catalogo` y `/catalogo/[slug]` no tienen `*.datos.ts`. Su `page.tsx` pide
  la entidad al puerto y se la pasa a la vista tal cual.

**Verificación hecha para este ADR** (grep sobre `src/app/**/*.datos.ts`, el
2026-10-04): **ninguno importa `next/*` ni React**, ni contiene `"use client"`
o `"use server"`. Los únicos imports son los de los dos archivos reales: el
punto de entrada `../catalogo/catalogo.ts` (ADR 0017) y otro `*.datos.ts`. No
hay deuda de importación que anotar.

## Problema

El ADR vigente describe una estructura que no existe, y la que existe no está
en ningún ADR. Quien lea el 0016 para hacer una pantalla nueva va a crear un
`vista-modelo.ts` y un `_componentes/`, y la capa web queda con dos
convenciones para lo mismo. Quien lea el código va a copiar `*.datos.ts` sin
saber qué reglas lo atan:

- si puede importar `next/navigation`;
- si puede llamar al puerto;
- cómo se prueba sin base, como pide la Regla 9;
- qué hace con un `undefined` o con una excepción del módulo.

El nombre se instaló sin contrato.

## Alternativas consideradas

### A. Hacer cumplir el 0016
Renombrar los siete `*.datos.ts` a `vista-modelo.ts`, crear `_componentes/` y
mover los componentes.

### B. Reconocer `*.datos.ts` como la vista-modelo y fijarle las reglas
Cambia el nombre, y el concepto del 0016 se conserva. Se escribe qué puede y
qué no puede tener ese archivo.

### C. No hacer nada
El 0016 sigue diciendo una cosa y el código otra.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | El ADR original queda intacto | Mueve una docena de archivos y sus imports a cambio de un nombre. Con `vista-modelo.ts` repetido en cada carpeta cuesta más buscar y leer los diffs, y una carpeta por ruta no aporta nada mientras las rutas tengan dos o tres componentes | Medio |
| **B** | No se mueve código. El nombre ya dice qué es y con qué componente va. Se conservan las reglas del 0016 que importan: sin framework, sin estado y probado sin DOM ni base | Suma un ADR a la lectura de la capa web | Bajo |
| C | — | Deja abierta una deriva entre ADR y código, que es justo lo que los ADR existen para evitar | — |

## Decisión elegida

**Alternativa B.** Un `*.datos.ts` sigue estas reglas:

1. **Nombre y lugar.**
   - Se llama `<nombre>.datos.ts` y va al lado de `<nombre>.tsx`, el
     componente que lo consume.
   - Lo llama la `page.tsx` de su ruta, o ese mismo componente si es un Server
     Component. Hoy lo hacen `estadisticas-catalogo.tsx` y
     `salas-del-catalogo.tsx`.
   - Una isla de cliente puede importar sus **tipos** con `import type`, como
     hace por ejemplo `tarjetas-repaso.tsx`, pero nunca sus valores.
   - Los componentes de la home viven en la raíz de `src/app/` porque su ruta
     es `/`. Eso es co-ubicación, no promoción.
2. **Dos piezas: transformación y composición.**
   - **La transformación** es una función **síncrona y exportada**. Recibe lo
     que devolvió el módulo (una `Entidad`, una `Entidad[]`, unos conteos) y
     devuelve la forma de la vista: orden, conteos, etiquetas, opcionales
     resueltos y formato. Toda la lógica de la pantalla vive acá.
   - **La composición** es la función `async` que la página llama, y no tiene
     lógica propia. Por ejemplo:
     `return aVista(await listarPorTipo("procer"))`.
   - Si los datos son simulados y fijos, alcanza con una constante (por
     ejemplo, `LAMINAS_DESTACADAS`).
3. **Qué no importa.**
   - React, `next/*`, ni nada que requiera `"use client"` o `"use server"`.
   - Tampoco `'use cache'` ni `next/cache`. Si algún día se cachea, va en la
     `page.tsx` o en el módulo, no acá (ADR 0016, Regla 5).
   - Tampoco `src/db/*`, que ya prohíbe la Regla 1 del 0016 con ESLint.
4. **Qué puede importar.**
   - **Valores y tipos** solo del **punto de entrada** de un módulo
     (`src/<modulo>/<modulo>.ts`, ADR 0017; hoy, por ejemplo, `Entidad` y
     `listarPorTipo`) o de otro `*.datos.ts`.
   - Nunca de un archivo interno de `src/<modulo>/**` ni de `src/db/**`, **ni
     siquiera con `import type`**. La regla `no-restricted-imports` de
     `eslint.config.mjs` no exceptúa los imports de tipo, y no se le agrega
     `allowTypeImports`.
   - **Esto cambia respecto del 0016:** allí solo la `page.tsx` pedía al
     puerto. Ahora la composición de un `*.datos.ts` también puede hacerlo, que
     es lo que ya hace `salas-del-catalogo.datos.ts`. El límite que importa no
     se mueve: la capa web habla con el módulo por su punto de entrada, nunca
     con la base.
5. **Qué expone a la vista.** Un **tipo propio de la pantalla**, no `Entidad`
   reexportada. Pasar `Entidad` ata la vista a las columnas del módulo, y el
   punto de la vista-modelo es que la vista no las conozca.
6. **Errores** (ADR 0026):
   - **Ausencia esperada.** El `*.datos.ts` la propaga: si el módulo devuelve
     `undefined`, la composición devuelve `VistaX | undefined`. La `page.tsx`
     la traduce a `notFound()`; el `*.datos.ts` no puede, porque no importa
     `next/*`.
   - **Excepciones del módulo.** No las atrapa. Convertirlas en `[]`, `0` o
     `undefined` escondería una fila corrupta que el módulo eligió hacer
     explotar (`aEntidad` en `catalogo.ts`).
   - **Resultados `{ ok: false }`.** No aplican: un `*.datos.ts` solo lee.
7. **Cuándo hace falta.**
   - Solo cuando hay algo que transformar. Si la `page.tsx` pide una entidad y
     se la pasa a la vista tal cual (hoy, las dos rutas de `/catalogo`), no se
     crea un `*.datos.ts` vacío para cumplir la forma.
   - Lo que **no** puede pasar es que la transformación quede en la
     `page.tsx` o en el `.tsx` de la vista.
8. **La vista no consulta.** El `<nombre>.tsx` no importa **valores** del
   punto de entrada de un módulo: los obtiene por su `*.datos.ts` o los recibe
   por props. Un `import type` del punto de entrada sí se permite: lo usan hoy
   `ficha-procer.tsx` y los formularios de `identidad`. Esta regla estaba en el
   párrafo del 0016 que se reemplaza, y se repone acá.
9. **Encabezado.** Dice si sus datos son simulados o reales. Es la regla
   interina de `decisiones-pendientes.md` §4, que no se repite acá.
10. **Prueba.**
    - Se prueba la **transformación**: una función síncrona que recibe una
      `Entidad` armada a mano y se prueba con Vitest, sin DOM y sin base. Es
      la Regla 9 del 0016, intacta.
    - La composición `async` no tiene lógica propia. La cubren `pnpm build`
      (que la ejecuta contra la base) y las pruebas del módulo.
    - Si alguna vez hace falta una prueba que importe el punto de entrada real,
      necesita `vi.mock("server-only")`, como `catalogo.test.ts`. También
      puede mockear el punto de entrada entero. El costo no es Docker, es
      decidir qué se mockea.

**El mapa de presentación de la Regla 7 sigue vigente; cae solo su archivo.**
`presentacion.ts` desaparece con el árbol del 0016, pero el mapa total por
tipo no. Cuando se escriba, es parte de la vista-modelo de la ficha y vive en
el `*.datos.ts` de esa ficha. Sus claves se toman del tipo que exporta el
punto de entrada (por ejemplo, `keyof Entidad<"procer">["datos"]`), no del
registro de descriptores, por la regla 4. Si el tipo del punto de entrada no
alcanza, el `typescript-specialist` lo resuelve con el
`backend-specialist`, sin abrir el registro a la capa web.

**Fuera de este ADR**, para que nadie los confunda con vista-modelos:

- Los `.ts` puros que acompañan a una isla de cliente (por ejemplo, `mazo.ts`)
  se ejecutan en el navegador.
- Los `acciones.ts` de `identidad` son Server Actions (ADR 0019): escriben,
  no leen.

Ninguno de los dos se llama `.datos.ts`.

**`src/app/catalogo/ruta-de-imagen.ts` no es una excepción, es deuda ya
declarada.** Es un helper puro, no un `*.datos.ts`, y `ficha-procer.tsx` lo
llama desde la vista, lo que va contra la regla 7. Pero el 0016 ya decidió su
destino en su deuda técnica: la ruta de la imagen pasa a ser un campo
calculado de `Entidad` dentro del módulo, y este archivo se simplifica o
desaparece. Nombrarlo como excepción legitimaría una duplicación que ya tiene
ticket previsto. Este ADR no le agrega nada más, salvo esto: mientras
exista, no se copia el patrón.

**Cómo se leen las otras menciones del 0016:**

| Donde el 0016 dice | Léase |
| ------------------ | ----- |
| `vista-modelo.ts` (Regla 0, Regla 9, Consecuencias) | `*.datos.ts`, en su función de transformación |
| «tres archivos por pantalla» | `page.tsx`, el componente y, si hay algo que transformar, su `*.datos.ts` |
| `index.ts` del módulo (Regla 1 y otras) | `<modulo>.ts`, ya fijado por el ADR 0017 |

## Motivo

El 0016 decidió dos cosas que siguen siendo correctas:

- que la lógica de una pantalla viva en un archivo sin framework ni JSX;
- que ese archivo se pruebe sin DOM y sin base.

Lo que no acertó fue el nombre y la carpeta, y el código eligió otro nombre de
forma consistente en siete pantallas. Cuando la práctica es coherente y no
viola ningún invariante, se escribe la práctica. Reescribir el código para que
coincida con un nombre sería mover archivos sin cambiar ninguna propiedad del
sistema.

La separación entre transformación y composición es lo que permite que la
vista-modelo consulte al puerto sin perder lo que el 0016 ganaba con la
función pura. La lógica sigue en una función que se prueba con un objeto armado
a mano. La consulta queda en una línea que no tiene nada que probar. Y no hace
falta un archivo más: las dos piezas conviven en el mismo `*.datos.ts`.

## Consecuencias

**Aceptamos:**
- **La composición `async` no es pura.** La transformación sí lo es, y es lo
  que se prueba.
- Cada `*.datos.ts` real lleva dos funciones donde hoy tiene una.
- La lectura de la capa web suma un ADR más.

**Obtenemos:**
- El ADR y el código dicen lo mismo, sin mover un archivo.
- Una pantalla nueva tiene una sola convención, con reglas escritas para los
  imports, los errores y la prueba.
- La Regla 9 del 0016 se sigue cumpliendo tal cual: la lógica se prueba sin
  base.

**Deuda técnica asumida:**
- **Los dos `*.datos.ts` reales no separan todavía transformación de
  composición, y ninguno tiene prueba.** `salas-del-catalogo.datos.ts` mezcla
  la consulta con el conteo y la suma que comparten la home y las salas. Queda
  para un ticket chico del `frontend-specialist`: extraer la transformación
  síncrona y probarla. Lo corta el `delivery-specialist` cuando el usuario lo
  autorice.
- **`ruta-de-imagen.ts`**: ver arriba. Es la deuda que ya declaró el 0016.
- **La regla 3 la sostiene la disciplina, no una herramienta.** Hay una red
  parcial: `catalogo.ts` importa `server-only`, así que un `*.datos.ts` real
  que una isla de cliente importara por valor rompería el build. Para los
  imports de `next/*` o React no hay red, y como hoy ningún archivo viola la
  regla, mecanizarla no resolvería ningún problema presente.

**Revisar si:**
- Aparece un `*.datos.ts` que importe `next/*` o React. Ahí se agrega a
  `no-restricted-imports` un patrón para `src/app/**/*.datos.ts`, igual que el
  0016 hizo con `src/db/*`.
- Una pantalla necesita una vista-modelo con estado. El 0016, Regla 0, ya lo
  prevé: eso es una isla de cliente, no un `*.datos.ts`.
