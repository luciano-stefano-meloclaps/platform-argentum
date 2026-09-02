# Tickets del arranque — borrador, sin publicar

**Estado: borrador para aprobar. Nada de esto existe todavía en GitHub.**
`gh issue list` está vacío: estos van a ser los primeros tickets del proyecto.

El corte lo hizo el `delivery-specialist`, que es su dueño, sobre un alcance y
unas decisiones del arquitecto. Las decisiones técnicas están cerradas; **el
orden y el tamaño de los pedazos son suyos**.

Todo lo que sigue son **cimientos**, no rebanadas (`CONTEXT.md`): no atraviesan
capas porque todavía no hay capas, y se verifican porque el proyecto compila,
arranca o corre.

---

## El punto mínimo

**Ticket 1: el esqueleto de Next.js 16 que compila, y nada más.** Ocho archivos:
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

## Orden y dependencias

El grafo **no es una cadena**: 2, 3, 4, 5 y 6 dependen todos solo del 1 y no
entre sí.

| # | Cimiento | Bloqueado por | Prioridad | Lo toma |
| - | -------- | ------------- | --------- | ------- |
| 1 | Esqueleto de Next.js que compila | — | camino crítico | usuario, después `backend-specialist` |
| 2 | Desplegado y alcanzable desde internet | #1 | camino crítico | **usuario** (credenciales) |
| 3 | Severidad del compilador (ADR 0007) | #1 | camino crítico | `backend-specialist` + `typescript-specialist` |
| 4 | Tailwind v4 conectado, sin tokens | #1 | camino crítico | `frontend-specialist` |
| 5 | Vitest con una prueba que corre | #1 | antes de la primera rebanada | `backend-specialist` |
| 6 | PostgreSQL 18 local en Docker | #1 | camino crítico | `database-specialist` |
| 7 | Drizzle instalado y conectado | #6 | camino crítico | `database-specialist` |
| 8 | Tabla `entidad` y primera migración | #7 | camino crítico | `database-specialist` |
| 9 | Neon conectado al despliegue | #2, #8 | camino crítico | **usuario** (credenciales) |
| 10 | Linter con su propio comando | #1 + decisión pendiente | cuando se pueda | sin asignar |
| 11 | Tokens visuales `@theme` | #4 | antes de la primera rebanada | `visual-design-specialist` |
| 12 | Imágenes en `public/imagenes/` y sus disparadores | — | cuando se pueda | arquitecto (es una nota) |

**Fuera del circuito de tickets:** corregir el `README.md` (`content/` →
`contenido/`, Node 22, PostgreSQL 18, los tres scripts nuevos, la URL de
producción) y agregar a `CLAUDE.md` la línea que dice que `src/db/` es del
`database-specialist`. Es documentación, la hace el arquitecto o la sesión
principal.

### Dos cambios de orden respecto de la propuesta inicial del arquitecto

**El despliegue subió al puesto 2.** El argumento original —que así el primer
build verde en Vercel corriera bajo reglas de compilador definitivas— no se
sostiene: Vercel reconstruye en cada push, así que un build verde bajo reglas
laxas tiene una vida útil de un commit y se rehace solo. Contra eso pesan dos
cosas: el ADR 0006 quiere descubrir los problemas de despliegue al principio, y
cada cimiento previo es una variable más para depurar si falla; y sobre todo,
**el cimiento de severidad puede requerir conversación con el usuario**, y poner
una conversación en el camino crítico del despliegue es inventar una dependencia
que no existe.

**Vitest subió del 9 al 5.** Los tickets 6→7→8→9 son una cadena de cuatro; un
cimiento ajeno conviene resolverlo antes o después, nunca en el medio. Y el
primer código no trivial del proyecto es el cliente de Drizzle: que el arnés
exista antes cuesta lo mismo.

### Secuencia obligada, que sale sola de las reglas que ya teníamos

Vercel construye desde GitHub, no desde el árbol local. Entonces:

```
T1 se commitea → el usuario pushea → T1 se cierra → recién ahí T2 puede empezar
```

No hubo que inventar nada: la regla de cierre existente —un ticket se cierra
cuando su commit está en el remoto— ya producía el orden correcto.

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
3. El principio del proyecto pide una razón concreta y presente. Con doce
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

## Numeración

Si al publicarlos GitHub asigna otros números, **hay que reescribir todas las
líneas `Bloqueado por:`**. El repositorio no tiene ningún issue, así que
publicándolos en este orden y sin nada en el medio los números deberían
coincidir, pero no está garantizado: hay que verificarlo issue por issue después
de publicar.

---

# Tickets

## 1 — Cimiento: esqueleto de Next.js 16 que compila

```
Bloqueado por: nada, puede empezar ya
Prioridad: camino crítico
Lo toma: el usuario genera el esqueleto, después el backend-specialist
```

El proyecto de Next.js 16 mínimo que instala y compila, en la raíz del
repositorio. Es el punto mínimo del proyecto: todo lo demás cuelga de acá.

**Paso previo que no corre ningún agente.** `create-next-app` aborta en esta raíz
por seis conflictos de archivos. El esqueleto se genera en un directorio temporal
y se copian los archivos a mano; los comandos exactos están más abajo.

**Se conservan:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
`tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`.
**Se agrega a mano:** `.nvmrc` con `22`, y `engines.node` en `package.json`.

**Se descartan:**
- el `.gitignore` del esqueleto — el nuestro es mejor: el del esqueleto ignora
  `.env*` entero, el nuestro deja pasar `.env.example`, que es la plantilla que
  sí se versiona;
- el `README.md` del esqueleto — ya existe uno escrito a mano;
- `AGENTS.md` — no se genera si se pasa `--no-agents-md`;
- `next-env.d.ts` — se genera solo y ya está en el `.gitignore`.

**Sobre `pnpm-workspace.yaml`:** se conserva. El esqueleto lo genera con
`allowBuilds: {sharp: false, unrs-resolver: false}`; sin él, `pnpm install`
advierte en cada instalación. La consecuencia de `sharp: false` es que el
optimizador de imágenes no se compila localmente — irrelevante hoy, y anotado en
el ticket 12 para el día que existan imágenes.

Decisiones que este ticket congela: **`src/`**, **pnpm** y **Node 22 LTS**
(Next.js 16 exige ≥ 20.9.0; la máquina tiene 22.23.2).

**Queda afuera:** Tailwind, linter, Vitest, Drizzle, Docker, cualquier pantalla y
cualquier decisión de aspecto visual.

### Cómo se verifica

- [ ] `pnpm install` termina en 0 y sin advertencias de scripts de build ignorados.
- [ ] `pnpm build` termina en 0.
- [ ] `git status --short` no muestra `node_modules/`, `.next/` ni `next-env.d.ts`.
- [ ] `node -e "const p=require('./package.json'); if(!p.engines?.node) process.exit(1)"` termina en 0.
- [ ] Existe `.nvmrc` con la misma versión mayor que `engines.node`.
- [ ] `grep -c "Create Next App" src/app/layout.tsx` devuelve 0: no queda metadata de plantilla.
- [ ] `grep 'lang="es"' src/app/layout.tsx` encuentra la línea. La aplicación es en español y el atributo `lang` correcto es accesibilidad, no producto.

---

## 2 — Cimiento: la aplicación desplegada y alcanzable desde internet

```
Bloqueado por: #1
Prioridad: camino crítico
Lo toma: el usuario. Ningún agente tiene credenciales de Vercel, ni debería.
```

El repositorio conectado a Vercel, construyendo solo en cada push, con una URL
pública que responde. Es el objetivo que el [ADR 0006](adr/0006-infraestructura-vercel-neon.md)
pone en primer lugar: estar desplegado antes que cualquier funcionalidad, porque
los problemas de despliegue conviene descubrirlos al principio.

Se conecta el repositorio y nada más. **No se adopta ningún servicio propietario
de Vercel** (ADR 0006): ni base, ni almacenamiento, ni colas.

**Este ticket puede no producir ningún commit.** Es correcto y no rompe la regla
del proyecto: *"nada entra al historial sin un ticket"* es una implicación en una
sola dirección — no dice, y nunca dijo, que todo ticket entre al historial. El
rastro son tres cosas verificables: el issue con la URL comentada, el sha que
Vercel construyó comentado en el issue, y el commit del ticket 1 que ya está en
el historial.

**No se agrega un `vercel.json` para tener algo que commitear.** Vercel infiere
Next.js y pnpm del repositorio.

**No se crea ninguna ruta de salud.** Una ruta que hiciera `select 1` sería la
capa web consultando la base, que es exactamente lo que prohíbe la regla de
límite del [ADR 0002](adr/0002-monolito-modular-un-solo-deploy.md) — y sería el
peor precedente posible en el primer despliegue del proyecto.

**Secuencia:** no puede empezar hasta que el commit del #1 esté en el remoto.

### Cómo se verifica

- [ ] `curl -fsS -o /dev/null -w "%{http_code}\n" https://<url>/` devuelve 200.
- [ ] El registro del build muestra Node 22 y pnpm.
- [ ] Un push produce un build nuevo sin intervención manual.
- [ ] El issue tiene comentada la URL pública y el sha construido.

**Cierre:** una de las dos excepciones del corte — se cierra contra los criterios
ejecutados y comentados, no contra un sha propio.

---

## 3 — Cimiento: severidad del compilador de TypeScript

```
Bloqueado por: #1
Prioridad: camino crítico
Lo toma: backend-specialist, convocando al typescript-specialist
```

Aplica el [ADR 0007](adr/0007-severidad-del-compilador-de-typescript.md): cinco
opciones sobre el `strict` que trae la plantilla —`noUncheckedIndexedAccess`,
`erasableSyntaxOnly`, `verbatimModuleSyntax`, `noImplicitReturns` y
`noFallthroughCasesInSwitch`—, cada una con un comentario de una línea en el
archivo.

El momento importa más que el contenido: hoy hay dos archivos triviales y subir
la severidad no cuesta nada. Con cinco mil líneas, la misma decisión no se toma
nunca.

**Son dos archivos, no uno.** `tsconfig.json` y `package.json`:
`erasableSyntaxOnly` exige TypeScript ≥ 5.8 y la plantilla declara `^5`, así que
sube a `^5.9`; y `@types/node` sube a `^22`. Separarlos dejaría un commit
intermedio donde la opción no está soportada.

**No agregar `extends` ni `references` al `tsconfig.json` de la raíz.** Si los
tiene, Next.js abandona su configuración automática en silencio y deja de agregar
el plugin `next` y los tipos de rutas.

**Hecho verificado que cambia el criterio de aceptación.** `pnpm exec tsc
--noEmit` **falla en un árbol limpio**, con código 2:

```
src/app/layout.tsx(8,50): error TS2304: Cannot find name 'LayoutProps'.
```

No es un error de tipos: el `layout.tsx` de Next 16 usa `LayoutProps<"/">`, un
tipo global que Next genera en `.next/types/`, que está en el `.gitignore`. Lo
resuelve `next typegen`, que genera los tipos de rutas sin build completo. Por eso
**el chequeo de tipos tiene que ser un script propio** que corra las dos cosas en
orden: quien clone el repositorio y corra `tsc` a mano se come este error.

Dato relacionado: `next build` **ya corre TypeScript**, así que endurecer el
compilador puede poner en rojo el build de Vercel. Es un argumento a favor de
descubrirlo temprano y con dos archivos triviales.

### Cómo se verifica

- [ ] Existe un script de chequeo de tipos que corre `next typegen` y después `tsc --noEmit`, y termina en 0 **sobre un árbol recién clonado e instalado**, sin haber corrido un build antes.
- [ ] `pnpm exec tsc --showConfig` muestra las cinco opciones. Este criterio existe porque `tsc --noEmit` termina en 0 con `strict` solo o con quince banderas: sin verificar la configuración resuelta, el criterio no distingue el antes del después. Además atrapa un error de tipeo en un nombre de opción, que TypeScript ignora en silencio.
- [ ] `pnpm build && git diff --exit-code tsconfig.json` termina en 0: Next.js no reescribió el archivo.
- [ ] `package.json` declara `typescript: "^5.9"` y `@types/node: "^22"`.
- [ ] Se comprobó el supuesto del ADR 0007: `Record<'procer'|'monumento', X>` indexado **no** devuelve `| undefined`, y `Entidad[]` indexado **sí**. Si el primero falla, avisar al `typescript-specialist`: se cae el argumento a favor de `noUncheckedIndexedAccess`.

---

## 4 — Cimiento: Tailwind v4 conectado, sin paleta ni tokens

```
Bloqueado por: #1
Prioridad: camino crítico
Lo toma: frontend-specialist
```

Tailwind CSS v4 instalado y conectado al build, de modo que una clase de utilidad
escrita en un componente llegue al CSS que sirve la aplicación. **Nada más: es la
cañería, no el lenguaje visual.**

Va separado del #1 a propósito: la aplicación compila sin Tailwind, y meter en el
primer commit una superficie de decisiones de diseño que nadie tomó mezcla dos
intenciones.

**Queda explícitamente afuera** la paleta, la tipografía, la escala de espaciado
y cualquier token de `@theme`: eso es el ticket 11, es del
`visual-design-specialist`, y necesita una decisión de producto sobre cómo se le
ve a un chico. **No se convoca al `visual-design-specialist` en este ticket.**

### Cómo se verifica

- [ ] `pnpm build` termina en 0.
- [ ] Una utilidad de Tailwind usada en un componente aparece en el CSS que produce el build, verificable con un grep sobre `.next/static/css/`. Este criterio existe porque `pnpm build` termina en 0 con Tailwind y sin Tailwind: por sí solo no distingue el antes del después, y un Tailwind instalado pero no conectado lo pasaría igual.
- [ ] El chequeo de tipos del #3 sigue terminando en 0.

---

## 5 — Cimiento: Vitest con una prueba que corre

```
Bloqueado por: #1
Prioridad: antes de la primera rebanada
Lo toma: backend-specialist
```

Vitest instalado y configurado, con `pnpm test` corriendo al menos una prueba que
pasa. **Es el arnés, no una suite.**

Va antes del bloque de base de datos por dos motivos. De forma: los tickets 6, 7
y 8 son una cadena y conviene no interrumpirla. De fondo: el primer código no
trivial del proyecto es el cliente de Drizzle del #7, y que el arnés exista antes
cuesta lo mismo que después.

**Decisión que este ticket no toma:** hoy cada especialista escribe las pruebas de
lo suyo. Cuando exista el agente de pruebas hay que decidir si las escribe él o
si las sigue escribiendo cada uno y él las revisa. Hoy no hay una sola prueba,
así que no hay nada que decidir.

### Cómo se verifica

- [ ] `pnpm test` termina en 0 y reporta al menos una prueba pasada.
- [ ] `pnpm test` no queda en modo interactivo: termina solo. Es lo que va a necesitar cualquier verificación automática más adelante.
- [ ] `pnpm build` sigue terminando en 0.
- [ ] El chequeo de tipos del #3 alcanza también a los archivos de prueba, o está documentado en el issue por qué no.

---

## 6 — Cimiento: PostgreSQL 18 local en Docker

```
Bloqueado por: #1
Prioridad: camino crítico
Lo toma: database-specialist
```

PostgreSQL corriendo localmente en Docker, y un `.env.example` que documente las
variables de conexión. El [ADR 0006](adr/0006-infraestructura-vercel-neon.md)
pide desarrollo local sin conexión y sin consumir cuota, y anota como riesgo
aceptado la divergencia de versión con Neon, con una mitigación explícita: **fijar
la misma versión mayor en ambos.**

**Imagen `postgres:18-trixie`.** Tres decisiones que no son cosméticas:

- **PostgreSQL 18**, porque es el default de Neon para proyectos nuevos —
  verificado en el changelog de Neon del 2026-06-05: *"Postgres 18 is now the
  default for newly created Neon projects"*. Dicho con honestidad: **18 no aporta
  nada decisivo para JSONB**; el argumento es la paridad con el proveedor. Lo
  único concretamente útil es `uuidv7()` nativo, que ordena temporalmente y sirve
  para `evento`, que es *append-only*.
- **Debian (`trixie`), no Alpine.** Alpine usa musl y sus *collations* difieren de
  glibc, que es lo que corre Neon. Un `ORDER BY nombre` sobre texto con tildes y
  ñ —o sea, exactamente nuestro catálogo— puede ordenar distinto en local que en
  producción. Es un bug silencioso y la variante Debian no cuesta nada.
- Se fija el **major**, no el minor: el minor de Neon lo parchea Neon, así que
  fijar `18.6` en local da una precisión falsa.

**Trampa que hay que evitar sí o sí.** La imagen de PostgreSQL 18 cambió `PGDATA`
a `/var/lib/postgresql/18/docker` y declara `VOLUME /var/lib/postgresql`.
Cualquier `docker-compose.yml` copiado de un tutorial anterior monta
`/var/lib/postgresql/data` y **la base no persiste, sin ningún error visible**:
reiniciás y está vacía. El volumen tiene que montar `/var/lib/postgresql`.

**Sobre `.env.example`:** se versiona a propósito —el `.gitignore` ya lo
exceptúa—. Documenta **la forma** de las variables, nunca un valor real, ni
siquiera de la base local. Son dos: `DATABASE_URL` (cadena *pooled*, para
runtime) y `DATABASE_URL_DIRECT` (sin pooler, para drizzle-kit). En local valen
lo mismo.

### Cómo se verifica

- [ ] `docker compose up -d` levanta el servicio.
- [ ] `docker compose exec -T <servicio> pg_isready -U <usuario>` responde "accepting connections". Corre **dentro** del contenedor a propósito: `pg_isready` puede no estar instalado en la máquina, y un criterio que depende de eso no es verificable en un clon fresco.
- [ ] `docker compose exec -T <servicio> psql -U <usuario> -c "show server_version"` devuelve una versión que empieza en **18**.
- [ ] **Persistencia:** crear una tabla, `docker compose down`, `docker compose up -d`, y la tabla sigue estando. Es la única verificación que atrapa el error de `PGDATA`.
- [ ] `.env.example` está versionado, lista las dos variables y no contiene ningún valor real.

---

## 7 — Cimiento: Drizzle instalado y conectado a la base local

```
Bloqueado por: #6
Prioridad: camino crítico
Lo toma: database-specialist
```

Drizzle ORM y drizzle-kit instalados, el cliente construido y `drizzle.config.ts`
en su lugar. Al terminar, el proyecto puede abrir una conexión a la base local y
confirmar que responde. **Todavía sin ninguna tabla.**

Se separa del #8 con este argumento: la tabla `entidad` con
`jsonb().$type<Datos>()` es una decisión de modelado que involucra al
`typescript-specialist`; "instalar Drizzle y abrir una conexión" es mecánico.
Mezclarlas hace que una decisión de diseño viaje escondida dentro de una
instalación.

**Decisiones tomadas, que no se reabren:**

- **Un solo driver: `pg` (node-postgres)**, vía `drizzle-orm/node-postgres`, el
  mismo para local y para Neon. Nada de `@neondatabase/serverless`. Los motivos:
  Neon expone PostgreSQL estándar por TCP; **Vercel Fluid compute** —default para
  proyectos nuevos desde abril de 2025— mantiene las funciones tibias y reutiliza
  la conexión TCP, que era el argumento original a favor del driver serverless; el
  driver de Neon no anda contra el Docker local sin un proxy WebSocket. Y el
  decisivo: **`neon-http` no es un reemplazo directo de `pg`** — las transacciones
  interactivas no funcionan sobre HTTP, así que con dos drivers un
  `db.transaction()` andaría en local y **fallaría en producción**. Un bug que
  solo existe en producción es lo peor que le puede pasar a un proyecto de un
  desarrollador.
- Trade-off aceptado: el costo de establecer la conexión TCP en un arranque
  genuinamente frío. **No está medido**; si algún día importa se mide y se decide
  con el número. Cambiar de driver es una línea en un solo archivo, y eso es
  consecuencia de dónde pusimos la costura.
- **`src/db/` entero es del `database-specialist`**: esquema, cliente,
  `drizzle.config.ts` y migraciones. El `backend-specialist` importa `db` y nunca
  lo construye ni toca el driver. Cómo los módulos reciben `db` sí es del backend,
  cuando exista el primer módulo. **Esta línea falta en la tabla de dueños de
  `CLAUDE.md`.**
- Las migraciones van en `drizzle/` **en la raíz**, fuera de `src/`: son SQL
  versionado, no código de aplicación.

**Acoplamiento a tener en cuenta:** `drizzle.config.ts` apunta a un archivo de
esquema y drizzle-kit se queja si no existe. En este ticket el archivo queda
presente y vacío; la tabla llega en el #8. Está dicho acá para que no se descubra
a mitad de camino.

**`pnpm db:ping` corre `select version()`, no `select 1`**, así el mismo script
que prueba conectividad verifica la paridad de versión que exige el ADR 0006, que
es la única mitigación a la que ese ADR se comprometió. **`drizzle-kit push` no se
usa en este proyecto:** saltea las migraciones versionadas del ADR 0005.

### Cómo se verifica

- [ ] Con la base del #6 levantada, `pnpm db:ping` termina en 0 e imprime 18.x.
- [ ] Con la base del #6 **apagada**, el mismo script termina distinto de 0. Sin este criterio, un script que no consulta nada pasaría igual.
- [ ] El script no imprime la cadena de conexión ni ninguna credencial.
- [ ] `src/db/cliente.ts` exporta `db` y empieza con `import "server-only"`.
- [ ] `drizzle.config.ts` usa **ruta relativa** al esquema, no el alias `@/`. El alias solo lo resuelve el bundler de Next: `drizzle-kit` no lee `paths`, así que un `@/` ahí compila limpio y falla al ejecutarse.
- [ ] `drizzle.config.ts` apunta a `DATABASE_URL_DIRECT`.
- [ ] `pnpm build` y el chequeo de tipos del #3 siguen terminando en 0.

---

## 8 — Cimiento: tabla `entidad` y primera migración

```
Bloqueado por: #7
Prioridad: camino crítico
Lo toma: database-specialist
```

La tabla `entidad` del [ADR 0001](adr/0001-modelo-de-entidad-unica-con-jsonb.md)
declarada en el esquema, con su migración generada como SQL versionado y aplicada
contra la base local.

**No se subdivide.** Un esquema declarado sin migración generada no se verifica
con nada: compila y ya. La migración *es* la verificación del esquema.

Sostiene al #9: `pnpm db:migrate` contra Neon no se puede verificar si no existe
ninguna migración que aplicar. Eso es lo que salva a este trabajo como cimiento y
no como parte de la primera rebanada.

**El tipo de `datos` NO se cierra en este ticket.** La columna se declara
`jsonb("datos").notNull()` **sin `$type<Datos>()`**, porque `Datos` sale del
descriptor y los descriptores son la fuente única de cinco usos: escribirlos sin
un solo tipo de entidad definido sería diseñar de antemano. Engancharlo en la
primera rebanada **no cuesta una migración**: `$type<>()` es puramente de
compilación y no cambia el SQL generado.

Si al declarar la tabla aparece una decisión sobre qué columnas son de identidad
y cuáles van adentro de `datos`, eso es modelado de dominio: se propone en un
comentario del issue y **no se decide acá**.

**Índices:** solo la clave primaria y `unique(slug)`. **Nada de GIN sobre
`datos`**: con 60 fichas la lectura secuencial gana, y un índice que nadie usa es
costo de escritura a cambio de nada. El `unique(slug)` no es opcional — es la
condición que habilita la importación idempotente del ADR 0004.

### Cómo se verifica

- [ ] `pnpm db:generate` produce un archivo SQL en `drizzle/`, versionado.
- [ ] **El SQL generado se lee antes de commitear** (ADR 0005: las migraciones se revisan antes de aplicarse). Paso humano, no automatizable.
- [ ] `pnpm db:migrate` termina en 0 contra la base local.
- [ ] `docker compose exec -T <servicio> psql -U <usuario> -c "\d entidad"` muestra la tabla con sus columnas.
- [ ] **Sobre una base recién creada y vacía**, `pnpm db:migrate` deja la tabla igual. Tiene que servir en un entorno limpio, que es exactamente lo que va a encontrar el #9.
- [ ] `pnpm exec drizzle-kit check` no reporta inconsistencias.
- [ ] `pnpm build` y el chequeo de tipos del #3 siguen terminando en 0.

---

## 9 — Cimiento: base de datos gestionada en Neon, conectada al despliegue

```
Bloqueado por: #2, #8
Prioridad: camino crítico
Lo toma: el usuario. Ningún agente tiene credenciales de Neon ni de Vercel.
```

Un proyecto de Neon con **PostgreSQL 18**, la migración del #8 aplicada contra
él, y las cadenas de conexión cargadas en Vercel para que la aplicación
desplegada tenga base.

PostgreSQL 18 en los dos lados: el ADR 0006 acepta como riesgo la divergencia de
versión y su mitigación es fijar el mismo major. **Es el default de Neon para
proyectos nuevos, así que la acción concreta es confirmarlo, no configurarlo.**

**Dos cadenas, no una.** `DATABASE_URL` es la *pooled* (el hostname lleva
`-pooler`) y es la de runtime: PgBouncer sostiene las conexiones del lado del
servidor y evita agotar el límite de Neon desde funciones serverless.
`DATABASE_URL_DIRECT` es la directa y la usa drizzle-kit para migrar.

**Este ticket puede no producir ningún commit.** Igual que el #2, el rastro es el
issue. Si `.env.example` necesita alguna entrada nueva, eso sí es un cambio de
archivo y va con este ticket.

**Cuidado con las credenciales.** La cadena de conexión de Neon es una credencial:
no entra en ningún archivo versionado, no se pega en un comentario del issue y no
se imprime en ningún registro. Va solo al panel de Vercel y al `.env` local.

### Cómo se verifica

- [ ] El proyecto de Neon reporta una versión de servidor que empieza en **18**, el mismo major que el #6.
- [ ] `DATABASE_URL_DIRECT="$NEON_URL" pnpm db:migrate` termina en 0 y crea la tabla `entidad`.
- [ ] La consola de Neon muestra la tabla `entidad`.
- [ ] Vercel tiene cargadas las dos variables en producción, vista previa y desarrollo, y un build nuevo termina en verde con ellas presentes.
- [ ] `curl -fsS -o /dev/null -w "%{http_code}\n" https://<url>/` sigue devolviendo 200.
- [ ] Ningún comentario de este issue contiene una cadena de conexión.

**Cierre:** segunda y última excepción del corte — se cierra contra los criterios
ejecutados y comentados, no contra un sha propio.

---

## 10 — Cimiento: linter con su propio comando

```
Bloqueado por: #1, y por una decisión del arquitecto que todavía no está tomada
Prioridad: cuando se pueda. No bloquea a ningún otro ticket.
Lo toma: sin asignar hasta que se tome la decisión.
```

**Decisión pendiente, y no es de este ticket.** Falta elegir entre **ESLint 9 con
configuración plana** y **Biome** (que `create-next-app` ya ofrece con
`--biome`). Elegir una herramienta es una decisión de arquitectura. Mientras no
esté tomada, este ticket no se reparte.

Tiene comando propio por un hecho verificado: **en Next.js 16 se eliminó
`next lint` y la opción `eslint` de la configuración**, así que `pnpm build` ya no
ejecuta ningún linter. Si el linter no tiene su propio comando, no corre nunca.

Acá van `noUnusedLocals` y `noUnusedParameters`, que el ADR 0007 rechazó
explícitamente en el compilador: son higiene, no seguridad de tipos, y en el
compilador harían fallar `tsc` mientras el código está a medio escribir.

### Cómo se verifica

- [ ] La decisión está tomada y registrada (no hace falta ADR: es reversible y barata).
- [ ] `pnpm lint` termina en 0 sobre el código existente.
- [ ] `pnpm lint` termina distinto de 0 ante un incumplimiento deliberado introducido para probarlo, **y ese incumplimiento se revierte antes de terminar**. Sin esto, un linter que no analiza nada pasaría igual.
- [ ] `pnpm build` sigue terminando en 0.

---

## 11 — Tokens visuales de Tailwind v4

```
Bloqueado por: #4
Prioridad: antes de la primera rebanada
Lo toma: visual-design-specialist
```

Paleta, tipografía, escala de espaciado, contraste y tamaño mínimo de objetivo
táctil, en un bloque `@theme`. La aplicación la usan chicos, así que el contraste
y el tamaño táctil no son un detalle de acabado.

Los tokens se definen una vez, **antes de la primera pantalla**, o el sistema
visual queda como residuo de lo primero que alguien escribió.

---

## 12 — Registrar la decisión de imágenes y sus disparadores

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
- **Revisar `sharp`:** el `pnpm-workspace.yaml` del ticket 1 trae
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

## 1. Generar el esqueleto (paso previo del ticket 1)

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

A partir de acá el `backend-specialist` toma el ticket 1 y lo termina.

## 5. Después

- **Ticket 2:** pushear el commit del ticket 1 y conectar el repositorio en el
  panel de Vercel.
- **Ticket 9:** crear el proyecto en Neon (confirmar PostgreSQL 18) y cargar las
  dos cadenas como variables de entorno en Vercel.
- **Opcional:** los tres `gh label create` de la sección de prioridad.
