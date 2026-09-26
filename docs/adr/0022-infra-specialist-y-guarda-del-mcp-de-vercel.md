# 0022 — Un especialista de infraestructura dueño de Vercel y Neon, y la guarda del MCP de Vercel

- **Estado:** Aceptado
- **Fecha:** 2026-09-25
- **Decide:** Luciano Melo Claps (el rol); diseño del `super-architect`

## Decisión

Se crea el **`infra-specialist`**, cuarto especialista de área (nivel 3), dueño
de **dónde corre el sistema y cómo se conecta**: Vercel, Neon y sus ramas, las
variables de entorno, los despliegues, `docker-compose.yml`, `.env.example` y
los runbooks. Es el **único agente que escribe en Neon**, y pasa a ser el
**responsable de `vercel:deployment-expert`** en lugar del arquitecto. El
`database-specialist` se queda con lo que hay **adentro** de la base y conserva
el MCP de Neon **solo para leer**.

El MCP de Vercel, que hasta hoy no tenía guarda, pasa por un hook nuevo,
`.claude/hooks/limitar-vercel-mcp.sh`: **lectura libre**; **escrituras con
confirmación** y la entrada completa a la vista (ADR 0010), con un aviso de
PRODUCCIÓN para lo que toca el sitio publicado; **credenciales con
confirmación** aunque sean lecturas; y **compras, facturación y cambios de
propiedad de la cuenta, denegados**.

## Contexto

Con los plugins de Vercel y de Neon autenticados, el trabajo de plataforma dejó
de ser esporádico: poblar producción (#121), las variables y la migración de
Better Auth (#123, #124), variables huérfanas (`DATABASE_URL_DIRECT`), Neon
Auth habilitado sin uso, y la decisión de dar ramas de Neon a Preview y
Development, que hoy comparten la base de producción. Ese trabajo estaba
repartido entre el `database-specialist` («entornos local/Neon», y desde el
borrador del ADR 0021 el MCP de Neon entero) y el arquitecto (responsable de
`deployment-expert`). El usuario pidió un agente propio para las dos
plataformas, para no cargar al arquitecto con operación.

El MCP de Vercel expone unas 240 herramientas, entre ellas despliegue,
variables, promoción, rollback, firewall, dominios y **compras** (`buy_domain`,
`buy_pro`, `buy_credits`, `buy_addon`…). `limitar-vercel.sh` solo mira el
comando `vercel` en `Bash`, así que el MCP no tenía ningún portón del proyecto.

## Problema

Dos, y los dos presentes:

1. **Nadie era dueño de la plataforma como tal.** El que sabe de esquema no es
   necesariamente el que tiene que operar ramas, credenciales y despliegues, y
   el arquitecto sostiene la visión del sistema: cada diagnóstico de un
   despliegue le come ese espacio.
2. **Un subagente podía comprar o desplegar en Vercel sin un portón propio.**
   Solo con el diálogo genérico de permisos, que no dice qué entorno toca.

## Alternativas consideradas

### A. Todo al `database-specialist`
Ampliar su territorio a Vercel.

### B. Un `infra-specialist` de nivel 3, dueño de las dos plataformas
Con Write acotado a los artefactos de plataforma del árbol.

### C. Un consultor sin archivos, a la manera de los agentes del plugin de Vercel
Opera y reporta; no escribe en el árbol.

### Para quién escribe en Neon
- **C1.** Los dos, `database-specialist` e `infra-specialist`.
- **C2.** Solo el `infra-specialist`; el `database-specialist` lee.
- **C3.** Solo el `infra-specialist`; el `database-specialist` sin MCP.

### Para la guarda de Vercel
- **G1.** Extender `limitar-vercel.sh` para que mire también el MCP.
- **G2.** Un hook aparte para el MCP, mismo patrón que `limitar-neon.sh`.

### Para las guardas de plataforma
- **H1.** El `infra-specialist` las edita.
- **H2.** El criterio es suyo; el archivo lo escribe la sesión principal o el
  arquitecto.

### Skill propia de plataforma
- **S1.** Una skill citable con las convenciones de las dos plataformas.
- **S2.** Nada: las convenciones viven en el archivo del agente.

## Trade-offs

| Opción | A favor | En contra |
| ------ | ------- | --------- |
| A | Ningún agente nuevo | Mezcla dos oficios; el `database-specialist` pasa a operar despliegues que no tienen nada que ver con el esquema |
| **B** | Un dueño con artefactos reales (`docker-compose.yml`, `.env.example`, runbooks, CI futuro) | Un agente más que mantener, y una costura nueva con el `database-specialist` |
| C | Sin permisos de escritura en el árbol | #121 pide un script y un runbook: alguien tiene que escribirlos, y sería otro traduciendo |
| C1 | Nadie depende de nadie para ensayar | Dos escritores sobre producción: la regla «un solo escritor» vuelve a ser un párrafo |
| **C2** | El diagnóstico queda con quien sabe leer un `EXPLAIN`; la escritura, con uno solo, aplicado por el hook | Ensayar una migración en una rama real pasa por dos agentes |
| C3 | El límite más limpio | Deja al `database-specialist` sin diagnóstico sobre datos reales |
| G1 | Un solo archivo por plataforma | Mezcla dos entradas distintas (un comando de shell y una herramienta con argumentos) en un script ya denso |
| **G2** | Cada hook lee una sola forma de entrada; mismo patrón que Neon | Un archivo más |
| H1 | Menos intermediarios | **Un agente que edita su propia guarda no tiene guarda** |
| **H2** | La guarda sigue siendo un portón | Cambiar una lista pasa por otro |
| S1 | Un lugar citable | Hoy lo consume un solo agente; `identidad-argentum` y `voz-narrativa` existen porque las citan varios |
| **S2** | Cero documentos nuevos | Si aparece un segundo consumidor, hay que extraerla |

## Decisión elegida

**B, con C2, G2, H2 y S2.**

**El rol.** `infra-specialist`, nivel 3. Es dueño de Vercel (proyecto,
despliegues, promoción, rollback, dominios, variables por entorno), de Neon
(proyecto, ramas, credenciales, retención y copias), de `docker-compose.yml`,
de `.env.example`, de `docs/runbooks/`, de los scripts `pnpm desplegar:*` y de
`.github/workflows/` cuando exista. No toca el esquema, las migraciones ni
`drizzle.config.ts` (`database-specialist`), `src/` ni `contenido/`
(`backend-specialist`), la interfaz (`frontend-specialist`), git ni el tracker
(`delivery-specialist`), ni `.claude/`. Migrar e importar en producción lo
sigue ejecutando el usuario (#121, #124). Neon se opera **solo por el MCP**: sin
`neonctl` ni la CLI `neon`, que no pasan por la guarda.

**Herramientas.** Read, Glob, Grep, Bash, Write, Edit (acotado por conducta a
los artefactos de arriba), WebFetch, WebSearch, Context7, los MCP de Neon y de
Vercel, y `Agent` sobre `vercel:deployment-expert`, `database-specialist`,
`backend-specialist`, `super-architect` y `delivery-specialist`. Lo convocan el
arquitecto, el `delivery-specialist` (le reparte tickets), el
`database-specialist` y el `backend-specialist`. No commitea ni publica.

**Neon, un solo escritor.** `limitar-neon.sh` ahora mira quién llama: el
`infra-specialist` sigue el criterio del ADR 0021; cualquier otro subagente
lee la lista blanca y puede pedir un `SELECT`/`EXPLAIN`/`SHOW` evidente (que
pregunta), y todo lo demás se le deniega con el nombre de a quién pedírselo.
Eso incluye a `deployment-expert`, que trae todas las herramientas.

**La guarda del MCP de Vercel**, en este orden:

1. **Denegado:** `buy_*`, y toda herramienta que no sea lectura y hable de
   *purchase*, *order*, *billing*, *credits*, *transfer* o `join_team`.
2. **Pregunta, por credenciales:** lecturas que devuelven secretos (valores de
   variables, tokens, claves, bypass) y herramientas que los crean (API keys,
   SDK keys, KMS, SSO).
3. **Pasa:** `list_*`, `get_*`, `filter_*`, `search_*`, `count_*`,
   `aggregate_*`, `read_*`, `status`, `artifact_query`, `web_fetch_vercel_url`
   y la documentación.
4. **Pregunta con aviso de PRODUCCIÓN:** promover, rollback, pausar, alias,
   dominios, DNS, firewall, rolling release, ajustes del proyecto, y cualquier
   escritura cuya entrada mencione `production`.
5. **Pregunta:** todo lo demás, incluida cualquier herramienta nueva.

La sesión principal no pasa por ningún hook, como siempre.

## Motivo

B es lo que pidió el usuario, y pasa la regla de la puerta con problemas
presentes: siete pendientes de plataforma sin dueño claro y un arquitecto que no
debería operar. C2 es la única que mantiene «un solo escritor» como regla
aplicada sin dejar al `database-specialist` sin diagnóstico. H2 por el mismo
argumento que dejó sin `Write` al `ui-reviewer` y al `delivery-specialist`: el
portón no lo abre quien tiene que pasarlo. S2 porque la skill no tiene todavía
un segundo lector. La guarda de Vercel sigue el ADR 0010 —pregunta, no
deniega— salvo en compras: gastar plata no se revierte con un rollback, y es
del usuario desde el panel.

Verificación: la guarda se probó con los 242 nombres reales del servidor
`plugin:vercel:vercel` (126 pasan, 65 preguntan, 24 preguntan por credenciales,
17 preguntan con aviso de PRODUCCIÓN, 10 se deniegan: las siete `buy_*`,
`create_or_transfer_domain`, `accept_project_transfer_request` y `join_team`),
y la de Neon con entradas simuladas para el `infra-specialist`, el
`database-specialist` y `vercel:deployment-expert`.

## Consecuencias

**Aceptamos:**
- Ensayar una migración sobre datos reales pasa por dos agentes: el
  `database-specialist` la escribe, el `infra-specialist` la corre en una rama
  descartable y la borra.
- Cambiar una guarda pasa por la sesión principal o el arquitecto.
- `create_project_env` y `edit_project_env` llevan el valor en la entrada, y el
  mensaje del hook lo muestra: es el precio de ver lo que se escribe.
- La detección de «producción» en la entrada es por texto: solo decide el tono
  del mensaje; nada pasa sin preguntar por ella.
- Los productos de Vercel que el proyecto no eligió (Sandbox, Flags, AI
  Gateway, KMS…) **preguntan**, no se deniegan como en Neon. Hoy no hay
  evidencia de que se estén colando; si pasa, se agregan al `deny`.

**Obtenemos:**
- Un dueño para la plataforma, y el arquitecto fuera de la operación.
- Un solo escritor sobre Neon, aplicado por el hook.
- Ninguna compra posible desde un subagente.

**Deuda técnica asumida:**
- **Production, Preview y Development comparten la base de producción.** No se
  resuelve acá: es la primera propuesta que se espera del `infra-specialist`, y
  la decide el arquitecto con un ADR.
- **No hay política de copias** (ADR 0006): ahora tiene dueño, el
  `infra-specialist`.

**Revisar si:**
- Un segundo agente necesita consultar las convenciones de plataforma
  regularmente (por ejemplo, ramas por PR): ahí se extrae la skill.
- Aparece un producto de Vercel usado sin ADR: se deniega en el hook.
- Las confirmaciones se aprueban sin leer (mismo disparador que el ADR 0010).
- Vercel renombra o agrega herramientas de compra que no caen en los patrones.
