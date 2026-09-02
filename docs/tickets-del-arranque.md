# El arranque: diez cimientos publicados

**Estado: publicado.** Los diez cimientos del arranque viven como issues de
GitHub, **[#5 a #14](../../issues)**, y el tracker es la fuente de verdad: el
cuerpo completo de cada ticket —alcance, decisiones cerradas, advertencias y
criterios de aceptación— está en su issue, no acá.

Este archivo queda como **índice y memoria del corte**: el mapa de un vistazo, el
razonamiento que llevó al punto mínimo, y las dos cosas que **no** se publicaron.

El corte lo hizo el `delivery-specialist`, que es su dueño, sobre un alcance y
unas decisiones del arquitecto. Las decisiones técnicas están cerradas; **el
orden y el tamaño de los pedazos son suyos**.

Todo lo que sigue son **cimientos**, no rebanadas (`CONTEXT.md`): no atraviesan
capas porque todavía no hay capas, y se verifican porque el proyecto compila,
arranca o corre.

> **Los números empiezan en #5, no en #1.** En GitHub los issues y los pull
> requests comparten el mismo contador, y este repositorio ya tenía cuatro PR
> cuando se publicó el corte. Cualquier `#1`–`#4` que aparezca en un cuerpo
> apunta a un PR, no a un cimiento.

---

## El punto mínimo

**[#5](../../issues/5) — el esqueleto de Next.js 16 que compila, y nada más.** Ocho archivos:
`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`,
`next.config.ts`, `.nvmrc`, `src/app/layout.tsx`, `src/app/page.tsx`. Sin
Tailwind, sin linter, sin pruebas, sin base de datos, sin contenido de
demostración.

**El comando que lo verifica:** `pnpm install && pnpm build` termina en 0.

**Por qué no puede ser más chico.** Una aplicación Next.js que compila es
atómica: sacale `package.json` y no instala nada; sacale `src/app/layout.tsx` y
`next build` falla, porque el App Router exige un layout raíz; sacale
`src/app/page.tsx` y no existe ninguna ruta; sacale `tsconfig.json` y Next lo
regenera solo, con lo cual el commit deja de ser reproducible. **No hay
subconjunto propio de esos archivos que se verifique con un comando.**

**Por qué no puede ser más grande.** El criterio objetivo para separar
intenciones es el comando de verificación: si `pnpm build` no lo ejercita, es
otro cimiento. El caso más claro es un hecho verificado, no una opinión —
**Next.js 16 eliminó `next lint` y la opción `eslint` de `next.config`**, así que
el build ya no ejecuta el linter ni aunque esté instalado.

> **La regla que usamos para cortar:** un cimiento es mínimo cuando su comando de
> verificación **falla** si le sacás cualquier archivo, y **no cambia** si le
> agregás lo siguiente.

**Hallazgo que rompe el camino obvio.** `create-next-app` **se niega a correr en
esta raíz**: su lista de archivos tolerados incluye `.claude`, `.git`,
`.gitignore` y `docs`, pero no `.agents/`, `.mcp.json`, `CLAUDE.md`,
`CONTEXT.md`, `README.md` ni `skills-lock.json`. Son seis conflictos y aborta. El
esqueleto se genera aparte y se copia a mano.

---

## El mapa

| # | Cimiento | Bloqueado por | Prioridad | Lo toma |
| - | -------- | ------------- | --------- | ------- |
| [#5](../../issues/5) | Esqueleto de Next.js 16 que compila | — | camino crítico | usuario (genera), después `backend-specialist` |
| [#6](../../issues/6) | PostgreSQL 18 local en Docker | — | camino crítico | `database-specialist` |
| [#7](../../issues/7) | Desplegado y alcanzable desde internet | #5 | camino crítico | **usuario** (credenciales de Vercel) |
| [#8](../../issues/8) | Severidad del compilador (ADR 0007) | #5 | camino crítico | `backend-specialist` + `typescript-specialist` |
| [#9](../../issues/9) | Tailwind v4 conectado, sin tokens | #5 | camino crítico | `frontend-specialist` |
| [#10](../../issues/10) | Vitest con una prueba que corre | #5 | antes de la primera rebanada | `backend-specialist` |
| [#11](../../issues/11) | Drizzle conectado a la base local | #5, #6 | camino crítico | `database-specialist` |
| [#12](../../issues/12) | Tabla `entidad` y primera migración | #11 | camino crítico | `database-specialist` |
| [#13](../../issues/13) | Neon, conectado al despliegue | #6, #7, #12 | camino crítico | **usuario** (credenciales de Neon) |
| [#14](../../issues/14) | Linter con su propio comando | #5 + decisión pendiente | cuando se pueda | sin asignar |

```
#5 esqueleto ─────┬──► #7 despliegue ───────────┐
(sin bloqueantes) ├──► #8 severidad             │
                  ├──► #9 tailwind              │
                  ├──► #10 vitest               │
                  ├──► #14 linter (+ decisión)  │
                  │                             │
                  └──┐                          │
                     ├──► #11 drizzle ──► #12 tabla ──► #13 neon
#6 docker ───────────┘                                    ▲
(sin bloqueantes) ─────────────────────────────────────────┘
```

**Hay dos puntos de arranque, no uno.** El #5 y el #6 no tienen bloqueantes y
pueden ir en paralelo. El #6 es además el pedazo más chico del proyecto: dos
archivos, sin instalar nada, sin depender de JavaScript.

El orden de entrega recomendado es #5, #6, #7, #8, #9, #10, #11, #12, #13, #14 —
pero eso es **orden de entrega, no dependencia**. Se reparte un ticket por vez
sobre el mismo árbol de trabajo, así que el orden importa aunque el grafo sea
más ancho.

**Advertencia de secuencia:** el #7 no arranca hasta que el commit del #5 esté
**en el remoto**. Vercel construye desde GitHub, no desde el árbol local.

**Dos tickets no se cierran contra un sha**, y es deliberado: el #7 y el #13 se
resuelven en paneles web y pueden no producir ningún commit. Su rastro es el
propio issue, con la URL y el sha verificados en un comentario. *Nada entra al
historial sin un ticket* no implica que todo ticket entre al historial.

---

## Esquema de prioridad

**Prioridad sí, etiquetas todavía no.** Cada ticket sale con prioridad asignada,
como se pidió, pero **como una línea de texto en el cuerpo**, al lado de
`Bloqueado por`. Tres motivos:

1. En una cadena de cimientos el grafo ya es casi toda la prioridad. Una
   etiqueta que repite lo que el grafo dice es un segundo lugar donde vive la
   misma información, y dos fuentes se desincronizan: el día que se mueva una
   dependencia, la etiqueta miente.
2. Ningún agente puede crear etiquetas, así que el esquema agregaría una ida y
   vuelta al arranque.
3. El principio del proyecto pide una razón concreta y presente. Con diez
   tickets, filtrar no es un problema: leerlos de un vistazo alcanza. El
   disparador para las etiquetas es que la lista deje de leerse de una pantalla.

**Pero el grafo solo no alcanza, y por eso el campo igual sirve:** el grafo dice
qué se *puede* empezar, no qué *conviene*. Vitest y el linter tienen un solo
bloqueante cada uno, así que por el grafo parecen tan disponibles como el
despliegue, y no lo son.

| Prioridad | Qué significa |
| --------- | ------------- |
| **camino crítico** | Está en la cadena que lleva a la aplicación desplegada con base. Si se frena, se frena el proyecto. |
| **antes de la primera rebanada** | No bloquea el despliegue, pero tiene que estar antes de que se escriba código de producto. |
| **cuando se pueda** | Mejora el terreno y no bloquea a nadie. |

Si igual se quieren las etiquetas, **las crea el usuario**:

```bash
gh label create "camino-critico" --color b60205 \
  --description "Bloquea el despliegue o la base: si se frena, se frena el proyecto"
gh label create "antes-de-la-primera-rebanada" --color d93f0b \
  --description "No bloquea el despliegue, pero va antes del primer codigo de producto"
gh label create "cuando-se-pueda" --color 0e8a16 \
  --description "Mejora el terreno y no bloquea a ningun otro ticket"
```

---

# Lo que quedó sin publicar

Dos cosas que salieron del corte y **no** son issues todavía. Cuando se
publiquen van a recibir números nuevos, así que ningún cuerpo las referencia por
número.

## Tokens visuales de Tailwind v4

```
Bloqueado por: #9 (Tailwind)
Prioridad: antes de la primera rebanada
Lo toma: visual-design-specialist
```

Paleta, tipografía, escala de espaciado, contraste y tamaño mínimo de objetivo
táctil, en un bloque `@theme`. La aplicación la usan chicos, así que el contraste
y el tamaño táctil no son un detalle de acabado.

Los tokens se definen una vez, **antes de la primera pantalla**, o el sistema
visual queda como residuo de lo primero que alguien escribió.

---

## Registrar la decisión de imágenes y sus disparadores

```
Bloqueado por: nada
Prioridad: cuando se pueda
Lo toma: arquitecto. Es una nota, no trabajo de código: hoy no hay ninguna imagen.
```

Las imágenes de las fichas van en **`public/imagenes/`** durante el MVP. Es
coherente con el ADR 0004 —las imágenes *son* contenido curado y tienen que tener
historial, revisión y vuelta atrás igual que el texto— y cuesta cero
configuración.

**No lleva ADR:** revertirlo es una entrada de `images.remotePatterns`, un `sed`
sobre los archivos de contenido y una reimportación. El ADR se escribe el día que
se elija el almacenamiento externo, que ahí sí tiene alternativas reales — y el
ADR 0006 ya descartó el almacenamiento propietario de Vercel, así que la salida
no es Vercel Blob por defecto.

Lo que hay que dejar escrito **no es la decisión, es el disparador**, porque el
modo de falla no es "elegimos mal" sino "nadie se dio cuenta de que se cruzó el
umbral":

- **El disparador duro:** el día que un usuario suba una imagen en una propuesta.
  No es crecimiento, es imposibilidad estructural: `public/` se materializa en el
  build, así que un archivo escrito en runtime no existe para la aplicación. Ya
  está en el plan del producto (`moderacion`).
- **Umbrales medibles**, por si esa fase se atrasa: `du -sh public/imagenes`
  > 100 MB; `git count-objects -vH` con `size-pack` > 250 MB; más de 150
  imágenes; o la segunda vez que alguien pida corregir una imagen y la respuesta
  sea "hace falta un deploy".
- **Disciplina:** optimizar las imágenes **antes** de commitear. Git guarda
  binarios para siempre y no los deltifica bien; recortar la misma imagen dos
  veces la deja tres veces en el historial, y eso no se recupera sin reescribir la
  historia.
- **Revisar `sharp`:** el `pnpm-workspace.yaml` del #5 trae
  `allowBuilds: {sharp: false}`, así que el optimizador de imágenes no se compila
  localmente. Es irrelevante hoy y hay que reevaluarlo cuando existan imágenes.

Dos cosas gratis hoy y caras después, que van al descriptor cuando exista: el
campo de imagen se valida como `z.string().min(1)` **sin** validar la forma de la
ruta (una validación `.startsWith('/')` hay que sacarla el día de la mudanza), y
**texto alternativo obligatorio al lado de la imagen desde el primer día** —
agregarlo después significa volver sobre las 60 fichas ya escritas.

Lo que **no** hay que hacer: un *helper* que componga la URL a partir de un nombre
de archivo. Es la capa de indirección preventiva que ahorra un `sed` y a cambio
hace que la ruta no se pueda leer del contenido.

---

# Lo que corre el usuario a mano

## 1. Generar el esqueleto (paso previo del #5)

Banderas verificadas contra el `create-next-app` real, no de memoria. Juntas dan
exactamente los archivos esperados y ninguno de demostración:

```bash
cd /tmp
rm -rf esqueleto-argentum
pnpm dlx create-next-app@latest esqueleto-argentum \
  --ts --app --src-dir --empty \
  --no-tailwind --no-eslint --no-agents-md \
  --import-alias "@/*" \
  --use-pnpm --disable-git --yes
```

## 2. Copiar solo lo que se conserva

Uno por uno **a propósito**: un `cp -r` del directorio entero pisaría el
`.gitignore` y el `README.md` escritos a mano.

```bash
cd "$(git rev-parse --show-toplevel)"   # la raíz del repositorio
cp /tmp/esqueleto-argentum/package.json        .
cp /tmp/esqueleto-argentum/pnpm-lock.yaml      .
cp /tmp/esqueleto-argentum/pnpm-workspace.yaml .
cp /tmp/esqueleto-argentum/tsconfig.json       .
cp /tmp/esqueleto-argentum/next.config.ts      .
mkdir -p src/app
cp /tmp/esqueleto-argentum/src/app/layout.tsx  src/app/
cp /tmp/esqueleto-argentum/src/app/page.tsx    src/app/
echo "22" > .nvmrc
```

## 3. Comprobar que no se coló nada

```bash
git status --short
```

Deberían verse los 8 archivos nuevos más los 14 de rondas anteriores. **Si aparece
`README.md` o `.gitignore` como modificados, algo se pisó.**

## 4. Instalar y confirmar

```bash
pnpm install && pnpm build
```

A partir de acá el `backend-specialist` toma el [#5](../../issues/5) y lo termina.

## 5. Después

- **[#7](../../issues/7):** pushear el commit del #5 y conectar el repositorio
  en el panel de Vercel.
- **[#13](../../issues/13):** crear el proyecto en Neon (confirmar PostgreSQL 18)
  y cargar las dos cadenas como variables de entorno en Vercel.
- **Opcional:** los tres `gh label create` de la sección de prioridad.
