# 0023 — Bases separadas por entorno en Neon y una guarda del destino para los comandos de base

- **Estado:** Aceptado (ticket #122). El usuario delegó las decisiones de diseño
  en el arquitecto y el equipo. **Supersede parcialmente** al
  [ADR 0006](0006-infraestructura-vercel-neon.md) en un solo punto: reemplaza
  «una rama de base por pull request» por una rama fija `preview`.
- **Fecha:** 2026-09-25
- **Decide:** Luciano Melo Claps

## Decisión

1. **Dos bases, no tres.** Producción es la rama `main` de Neon. Las vistas
   previas de Vercel usan **una sola rama fija, `preview`, hija de `main`**.
   **Desarrollo local es el PostgreSQL de Docker** (ADR 0006): no hay rama
   `dev` en Neon.
2. **Variables por entorno, sin compartir.** `DATABASE_URL` de Production es la
   que inyecta la integración de Neon. `DATABASE_URL` de Preview es la cadena
   con pooler de la rama `preview`, cargada aparte. **Development queda sin
   `DATABASE_URL` en Vercel**: en local la fuente es `.env`.
   `DATABASE_URL_UNPOOLED` no se carga en Preview (solo la lee drizzle-kit, que
   corre desde la máquina de quien migra). `DATABASE_URL_DIRECT`, sin uso, se
   elimina si no la administra la integración.
3. **Guarda del destino** en los dos comandos que escriben en la base desde
   una máquina: `contenido:importar` y `db:migrate`. **Falla cerrada:** un
   destino local (`localhost`, `127.0.0.1`, `[::1]`) pasa; **cualquier otro host
   se rechaza salvo que la variable `DB_CONFIRMAR_DESTINO` valga exactamente ese
   host**, escrito a mano en el comando. Es una función pura, sin red, que solo
   informa el host y nunca la cadena (trae la contraseña). El sufijo `-pooler`
   del primer segmento del host se normaliza, para que la cadena de la app y la
   de drizzle-kit (mismo endpoint, nombres distintos) se confirmen con el mismo
   valor.
4. **Sin lista de hosts configurable, sin variable del host de producción, sin
   `--produccion`, sin confirmación interactiva, sin cubrir `db:ping`.** Ver
   «Motivo».
5. **`main` protegida en Neon**, si el plan lo permite sin costo.

## Contexto

Confirmado por el `infra-specialist` (solo lectura): en Vercel, `DATABASE_URL`
y `DATABASE_URL_UNPOOLED` son **un solo registro** asignado a Production,
Preview y Development. En Neon existe **una sola rama**, `main`, predeterminada
y sin proteger. Consecuencia: una vista previa, o `pnpm db:migrate` /
`contenido:importar` desde una máquina con `vercel env pull`, escribe en
producción. El ADR 0006 prometía «una rama por pull request», que nunca se
configuró.

Hoy el contenido se importa a mano (ADR 0004), no hay cuentas ni datos de
usuarios, y no hay política de copias.

## Problema

Impedir que Preview y Development escriban en producción, y que un comando
lanzado desde una máquina lo haga por accidente, con el menor mecanismo posible.

## Alternativas consideradas

### A. Rama fija `preview` (y una `dev`)
### B. Una rama por pull request (integración de Neon, ramas efímeras)
### C. Solo la guarda, sin ramas nuevas
Producción sigue siendo la única base y se confía en el código.

## Trade-offs

| Alternativa | A favor | En contra |
| ----------- | ------- | --------- |
| A (solo `preview`) | Una rama, un endpoint, una variable por entorno; sin automatización; cero costo relevante | Las vistas previas comparten base: dos PR con migraciones distintas se pisan |
| A con `dev` | Nada que Docker no dé ya | Una rama y variables más para un entorno que ya existe gratis y sin conexión |
| B | Aislamiento total por PR | Requiere configurar la integración; nace con **copia de producción** (hoy inocua, con cuentas serían datos personales, posiblemente de menores); las ramas quedan vacías de contenido porque la importación es manual; hay que gestionar su borrado |
| C | Cero infraestructura | Una guarda de código no protege a una vista previa, que corre en Vercel con la cadena de producción |

## Decisión elegida

**A, solo `preview`**, más la guarda (3) y la separación de variables (2).

## Motivo

- **`dev` no existe:** el ADR 0006 ya eligió Docker para desarrollo; una rama
  `dev` sería duplicar lo que ya está resuelto.
- **Por PR es la solución al problema de otro tamaño.** El problema presente es
  «Preview escribe en producción». Una sola rama lo elimina. El aislamiento por
  PR resuelve un problema que hoy no existe: un solo desarrollador, casi sin
  PR concurrentes con migraciones.
- **La guarda falla cerrada** porque el peligro real es lo no previsto: un host
  desconocido, una `.env` traída con `vercel env pull`. Una lista de «prohibidos»
  deja pasar lo que nadie pensó; «solo local, lo demás con confirmación
  nombrada» no.
- **La confirmación es una variable con el host exacto, no un `true` ni un
  prompt.** Obliga a escribir el destino a propósito (un `.env` heredado no la
  trae y un alias de shell genérico tampoco acierta el host) y es testeable como
  función pura. La confirmación interactiva se descarta: agrega lectura de
  terminal, un caso «sin TTY» y pruebas con streams, para proteger de lo mismo
  que ya protege escribir el host a mano. La variable no se guarda en `.env`:
  se antepone al comando de esa corrida.
- **No hay `DB_HOST_PRODUCCION`.** Distinguiría producción de `preview`, pero
  ambos son bases remotas que solo un humano debería tocar a propósito: los dos
  exigen la misma confirmación nombrada. Una variable más para dar un nivel
  extra de fricción a un solo desarrollador es un problema anticipado.
  *Disparador para reconsiderar:* más de una persona ejecutando migraciones, o
  un incidente contra producción.
- **No hay lista `*_HOSTS_PERMITIDOS`**: con «local pasa, el resto se confirma»
  es redundante, y una lista configurable es una segunda forma de saltarse la
  guarda.
- **Cubre `db:migrate`** porque es el otro comando que escribe desde una
  máquina, y el riesgo es idéntico. El módulo es compartido por dos llamadores
  reales, y vive en `src/db/` (no en `catalogo`) porque uno de ellos no es del
  catálogo. El envoltorio evalúa **`DATABASE_URL_UNPOOLED`**, que es la que lee
  drizzle-kit, no `DATABASE_URL`: por eso la función recibe la cadena, no el
  entorno entero.
- **No cubre `db:ping`**: solo hace lectura (`SELECT`); una guarda que
  bloquea un ping legítimo contra Neon a cambio de nada erosiona la costumbre de
  confirmar.
- **El host va solo en la confirmación, no en el código ni en la configuración.**
  No es secreto; no se versiona porque cambia si se recrea el endpoint.
- **`main` protegida:** en Neon la protección evita borrarla o resetearla y
  restringe accesos; **no impide escrituras**. Vale como cinturón adicional, no
  como defensa principal. *No verificado:* si el plan actual la incluye; si
  tiene costo, no se adopta y la guarda alcanza.

## Consecuencias

**Aceptamos:**
- Las vistas previas comparten una base y su esquema/contenido se actualiza a
  mano (migrar e importar contra `preview`, con el mismo procedimiento que en
  producción).
- Que la guarda es de conducta de herramienta: no frena a quien corre SQL directo.

**Deuda técnica:** una sola rama de vista previa. **Disparador para pasar a una
rama por PR:** dos PR abiertos a la vez con migraciones que chocan, o la
llegada del módulo `identidad` (datos personales: `preview` deberá crearse sin
datos, no como copia de producción, y hay que decidirlo antes).

**Cambios que arrastra (los ejecutan otros, ver ticket):**
- `src/db/guarda-de-destino.mts` con `evaluarDestino(url, confirmacion)`,
  invocado por el importador y por un envoltorio `src/db/migrar.mts` que
  reemplaza al script `db:migrate`; pruebas del comportamiento (local pasa; host
  ajeno se rechaza; confirmación exacta habilita; `-pooler` normalizado; la
  cadena no aparece en ningún resultado). Reusa lo ya escrito en
  `src/catalogo/importacion/guarda-de-destino.mts`, que se mueve y se simplifica.
- `.env.example`: documentar `DB_CONFIRMAR_DESTINO` (solo la forma, comentada).
- Runbook de entornos: crear/renovar `preview`, cargar variables, migrar e
  importar contra cada base.

**Reparto operativo:**
- **Usuario (paneles):** quitar Preview y Development del registro de la
  integración en Vercel (o desactivarlos en los ajustes de la integración; el
  `infra-specialist` debe confirmar antes cuál de las dos vías existe y si la
  integración los reinyecta); cargar `DATABASE_URL` de Preview copiando la
  cadena de la rama `preview` de Neon a Vercel (**el secreto no pasa por un
  agente**); proteger `main` en Neon si el plan lo permite; migrar e importar en
  producción, como en #121 y #124.
- **`infra-specialist`:** crear la rama `preview` por el MCP (con confirmación),
  verificar con lectura que cada entorno de Vercel apunta a la base correcta
  (`env ls`, sin valores), eliminar `DATABASE_URL_DIRECT` si no es de la
  integración, ensayar migraciones en ramas descartables, y escribir el
  runbook. **No** toca producción ni carga cadenas de conexión.
