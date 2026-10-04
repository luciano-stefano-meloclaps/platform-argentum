# platform-argentum

Contexto de proyecto para Claude Code. Se carga en cada sesión y en cada
subagente, así que **apunta, no repite**: cada regla vive en un solo lugar —un
ADR, el archivo de un agente, un runbook— y acá figura solo su referencia. Si
este archivo y un ADR dicen cosas distintas, gana el ADR y este archivo está
viejo.

## Estado actual

- Next.js 16, Tailwind v4, ESLint 9 y Vitest. PostgreSQL 18 local en Docker,
  base gestionada en Neon, aplicación desplegada en Vercel.
- **Dos módulos existen**:
  - `catalogo`: punto de entrada `src/catalogo/catalogo.ts`, con tres funciones
    (`listarPorTipo`, `obtenerPorSlug`, `listarSlugs`), sus descriptores y la
    importación del contenido curado.
  - `identidad`: punto de entrada `src/identidad/identidad.ts`, sobre Better
    Auth, con email y contraseña más Google (ADR 0019 y 0020). En producción
    espera sus variables de Vercel (#123).
- **Todavía no existen** `moderacion`, `aprendizaje` ni `progreso`.
- Contenido curado: **una** ficha, `contenido/procer/manuel-belgrano.ts`.
- Rutas en `src/app/`:
  - **Reales:** `/`, `/catalogo`, `/catalogo/[slug]`, `/ingresar`,
    `/registrarse` y la ruta de protocolo `/api/auth/[...all]`.
  - **Presentación con datos simulados:** `/ficha`, `/tarjetas`, `/quiz` y
    `/quiz/resultado`.
- Migraciones en `drizzle/`: la tabla `entidad` y las tablas de Better Auth.

**El árbol se entrega verde.** Quien termina un ticket corre esto antes de
decir que terminó:

```bash
pnpm typecheck   # next typegen && tsc --noEmit
pnpm lint        # eslint .
pnpm test        # vitest run; las pruebas de catalogo necesitan Docker levantado
```

Además, `pnpm build` si el ticket toca el build, y `pnpm db:generate` más
`pnpm db:migrate` si toca el esquema.

## Producto y voz

Catálogo sobre Argentina para aprender: fichas, tarjetas de repaso, quiz
individual y panel de progreso. Más adelante, propuestas de usuarios con
moderación.

- **Lector:** de doce años en adelante.
- **Prosa:** épica, de registro alto, sin simplificar (ADR 0012). La regla
  verificable está en la skill `voz-narrativa`.
- **Versión para chicos:** pospuesta, no cancelada (`docs/decisiones-pendientes.md`
  §3). Mientras tanto no se toca nada del modelo (ADR 0013).
- **Accesibilidad:** los requisitos siguen vigentes (contraste AA, objetivos
  táctiles, `prefers-reduced-motion`, el color como no-único portador de
  significado).

## Decisiones que muerden todos los días

Detalle completo en `docs/adr/` (el índice está en `docs/adr/README.md`). Lo
que no se puede olvidar:

- **Monolito modular, cinco módulos** (ADR 0002). La capa web no consulta la
  base: le pide al módulo. La autorización se verifica dentro del módulo.
- **La interfaz de un módulo es `src/<modulo>/<modulo>.ts`** (ADR 0017).
- **Capa web hexagonal con MVVM** (ADR 0016 y 0029): la vista-modelo es el
  `*.datos.ts`, del servidor y sin React; su transformación es síncrona y se
  prueba sin base. No hay `/api` interno; la ruta de protocolo de Better Auth
  no cuenta como tal (ADR 0019). El puerto de salida está pospuesto (ADR 0018).
- **Errores de los módulos** (ADR 0026):
  - Ausencia esperada: `undefined`.
  - Decisión del usuario: `{ ok: false, mensaje, campo? }`.
  - Fallo del programa: excepción.
- **Una tabla `entidad`**, con discriminador `tipo` y `datos` JSONB tipados por
  descriptores en código (ADR 0001). Una entidad tiene un solo slug, y el
  registro de lectura nunca es columna, fila ni ruta (ADR 0013).
- **Los datos de una pantalla viven en un `*.datos.ts` al lado de su
  componente** (ADR 0029). Su encabezado dice si son simulados o reales. Un
  mock no es contrato (`decisiones-pendientes.md` §4).
- **Contenido curado** en `contenido/<tipo>/<slug>.ts`, tipado por su
  descriptor e importado a la base (ADR 0004 y 0009).
- **Compilador estricto** (ADR 0007 y 0011). Las banderas no se aflojan para
  que algo compile. Todo import de valor lleva su extensión; los `import type`
  no la llevan. Si `pnpm lint` marca `import/extensions`, se corrige el import,
  nunca la regla.
- **Marca Argentum, v1 más v2** (ADR 0008 y 0015). Lora reemplaza a Montserrat
  en todo el sistema. **No se propone paleta ni tipografía.** La fuente citable
  es la skill `identidad-argentum`.
- **Producción:**
  - Ejecuta escrituras **solo el `infra-specialist`**, por cualquier canal, con
    confirmación del usuario en cada ejecución. Nada de eso entra a `allow`
    (ADR 0024 y 0025).
  - `preview` nunca recibe datos de producción (ADR 0027).
- **Lo que todavía no se decidió** está en `docs/decisiones-pendientes.md`. Si
  tu trabajo roza una entrada, respetá su regla interina y no la decidas vos.

## Flujo de trabajo

El proyecto avanza por **rebanadas con ticket** (issues de GitHub en
`luciano-stefano-meloclaps/platform-argentum`). **Nada entra al historial sin
un ticket que lo explique.**

```
arquitecto     alcance y ADR
entrega        corte en rebanadas → APROBACIÓN → issues → reparte UN ticket
especialista   escribe el código, deja el árbol verde, termina
entrega        verifica contra el ticket → commit
usuario        verifica el commit → entrega: push + PR contra development
usuario        verifica el PR    → entrega: merge a development y cierra el ticket
usuario        mergea development a main y despliega, cuando quiere
```

- **Commits.**
  - El trabajo con ticket lo commitea solo el `delivery-specialist`.
  - La sesión principal y el arquitecto commitean lo suyo: documentación, ADR
    y configuración.
  - Convenciones: skill `convenciones-git`.
- **Ramas.** `main` no recibe trabajo directo. Los PR van siempre contra
  `development`.
- **Tracker.**
  - Solo el `delivery-specialist` escribe en él; el resto solo lee.
  - Se usan solo las etiquetas que ya existen (verificalas con `gh label list`).
  - Las dependencias se escriben como texto: `Bloqueada por: #12`.
  - Detalle en `docs/agents/issue-tracker.md`.
- **Regla de proceso vigente.** Hasta que el catálogo tenga entre cinco y ocho
  fichas curadas (#30), no se crean agentes, skills ni ADR de proceso nuevos.
  Las rebanadas son de producto. Un arreglo de una guarda existente sí entra.

## Equipo

Cada agente tiene su archivo en `.claude/agents/<nombre>.md`, con sus
herramientas, límites y a quién convoca. **Esa es la fuente**; esta tabla solo
orienta.

| Nivel | Agente | Dueño de |
| ----- | ------ | -------- |
| 1 | `super-architect` | Qué se construye y por qué: alcance, ADR, `CONTEXT.md`, `docs/` |
| 2 | `delivery-specialist` | El corte, los tickets, el reparto, los commits con ticket, y el push, el PR y el merge contra `development` |
| 3 | `backend-specialist` | Los cinco módulos, contratos, autorización y validación, `contenido/` y su importación |
| 3 | `frontend-specialist` | Pantallas, componentes, estilos y accesibilidad |
| 3 | `database-specialist` | Esquema, migraciones e índices; lee Neon, no escribe |
| 3 | `infra-specialist` | Vercel, Neon, entornos, variables, Docker y runbooks; el único que escribe en Neon y en producción (ADR 0022 y 0025) |
| backend | `narrative-specialist` | La voz de la prosa de cada ficha (skill `voz-narrativa`) |
| backend | `historiador-specialist` | Investigar y contrastar fuentes; un dossier, nunca prosa (ADR 0014) |
| frontend | `brand-specialist` | La identidad Argentum y sus tokens |
| frontend | `ui-reviewer` | Auditar una pantalla terminada; reporta, no corrige |
| transversal | `typescript-specialist` | Los tipos que cruzan una costura; diseña y reporta, no escribe |

**Agentes del plugin de Vercel.** Son consultores. No reciben tickets y los
convoca un solo responsable, que es dueño de la conclusión:

| Agente | Responsable |
| ------ | ----------- |
| `vercel:performance-optimizer` | `frontend-specialist` |
| `vercel:deployment-expert` | `infra-specialist` |
| `vercel:ai-architect` | `super-architect` |

**El contenido curado tiene tres dueños:**
- Qué fichas entran, los hechos y los derechos de imagen son del **usuario**.
- La redacción es del **`narrative-specialist`**.
- Que una ficha inválida no entre es del **`backend-specialist`**.

El visto bueno del usuario sobre el texto de cada ficha es condición de cierre.

**Previsto:** un agente de testing, en el nivel 3. Su alcance está en
`decisiones-pendientes.md` §8.

## Guardas

Son hooks en `.claude/hooks/`, declarados en `.claude/settings.json`. Su
criterio es del `infra-specialist`, pero **los archivos los escriben la sesión
principal o el arquitecto**: un agente que edita su propia guarda no tiene
guarda.

| Hook | Qué hace |
| ---- | -------- |
| `bloquear-git-push.sh` | Solo el `delivery-specialist` pushea, nunca contra `main` y nunca forzado |
| `limitar-gh.sh` | Lectura para todos; los issues y los PR contra `development`, solo para el `delivery-specialist`; todo lo demás, denegado |
| `limitar-vercel.sh` | El comando `vercel`: lectura libre, y toda escritura pide confirmación (ADR 0010) |
| `limitar-vercel-mcp.sh` | El MCP de Vercel: lo mismo, con aviso de PRODUCCIÓN; compras y facturación denegadas (ADR 0022) |
| `limitar-neon.sh` | El MCP de Neon: lectura libre; solo el `infra-specialist` escribe; aviso de PRODUCCIÓN (ADR 0021 y 0022) |

`rtk` no es una autorización: los hooks desenvuelven el prefijo antes de
clasificar el comando.

## Documentación

| Ruta | Qué es |
| ---- | ------ |
| `CONTEXT.md` | El glosario. **Usá sus términos exactos.** Para el método: rebanada, cimiento, ticket |
| `docs/adr/` | Las decisiones, con su índice y sus estados en `README.md` |
| `docs/decisiones-pendientes.md` | Lo que todavía no se decidió, con su disparador y su regla interina |
| `docs/decisiones-menores.md` | Decisiones chicas que no justifican un ADR |
| `docs/runbooks/` | Cómo operar entornos, bases e identidad en producción |
| `docs/marca/` | Sistema de diseño v1 y v2; no se editan, y donde los corrige un ADR gana el ADR |
| `docs/agents/` | La configuración del tracker y de la documentación de dominio para las skills |
| `docs/tickets-del-arranque.md` | El razonamiento del corte del arranque (#5 a #14) |
| `README.md` | El proyecto explicado para una persona. No es fuente de decisiones |

## Skills

Las propias están en `.claude/skills/`; las de terceros, en `.agents/skills/`
(fijadas en `skills-lock.json`) y enlazadas desde ahí.

**Precedencia:**
1. Los ADR y `CONTEXT.md`.
2. El principio de arquitectura.
3. Las skills de terceros.

**Propias.** Cada una tiene un dueño, y cualquiera que escriba en su área la
cita:

| Skill | Dueño | Para qué |
| ----- | ----- | -------- |
| `voz-narrativa` | `narrative-specialist` | La prosa épica |
| `identidad-argentum` | `brand-specialist` | La interfaz; es un resumen citable, no la fuente |
| `investigacion-historica` | `historiador-specialist` | El método de investigación |
| `revision-de-ui` | — | La referencia de accesibilidad |
| `convenciones-git` | — | Ramas, commits y títulos de issue |

**Salvedades de las de terceros:**
- `vercel-react-best-practices`: las reglas estructurales se aplican desde el
  principio; las micro-optimizaciones (`js-`), solo con una medición. Es *la*
  fuente de rendimiento de React y Next.js: gana sobre la
  `react-best-practices` del plugin. Las convenciones del framework (archivos,
  límites RSC, APIs asíncronas) son de `next-best-practices`.
- `building-components`: la parte de distribución no aplica.
- `revision-dos-ejes`: es la revisión de código. Se llama así para no pisar
  `/code-review`.
- `improve-codebase-architecture` (del arquitecto) y `to-tickets` (del
  `delivery-specialist`) están **modificadas localmente**: se les quitó
  `disable-model-invocation`. Al actualizarlas hay que volver a quitárselo. De
  `to-tickets` vale el procedimiento, no el vocabulario: *slice* se dice
  **rebanada**, y no se usa `ready-for-agent`.
- `setup-matt-pocock-skills` y `grill-me` se invocan a mano, a propósito.
  `grilling` es la que usa el arquitecto.

## Setup al clonar

0. **En Windows**, antes de clonar, activá el Modo de programador
   (Configuración → Sistema → Para programadores) y cloná con
   `git clone -c core.symlinks=true …`. Las skills de terceros de
   `.claude/skills/` son symlinks hacia `.agents/skills/`: si alguna aparece
   como un archivo de una línea con una ruta, no carga. Se versionan como
   symlinks; no se reemplazan por copias.
1. Corré `claude` en la raíz y aceptá el diálogo de confianza y el servidor MCP
   `context7` de `.mcp.json`.
2. *(Opcional)* Exportá `CONTEXT7_API_KEY` en tu shell o en
   `.claude/settings.local.json`. Nunca va en `.claude/settings.json` ni en
   `.mcp.json`.
3. El plugin `vercel@claude-plugins-official` está habilitado en
   `.claude/settings.json` a propósito, para todo el equipo. El de Neon es
   personal y va en `.claude/settings.local.json` (ADR 0021).

## Principio de arquitectura

Mínimo necesario para validar el producto, diseñado para poder crecer. Cada
tecnología, patrón, abstracción o capa necesita una razón concreta y presente.
Ante la duda, la opción más simple que pueda evolucionar.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer)

**MODIFICADO LOCALMENTE.** `rtk init` escribe acá un catálogo de unos sesenta
comandos —cargo, go, pytest, rspec, prisma, docker, kubectl, curl, wget— de los
que este proyecto usa menos de la cuarta parte. Este archivo se carga entero en
cada sesión **y en cada subagente**, así que el catálogo completo se paga en
todos los turnos de todos los agentes a cambio de nada. Queda solo lo que el
repositorio corre de verdad. **Al volver a correr `rtk init` hay que recortarlo
otra vez**: reescribe todo lo que hay entre los dos marcadores HTML. Mismo
criterio que las skills parcheadas de la sección "Skills".

## La regla

**Poné `rtk` adelante de cualquier comando.** Si RTK tiene un filtro para ese
comando lo aplica y ahorra tokens; si no lo tiene, pasa el comando tal cual.
Nunca cambia lo que el comando hace.

En una línea compuesta, `rtk` va en **cada** tramo:

```bash
# ❌
git add src/db/esquema.ts && git commit -m "msg"

# ✅
rtk git add src/db/esquema.ts && rtk git commit -m "msg"
```

**`rtk` no es una autorización.** `rtk git push` sigue las mismas reglas que
`git push`: denegado para todo subagente salvo el `delivery-specialist` —y para
él, denegado igual si el destino es `main`—. Los tres hooks desenvuelven el
prefijo antes de clasificar el comando.

## Los comandos de este proyecto

```bash
rtk pnpm typecheck      # tsc, errores agrupados por archivo
rtk pnpm lint           # ESLint, violaciones agrupadas
rtk pnpm test           # Vitest, solo lo que falla
rtk pnpm build          # next build con métricas por ruta
rtk pnpm install

rtk git status | log | diff | show | add | commit | branch
rtk gh issue list | issue view <n>

rtk ls <ruta> | read <archivo> | grep <patrón> | find <patrón>
rtk docker ps           # el contenedor de PostgreSQL local
rtk err <cmd>           # filtra solo los errores de cualquier comando
rtk proxy <cmd>         # corre sin filtrar, para depurar el filtro mismo
```
<!-- /rtk-instructions -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
