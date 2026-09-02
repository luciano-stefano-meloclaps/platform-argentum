# platform-argentum

Contexto de proyecto para Claude Code. Este archivo se carga automáticamente en
cada sesión y en cada subagente, así que se mantiene corto y factual.

## Estado actual

**Proyecto greenfield: todavía no hay código.** La arquitectura y el stack ya
están decididos y documentados en `docs/adr/`.

**Producto.** Catálogo sobre Argentina para que chicos aprendan: fichas
(próceres, monumentos, animales, comida, fechas patrias…), tarjetas de repaso,
quiz individual y panel de progreso. Más adelante: cuentas, y propuestas de
usuarios con moderación.

**Stack decidido:** Next.js 16 · React 19 · TypeScript · PostgreSQL · Drizzle
ORM · Zod · Tailwind v4 · Vitest (ADR 0003 y 0005). Despliegue en Vercel, base
en Neon, PostgreSQL local en Docker (ADR 0006). Better Auth **recién** cuando
lleguen las cuentas: el MVP no tiene cuentas.

**Arquitectura decidida:**

- Monolito modular, un solo deploy, cinco módulos: `catalogo`, `moderacion`,
  `aprendizaje`, `progreso`, `identidad` (ADR 0002).
- **Regla de límite:** la capa web no consulta la base de datos; le pide al
  módulo. La autorización se verifica dentro del módulo, nunca solo en la
  interfaz.
- Catálogo: una sola tabla `entidad` con discriminador `tipo` y columna `datos`
  JSONB; los campos de cada tipo viven en descriptores en código (ADR 0001).
- Contenido curado en archivos versionados, importado a la base (ADR 0004).

**Antes de contradecir cualquiera de estos puntos, leé el ADR correspondiente.**
Si una decisión cambia, se escribe un ADR nuevo que supersede al anterior; no se
edita el viejo.

## Flujo de trabajo

El proyecto avanza **por rebanadas y con ticket**. Un alcance aprobado se corta
en rebanadas, cada una se publica como issue de GitHub, y **nada entra al
historial sin un ticket que lo explique**. No se codifica a lo grande: se
codifica por partes chicas, trazables y reversibles.

El equipo tiene **tres niveles**, y cada uno decide una cosa distinta:

```
                 super-architect        qué se construye y por qué
                        │
                delivery-specialist     en cuántos pedazos, quién lo hace
                        │               y qué entra al historial
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
  backend-          frontend-         database-      cómo se resuelve
  specialist        specialist        specialist
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
   visual-design-           ui-reviewer      ← equipo del frontend
   specialist
```

Fuera de la jerarquía, transversal y a demanda: `typescript-specialist`.

El ciclo de una rebanada, de punta a punta:

```
requerimiento  → arquitecto:    alcance, ADR
               → entrega:       corte en rebanadas → APROBACIÓN → issues
               → entrega:       reparte UN ticket
               → especialista:  escribe el código, deja el árbol, termina
               → entrega:       verifica contra el ticket → commit → comenta
               → usuario:       push y despliegue → se cierra el ticket
```

### Nivel 1 — Arquitectura

El diseño y el análisis funcional pasan por el agente **`super-architect`**
(`.claude/agents/super-architect.md`), que actúa como arquitecto principal y
analista funcional. Entiende el producto y define el alcance antes de decidir
cómo construirlo.

Invocación:

```bash
claude --agent super-architect     # como sesión principal (recomendado:
                                   # puede conversar y preguntar directamente)
```

O desde una sesión normal, mencionándolo: `@agent-super-architect` o pidiendo
que se delegue en él.

**Delega por defecto.** Averiguar —leer un archivo largo, verificar un hecho
contra el repositorio o el compilador, redactar un artefacto extenso— se lo pide
a un especialista y se queda con la conclusión. Decidir, escribir el ADR, fijar
el alcance y sostener la coherencia entre áreas no se delegan nunca. El motivo
es concreto: es el único agente que tiene que sostener la visión del sistema
completo durante toda la conversación, y cada archivo que abre para confirmar un
detalle le come el espacio donde vive esa visión.

### Nivel 2 — Entrega

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `delivery-specialist` | El corte en rebanadas, los tickets, las ramas, el reparto y **todos los commits del trabajo con ticket** | Código, alcance, decisiones de producto |

**No es dueño de ningún archivo del árbol de trabajo, y justamente por eso puede
ser dueño del historial** —que hasta ahora era el único artefacto con cuatro
escritores y ningún dueño—. Está por encima de los tres especialistas en dos
sentidos concretos y solo esos dos: **les reparte los tickets** y **es la puerta
de salida de su trabajo**. Adentro de su área, el criterio técnico sigue siendo
del especialista.

**El commit dejó de ser de los especialistas**, y es un cambio a lo que decía
antes este archivo. El motivo: el que escribió el código es la peor persona para
juzgar si el diff tiene una sola intención —ya se convenció de que ese arreglito
de paso "va con esto"—, que es el mismo argumento por el que existe el
`ui-reviewer`. Y una rebanada cruza tres dueños por definición, así que
"commitea el que termina último" significa que uno barre el trabajo de los otros
dos sin entenderlo. La regla:

> **Si el trabajo tiene ticket, lo commitea el `delivery-specialist`. Si no
> tiene ticket, no debería estar pasando.**

Eso le sale barato por una razón que hace que la idea funcione: **el ticket es la
intención**, así que no tiene que adivinar qué quiso hacer el que escribió, lo
lee. Con una excepción deliberada: **la sesión principal y el arquitecto
commitean solos**; documentación, ADR y configuración están fuera del circuito de
tickets a propósito.

Sus límites de herramientas, todos deliberados:

- **Sin `Write` ni `Edit`** — no es dueño de ningún archivo, y un agente que
  puede editar lo que está por commitear deja de verificar y empieza a arreglar,
  metiendo en el diff un cambio que nadie pidió ni revisó. *Disparador para
  revisarlo: si el tracker pasa a ser markdown local bajo `.scratch/`, se le da
  `Write` acotado ahí.*
- **Con `Bash`**, porque `git` y `gh` son toda su herramienta. Lo usa para
  commitear y consultar, **nunca para escribir archivos**: un `cat >` o un
  `sed -i` rompe el límite de arriba y encima contamina el commit que está por
  hacer.
- **Con `Agent` sobre los tres especialistas**, porque sin eso "estar por
  encima" no significaría nada. Reparte **un ticket por vez**: dos especialistas
  sobre el mismo árbol producen un diff que después no se puede separar en dos
  commits.
- **Sin `WebFetch`, `WebSearch` ni Context7** — nada de lo que hace depende de la
  versión de una librería, y `gh --help` y el repositorio alcanzan.

**Puede crear issues en el repositorio real.** Es una excepción explícita a
"publicar lo decide el usuario", y se sostiene en que un issue es barato y
reversible y en que **el corte se aprueba antes de publicarse**, así que el
portón humano existe igual. Todo lo demás lo impide un hook
(`.claude/hooks/limitar-gh.sh`): nada de `gh pr`, `gh repo`, `gh release`,
`gh label create` ni `gh api` de escritura, para ningún subagente. `git push`
sigue bloqueado para todos.

**Etiquetas: solo las diez que trae GitHub por defecto.** No hay vocabulario
propio, y la skill `triage` no está instalada, así que no se aplica
`ready-for-agent` ni el resto de su vocabulario canónico. Antes de usar
`--label`, verificá con `gh label list`: con una etiqueta inexistente el comando
falla, y crearlas está denegado para los subagentes. Una etiqueta nueva la crea
la sesión principal o el usuario, a pedido.

Las dependencias entre tickets van como texto (`Bloqueada por: #12`), no con la
API nativa de GitHub, que necesitaría escrituras y los ids internos de cada
issue.

### Nivel 3 — Especialistas de área

La implementación la hacen tres especialistas, en `.claude/agents/`:

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `backend-specialist` | Los cinco módulos, contratos, autorización, validación | Esquema, migraciones, interfaz |
| `frontend-specialist` | Pantallas, componentes, estilos, accesibilidad | Base de datos, lógica de negocio |
| `database-specialist` | Esquema, migraciones, índices, entornos de base | Lógica de negocio, interfaz |

Claude puede delegarles solo, o se los invoca con `@agent-<nombre>`.

#### Equipo de frontend

El `frontend-specialist` planificó y creó su propio equipo. **No son pares** de
los otros dos especialistas: trabajan dentro de su área y los convoca él.

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `visual-design-specialist` | Lenguaje visual: paleta, tipografía, espaciado, contraste, tokens `@theme` | Páginas, componentes, base de datos |
| `ui-reviewer` | Auditar una pantalla terminada contra `revision-de-ui`, ADR 0002 y `CONTEXT.md` | **No escribe ni corrige: reporta** |

Dos límites de herramientas que son deliberados: el revisor no tiene `Write`,
`Edit` ni `Bash` —quien revisa no arregla—, ni `WebFetch`/`WebSearch`, porque la
copia versionada de las guidelines ya está en el repo y no se baja de internet.
El diseñador tampoco tiene `Bash`, así que no puede commitear.

**Qué pueden hacer solos:** escribir código en su área, invocar skills, convocar
a otro especialista o al arquitecto con `Agent`, y preguntarle al usuario
mandándole un mensaje a `main` con `SendMessage` sin cortar el trabajo. Terminan
**dejando el árbol de trabajo listo** y diciendo qué cambiaron y contra qué
ticket.

**Qué no pueden:** **commitear** —eso es del nivel 2—, `git push` —bloqueado por
un hook para **todo** subagente, ver abajo—, escribir en el remoto con `gh`,
cambiar una decisión ya tomada, instalar dependencias o contradecir un ADR. Eso
se propone y se espera. `AskUserQuestion` no existe para ningún subagente: si
algo los bloquea de verdad, terminan el turno con las preguntas escritas.

Salvedad sobre "qué pueden hacer solos": no vale para todos. El `ui-reviewer` y
el `typescript-specialist` no escriben archivos. Y **ninguno commitea**: desde
que existe el nivel 2, el historial tiene un solo dueño.

#### Transversal

| Agente | Dueño de | No toca |
| ------ | -------- | ------- |
| `typescript-specialist` | La dimensión de tipos: severidad del compilador, modelo de tipos del descriptor, tipos que cruzan una costura, `z.input` vs `z.output`, pruebas de tipos | **No escribe archivos: diseña y reporta.** Interiores ajenos, accesibilidad, lógica de negocio, esquema |

**No es un cuarto especialista.** No es dueño de ningún archivo y no implementa:
todos escriben TypeScript, así que su territorio no es el lenguaje sino la
dimensión de tipos, y sobre todo **lo que ningún dueño ve desde su lado porque
vive entre dos**. Lo convocan los tres especialistas y el arquitecto; él no
convoca a nadie. Su límite: *un tipo que vive de un solo lado es del dueño de ese
lado; un tipo que tienen que entender dos dueños es suyo*.

Sus límites de herramientas, todos deliberados:

- **Sin `Write` ni `Edit`** — casi todo lo que tocaría es de otro, y un arreglo
  de tipos rara vez es solo eso: en un módulo es un cambio de contrato, en una
  pantalla es una decisión de producto. Entrega el tipo exacto listo para pegar y
  lo aplica el dueño. *Disparador para revisarlo: si el cuello de botella
  resulta ser que no puede escribir las pruebas de tipos, se le da `Write`
  acotado a `**/*.test-d.ts`.*
- **Con `Bash`**, al revés que el `ui-reviewer`: su verdad de referencia es la
  salida del compilador, y un especialista en tipos que no puede correr
  `tsc --noEmit` es un comentarista. Lo usa para compilar y leer, no para
  escribir ni commitear.
- **Sin `WebFetch` ni `WebSearch`** — Context7 y el compilador cubren lo que
  necesita; buscar en la web sobre tipos devuelve blogs viejos llenos de `any`.
- **Sin `Agent`**, como el revisor: lo convocan, no convoca.

**Su valor está adelantado, no repartido:** pico el día cero (proponer la
severidad del compilador, que hoy cuesta cero y con cinco mil líneas escritas ya
no se hace nunca), pico en la primera rebanada (descriptor, unión discriminada y
`$type<Datos>()`), y después a demanda. **No participa de cada rebanada, y que
pasen rebanadas sin convocarlo es lo esperado.**

La costura entre ellos: el `database-specialist` define el esquema y las
migraciones, el `backend-specialist` escribe las consultas dentro de sus módulos,
y el `frontend-specialist` **nunca** toca la base — le pide al módulo. El
`typescript-specialist` no vive en ninguna de las tres áreas: vive **en las
costuras** entre ellas, que es donde un tipo duplicado a los dos lados es
invisible desde cada lado por separado.

#### Previsto, todavía no existe

Un **agente de testing**, que el usuario ya anunció. Cuando llegue va al **nivel
3**, como cuarto especialista de área: sería dueño de las pruebas y de la
configuración de Vitest, que son archivos concretos, y acá el permiso de
escritura sigue a la propiedad exclusiva de un artefacto. **No va al nivel 2**,
porque el nivel 2 no es dueño de ningún archivo y eso es precisamente lo que lo
habilita a ser dueño del historial.

La puerta que aporta la consume la entrega: **el `delivery-specialist` no cierra
un ticket cuyos criterios de aceptación no estén verificados.** Los criterios de
aceptación que ya escribe hoy en cada ticket son exactamente la entrada de ese
agente, así que nada de lo que se decidió ahora hay que rehacerlo cuando exista.

Queda **una decisión pendiente** para ese momento: hoy cada especialista escribe
las pruebas de lo suyo. Si aparece un dueño de las pruebas hay que decidir si las
escribe él o si las sigue escribiendo cada uno y él las revisa. **No se decide
ahora**: todavía no hay una sola prueba.

## Principio de arquitectura

Mínimo necesario para validar el producto, diseñado para poder crecer. Cada
tecnología, patrón, abstracción o capa necesita una razón concreta y presente.
Ante la duda: la opción más simple que pueda evolucionar.

## Documentación

- `CONTEXT.md` — glosario del dominio. **Usá estos términos exactos**; no
  inventes sinónimos para conceptos que ya tienen nombre. Para el método de
  trabajo, los términos son **rebanada**, **cimiento** y **ticket**.
- `docs/adr/` — decisiones arquitectónicas (ADR). Leelas antes de proponer
  cambios que las contradigan.

## Agent skills

Configuración que las skills de ingeniería (`to-tickets` y las que vengan)
esperan encontrar. Generada con `setup-matt-pocock-skills` y **adaptada a este
repositorio**: los archivos están en español y reflejan sus restricciones reales,
no la plantilla genérica.

### Issue tracker

Los tickets son **issues de GitHub** en `luciano-stefano-meloclaps/platform-argentum`,
escritos en español, con las dependencias como texto (`Bloqueada por: #12`) y
solo con las etiquetas que existan en el repositorio (`gh label list`). Solo el
`delivery-specialist` escribe en el tracker; el resto de los subagentes solo lee.
Ver `docs/agents/issue-tracker.md`.

### Domain docs

Disposición **single-context**: un `CONTEXT.md` en la raíz y un `docs/adr/`. No es
un monorepo. Ver `docs/agents/domain.md`.

## Skills

El repositorio trae skills de terceros en `.agents/skills/`, enlazadas desde
`.claude/skills/`. Son **guías externas, no autoridad**: ninguna conoce las
decisiones de este proyecto.

**Precedencia, en este orden:**

1. Los ADR de `docs/adr/` y el vocabulario de `CONTEXT.md`.
2. El principio de arquitectura de este archivo.
3. Las skills externas.

Si una skill recomienda algo que contradice un ADR, **gana el ADR**. Si la
recomendación es mejor, se escribe un ADR nuevo que lo supersede; no se ignora
el viejo en silencio.

**Salvedades concretas:**

- `building-components` — la mitad sobre distribución (`registry`, `npm`,
  `marketplaces`, `docs`) **no aplica**: construimos un producto, no una
  biblioteca de componentes para terceros.
- `vercel-react-best-practices` — aplicar las reglas estructurales (`async-`,
  `bundle-`, `server-`) desde el principio; las micro-optimizaciones (`js-`)
  solo con una medición concreta que las justifique.
- `improve-codebase-architecture` — **es del arquitecto**, ningún otro agente la
  usa. Necesita historial de commits y código real, así que no sirve hasta que
  haya varias rebanadas hechas. Está **modificada localmente** para que se pueda
  auto-invocar: al actualizarla desde el origen hay que volver a quitarle
  `disable-model-invocation`.
- `to-tickets` — es del `delivery-specialist`. Está **modificada localmente**
  para quitarle `disable-model-invocation` y que pueda auto-invocarla; al
  actualizarla desde el origen hay que volver a quitársela. Vale su
  **procedimiento**, no su **vocabulario**: donde dice *slice* nosotros decimos
  **rebanada** (`CONTEXT.md` manda), y no aplicamos la etiqueta
  `ready-for-agent` que sugiere, porque no existe en este repositorio.
- `setup-matt-pocock-skills` — **sigue siendo manual y la corre el usuario**, no
  un agente. A diferencia de las otras dos parcheadas, esta **conserva a
  propósito** su `disable-model-invocation`: reescribe este archivo y configura
  el tracker del repositorio remoto, y eso no lo dispara un agente por su
  cuenta. Se corre **una sola vez**, antes del primer uso de `to-tickets`.
- Sigue siendo de invocación manual, a propósito: `grill-me` (la pedís vos
  cuando querés que te interroguen).
- La accesibilidad aparece en varias skills a la vez. Ante consejos distintos,
  la referencia es `revision-de-ui`, que es nuestra: usa una copia versionada de
  las Web Interface Guidelines en lugar de bajarlas de internet en cada
  ejecución.
- `revision-dos-ejes` es la revisión de código en dos ejes (convenciones y
  especificación). Se llama así, y no `code-review`, para no pisar el comando
  integrado de Claude Code.

## Setup al clonar

1. Ejecutá `claude` en la raíz del repo y **aceptá el diálogo de confianza** del
   workspace, y la aprobación del servidor MCP `context7` que declara `.mcp.json`.
   Un repositorio clonado no puede auto-aprobar sus propios servidores MCP: la
   aprobación es manual y ocurre una sola vez.

2. *(Opcional)* Context7 funciona sin API key, con un rate limit más bajo. Para
   usar una key propia (gratuita en https://context7.com/dashboard), exportala
   en tu shell:

   ```bash
   export CONTEXT7_API_KEY=tu-key   # en ~/.zshrc o ~/.bashrc
   ```

   Alternativa equivalente, en tu `.claude/settings.local.json` (personal,
   ignorado por git):

   ```json
   { "env": { "CONTEXT7_API_KEY": "tu-key" } }
   ```

   Claude Code **no** lee un archivo `.env` para esto: la variable tiene que
   estar en el entorno del proceso o en un settings file. Nunca la pongas en
   `.claude/settings.json` ni en `.mcp.json`, que sí se commitean.

## Configuración compartida

- `.claude/agents/` — agentes del proyecto (versionados).
- `.claude/settings.json` — permisos y MCP habilitados para todo el equipo.
- `.mcp.json` — servidor MCP Context7, sin secretos: la key se expande
  desde la variable de entorno `CONTEXT7_API_KEY` de cada desarrollador.
- `.claude/skills/` — skills propias del proyecto (`convenciones-git`,
  `revision-de-ui`) y enlaces a las de terceros.
- `.agents/skills/` y `skills-lock.json` — skills de terceros, versionadas para
  que el repo funcione al clonarlo sin instalar nada.
- `.claude/hooks/bloquear-git-push.sh` — impide que **cualquier subagente**
  publique en el remoto. Es una lista negra por defecto, así que un agente nuevo
  queda cubierto sin tocar el hook. Solo pasan la sesión principal y el
  arquitecto.
- `.claude/hooks/limitar-gh.sh` — el mismo criterio para `gh`, porque publicar un
  issue es tan "hacia afuera" como un push. Acá la lista es **blanca por
  comando**, al revés que en el otro: lectura para todos, escritura de issues
  solo para el `delivery-specialist`, y todo lo demás denegado —`gh pr`,
  `gh repo`, `gh release`, `gh label create`, `gh api` de escritura—. Un
  subcomando nuevo de `gh` **nace denegado**, que es lo correcto para algo que
  toca el remoto.
- `.claude/settings.local.json` — configuración personal, ignorada por git.
