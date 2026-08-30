# platform-argentum

Contexto de proyecto para Claude Code. Este archivo se carga automáticamente en
cada sesión y en cada subagente, así que se mantiene corto y factual.

## Estado actual

**Proyecto greenfield: todavía no hay código.** La arquitectura y el stack ya
están decididos y documentados en `docs/architecture/adr/`.

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

## Principio de arquitectura

Mínimo necesario para validar el producto, diseñado para poder crecer. Cada
tecnología, patrón, abstracción o capa necesita una razón concreta y presente.
Ante la duda: la opción más simple que pueda evolucionar.

## Documentación

- `docs/architecture/` — análisis funcional y diseño.
- `docs/architecture/adr/` — decisiones arquitectónicas (ADR). Leelas antes de
  proponer cambios que las contradigan.

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
- `.claude/settings.local.json` — configuración personal, ignorada por git.
