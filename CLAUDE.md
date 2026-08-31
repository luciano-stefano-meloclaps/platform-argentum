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

### Especialistas

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

**Qué pueden hacer solos:** escribir código en su área, invocar skills, commitear
siguiendo `convenciones-git`, convocar a otro especialista o al arquitecto con
`Agent`, y preguntarle al usuario mandándole un mensaje a `main` con
`SendMessage` sin cortar el trabajo.

**Qué no pueden:** `git push` —bloqueado por un hook para **todo** subagente,
ver abajo—, cambiar una decisión ya tomada, instalar dependencias o contradecir
un ADR. Eso se propone y se espera. `AskUserQuestion` no existe para ningún
subagente: si algo los bloquea de verdad, terminan el turno con las preguntas
escritas.

La costura entre ellos: el `database-specialist` define el esquema y las
migraciones, el `backend-specialist` escribe las consultas dentro de sus módulos,
y el `frontend-specialist` **nunca** toca la base — le pide al módulo.

## Principio de arquitectura

Mínimo necesario para validar el producto, diseñado para poder crecer. Cada
tecnología, patrón, abstracción o capa necesita una razón concreta y presente.
Ante la duda: la opción más simple que pueda evolucionar.

## Documentación

- `CONTEXT.md` — glosario del dominio. **Usá estos términos exactos**; no
  inventes sinónimos para conceptos que ya tienen nombre.
- `docs/adr/` — decisiones arquitectónicas (ADR). Leelas antes de proponer
  cambios que las contradigan.

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
- Siguen siendo de invocación manual, a propósito: `grill-me` (la pedís vos
  cuando querés que te interroguen) y `to-tickets` con `setup-matt-pocock-skills`
  (quedan para cuando exista el agente de GitHub, que es quien va a manejar el
  tracker).
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
- `.claude/settings.local.json` — configuración personal, ignorada por git.
