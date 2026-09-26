#!/bin/bash
# Limita lo que los subagentes pueden hacer con el servidor MCP de Neon.
#
# Cuarto hook de la familia (bloquear-git-push.sh, limitar-gh.sh,
# limitar-vercel.sh), y el primero que no mira `Bash`: mira herramientas MCP.
# El criterio es el del ADR 0021. Los otros tres hooks no ven el MCP de Neon
# —una llamada a `run_sql` no pasa por Bash—, así que sin este archivo una
# escritura en la base de producción no tendría ningún portón propio: solo el
# aviso genérico de permisos de Claude Code, que no dice que es producción.
#
# El plugin `neon-postgres@neon` está habilitado solo en la configuración
# personal del usuario (`.claude/settings.local.json`), no para el equipo. Este
# hook se versiona igual: en un clon sin el plugin no existe ninguna
# herramienta que matchee, así que no corre nunca y no cuesta nada. Versionar
# la guarda y no la herramienta es a propósito: si alguien habilita el plugin
# mañana, nace protegido.
#
# Cuatro salidas, en este orden de evaluación:
#
#   1. LECTURA (lista blanca por nombre): pasa sin preguntar.
#   2. DENEGADO, siempre, porque ninguna aprobación en el momento reemplaza la
#      decisión que falta:
#      - productos de Neon que el proyecto no eligió (Neon Auth —usamos Better
#        Auth, ADR 0019—, Data API, Functions, Object Storage, AI Gateway): se
#        adoptan con un ADR, no con un clic;
#      - crear o borrar proyectos, y restaurar snapshots: no escriben datos,
#        reemplazan o destruyen la rama o el proyecto entero; son del usuario,
#        desde la consola de Neon;
#      - `complete_database_migration` y `complete_query_tuning`: aplican un
#        cambio de esquema sobre la rama padre por fuera de drizzle-kit, y el
#        diario de migraciones (ADR 0005) queda desincronizado de la base.
#   3. PREGUNTA, sin mirar la rama: `create_branch` (crea una rama descartable,
#      no escribe en ninguna) y cualquier herramienta que devuelva credenciales
#      (`get_connection_string` y parecidas).
#   4. PREGUNTA, y la rama decide el tono del mensaje:
#      - rama protegida y operación que escribe → mensaje de PRODUCCIÓN, en
#        mayúsculas y al principio, imposible de pasar por alto. Antes era
#        `deny`; pasó a `ask` por decisión del usuario (ADR 0021);
#      - rama protegida y un `SELECT`/`EXPLAIN`/`SHOW` evidente → lectura de
#        producción, mensaje normal;
#      - cualquier otra rama, o una herramienta que no está en ninguna lista
#        —incluida una que Neon agregue mañana— → mensaje normal. La lista es
#        blanca, así que lo desconocido nace preguntando.
#
# «Rama protegida» significa: la llamada no trae `branchId` (el MCP usa
# entonces la rama por defecto del proyecto, que es la de producción), o
# trae uno que figura en la variable de entorno NEON_RAMAS_PROTEGIDAS (lista
# separada por comas de ids `br-…`), o se llama `main` o `production`. La
# variable es opcional y personal: el usuario la define en su settings local
# con el id real de su rama de producción, que este archivo no puede conocer.
# Sin ella, una escritura que nombre el id `br-…` de producción pregunta con
# el mensaje NORMAL, no con el de PRODUCCIÓN: el hook no tiene cómo saber que
# es producción. Nunca pasa sin preguntar; lo que se pierde es el aviso.
#
# La detección de SQL de solo lectura es una heurística (una sola sentencia,
# arranca con SELECT, EXPLAIN o SHOW, ninguna palabra que modifique). Solo
# decide qué mensaje se muestra: nada pasa sin preguntar por ella.
#
# `ask` necesita a alguien que conteste. En modo automático Claude Code no
# muestra el diálogo y la llamada se rechaza; para este hook eso es fallar
# del lado seguro.
#
# Solo pasa sin restricción la sesión principal, que es donde está el usuario
# y donde Claude Code ya le pide permiso por cada herramienta MCP que no esté
# en su lista de permitidas. Mismo criterio que los otros tres hooks.
#
# QUIÉN ESCRIBE (ADR 0022): solo el `infra-specialist`. Cualquier otro
# subagente —el `database-specialist`, que conserva el MCP para diagnosticar, o
# un agente del plugin de Vercel, que trae todas las herramientas— lee lo que
# está en la lista blanca y puede pedir un `SELECT`/`EXPLAIN` evidente (que
# pregunta igual); todo lo demás se le deniega con el nombre de a quién
# pedírselo. Es la regla del rol aplicada, no escrita: un solo escritor.
#
# VERIFICADO contra el servidor real (`plugin:neon:neon`, autenticado, 117
# herramientas): prefijo `mcp__plugin_neon_neon__*`, argumentos planos, rama
# en `branch_id`. El hook sigue leyendo también la forma anidada en `params` y
# `branchId`, por si el servidor cambia.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
HERRAMIENTA=$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

# `mcp__<prefijo>__<herramienta>` → `<herramienta>`
NOMBRE="${HERRAMIENTA##*__}"

RAMA=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.params.branchId // .tool_input.branchId // .tool_input.params.branch_id // .tool_input.branch_id // empty')
SQL=$(printf '%s' "$ENTRADA" | jq -r '
  (.tool_input.params.sql // .tool_input.sql // empty),
  ((.tool_input.params.sqlStatements // .tool_input.sqlStatements // [])[]?)
')

responder() {
  jq -n --arg d "$1" --arg r "$2" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: $d,
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

denegar()   { responder deny "$1"; }
preguntar() { responder ask  "$1"; }

rama_protegida() {
  [ -z "$RAMA" ] && return 0
  case "$RAMA" in main|production) return 0 ;; esac
  if [ -n "$NEON_RAMAS_PROTEGIDAS" ]; then
    printf '%s' "$NEON_RAMAS_PROTEGIDAS" | tr ',' '\n' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g' | grep -Fxq -- "$RAMA" && return 0
  fi
  return 1
}

sql_de_solo_lectura() {
  [ -z "$SQL" ] && return 1
  # Una sola sentencia: un `;` seguido de algo que no sea espacio es otra.
  printf '%s' "$SQL" | tr '\n' ' ' | grep -Eq ';[[:space:]]*[^[:space:]]' && return 1
  printf '%s' "$SQL" | grep -Eiq '^[[:space:]]*(select|explain|show)[[:space:]]' || return 1
  printf '%s' "$SQL" | grep -Eiqw '(insert|update|delete|merge|drop|alter|create|truncate|grant|revoke|copy|call|do|vacuum|reindex|cluster|refresh|lock|set|reset|comment|security|analyze|nextval|setval|into)' && return 1
  return 0
}

ANALYZE=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.params.analyze // .tool_input.analyze // false')

# 1. Lectura: pasa sin preguntar.
case "$NOMBRE" in
  list_*|describe_*) exit 0 ;;
  get_database_tables|compare_database_schema|inspect_database) exit 0 ;;
  query_logs|search|fetch|get_doc_resource) exit 0 ;;
  # `get_*` de metadatos, verificados contra el servidor real. Nunca un
  # `get_*` genérico: `get_connection_string` trae credenciales.
  get_branch|get_default_branch|get_operation|get_snapshot_schedule) exit 0 ;;
  get_postgres_database|get_postgres_endpoint|get_postgres_role) exit 0 ;;
  # EXPLAIN ANALYZE ejecuta la sentencia: con analyze no es lectura y sigue
  # hacia la regla de la rama.
  explain_sql_statement) [ "$ANALYZE" != "true" ] && exit 0 ;;
esac

# 2. Denegado siempre.
case "$NOMBRE" in
  *auth*)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\`: Neon Auth no es el sistema de autenticación del proyecto (ADR 0019, Better Auth). Denegado por ADR 0021." ;;
  *data_api*|*function*|*trigger*|*bucket*|*object*|*storage*|*presign*|*gateway*)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\`: es un producto de Neon que el proyecto no eligió. Denegado por ADR 0021; si hace falta, se decide con un ADR." ;;
  create_project|delete_project)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\`: crear o borrar proyectos de Neon es del usuario, desde la consola de Neon. Denegado por ADR 0021." ;;
  *restore*)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\`: restaurar un snapshot reemplaza la rama entera y es del usuario, desde la consola de Neon. Denegado por ADR 0021." ;;
  complete_database_migration|complete_query_tuning)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\`: aplica un cambio de esquema por fuera de drizzle-kit y desincroniza el diario de migraciones (ADR 0005). Denegado por ADR 0021: la migración se genera con drizzle-kit y se aplica con \`pnpm db:migrate\`." ;;
esac

# 2-bis. Un solo escritor (ADR 0022). Otro agente solo puede pedir una
# sentencia de lectura evidente, que sigue hacia la regla 4 y pregunta.
ESCRITOR="infra-specialist"
if [ "$AGENTE" != "$ESCRITOR" ]; then
  case "$NOMBRE" in
    run_sql|explain_sql_statement) sql_de_solo_lectura || denegar "El agente $AGENTE quiso usar \`$NOMBRE\` de Neon con una sentencia que no es de solo lectura evidente. En Neon escribe solo el $ESCRITOR (ADR 0022): pedíselo a él.${SQL:+ SQL: $SQL}" ;;
    *) denegar "El agente $AGENTE quiso usar \`$NOMBRE\` de Neon. Fuera de la lectura, en Neon opera solo el $ESCRITOR —ramas, credenciales, escrituras— (ADR 0022): pedíselo a él." ;;
  esac
fi

# 3. Casos que no dependen de la rama.
case "$NOMBRE" in
  create_branch)
    # Crea una rama descartable a partir de la padre: no escribe en ella.
    preguntar "El agente $AGENTE quiere crear una rama de Neon. No toca producción, pero consume cuota y hay que acordarse de borrarla (ADR 0021)." ;;
  get_connection_string|*connection*|*credential*|*password*)
    preguntar "El agente $AGENTE quiere obtener una cadena de conexión de Neon ${RAMA:+(rama \`$RAMA\`) }: trae credenciales, que quedan en la transcripción. Aprobá solo si es de una rama descartable y para correr drizzle-kit contra ella; nunca la de producción, nunca escrita en un archivo del árbol (ADR 0021)." ;;
esac

# 4. Todo lo demás pregunta; la rama decide el mensaje.
if rama_protegida; then
  if [ "$NOMBRE" = "run_sql" ] && sql_de_solo_lectura; then
    preguntar "El agente $AGENTE quiere LEER producción en Neon (${RAMA:-rama por defecto, sin branchId}) con \`run_sql\`. La sentencia parece de solo lectura, pero es una heurística: revisala antes de aprobar. SQL: $SQL"
  fi
  preguntar "⚠️ PRODUCCIÓN ⚠️ — ESCRITURA EN LA BASE DE NEON DE PRODUCCIÓN, NO SE DESHACE.
Agente: $AGENTE
Operación: \`$NOMBRE\`
Rama: ${RAMA:-ninguna indicada → la rama por defecto, que es producción}${SQL:+
SQL: $SQL}
No hay política de copias todavía (ADR 0006): lo que esto borre o pise no vuelve. Aprobá solo si pediste esta operación exacta y leíste la sentencia completa; ante la duda, rechazá (ADR 0021)."
fi

preguntar "El agente $AGENTE quiere usar \`$NOMBRE\` de Neon sobre la rama \`$RAMA\`, que no figura como protegida. Verificá que no sea producción antes de aprobar (ADR 0021).${SQL:+ SQL: $SQL}"
