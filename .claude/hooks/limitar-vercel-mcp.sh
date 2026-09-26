#!/bin/bash
# Limita lo que los subagentes pueden hacer con el servidor MCP de Vercel.
#
# Quinto hook de la familia. `limitar-vercel.sh` media el comando `vercel` en
# Bash; una herramienta MCP no pasa por Bash, así que sin este archivo el MCP
# de Vercel (`mcp__plugin_vercel_vercel__*`, que trae el plugin habilitado para
# el equipo) podría desplegar, cambiar variables o COMPRAR sin ningún portón
# del proyecto. El criterio es el del ADR 0010, extendido al MCP por el ADR
# 0022: un agente puede escribir en Vercel, nunca en silencio.
#
# Cinco salidas, en este orden de evaluación:
#
#   1. DENEGADO — compras, facturación y cambios de propiedad de la cuenta:
#      `buy_*`, y todo lo que no sea lectura y hable de purchase, order,
#      billing, credits, transfer o join_team. Gastan plata o cambian quién
#      paga; eso lo hace el usuario desde el panel, nunca un agente, ni con
#      aprobación en el momento (un clic de más no se revierte con un
#      rollback).
#   2. PREGUNTA — herramientas que traen o crean credenciales (tokens, claves,
#      valores de variables de entorno, enlaces de bypass). Van antes que la
#      lectura porque varias son `get_*`/`list_*` y la lista blanca las dejaría
#      pasar.
#   3. LECTURA — `list_*`, `get_*`, `search_*`, `count_*`, `aggregate_*`,
#      `read_*`, `status`, `artifact_query`, `web_fetch_vercel_url` y la
#      documentación: pasan sin preguntar.
#   4. PREGUNTA CON AVISO DE PRODUCCIÓN — lo que por naturaleza toca el sitio
#      publicado (promover, rollback, pausar, alias, dominios, DNS, firewall,
#      rolling release, ajustes del proyecto) y cualquier escritura cuya
#      entrada mencione `production`.
#   5. PREGUNTA — todo lo demás, incluida cualquier herramienta que Vercel
#      agregue mañana: la lista de lectura es blanca, así que lo desconocido
#      nace preguntando.
#
# El mensaje de `ask` lleva la herramienta y su entrada completa (recortada a
# 2000 caracteres): «con el detalle a la vista», como pide el ADR 0010.
#
# Solo pasa sin restricción la sesión principal, que es donde está el usuario y
# donde Claude Code ya pide permiso por cada herramienta MCP. Mismo criterio
# que los otros cuatro hooks.
#
# `ask` necesita a alguien que conteste: en modo automático la llamada se
# rechaza, que para este hook es fallar del lado seguro.
#
# Nombres verificados contra el servidor real (`plugin:vercel:vercel`,
# autenticado) el 2026-09-25.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
HERRAMIENTA=$(printf '%s' "$ENTRADA" | jq -r '.tool_name // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

# `mcp__<prefijo>__<herramienta>` → `<herramienta>`
NOMBRE="${HERRAMIENTA##*__}"

DETALLE=$(printf '%s' "$ENTRADA" | jq -c '.tool_input // {}' | cut -c1-2000)

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

es_lectura_por_prefijo() {
  case "$NOMBRE" in
    list_*|get_*|filter_*|search_*|count_*|aggregate_*|read_*) return 0 ;;
  esac
  return 1
}

# 1. Denegado siempre: compras, facturación, propiedad de la cuenta.
case "$NOMBRE" in
  buy_*)
    denegar "El agente $AGENTE quiso usar \`$NOMBRE\` de Vercel: es una COMPRA. Las compras y la facturación las hace el usuario desde el panel de Vercel, nunca un agente. Denegado por ADR 0022." ;;
esac
if ! es_lectura_por_prefijo; then
  case "$NOMBRE" in
    *purchase*|*order*|*billing*|*credits*|*transfer*|join_team)
      denegar "El agente $AGENTE quiso usar \`$NOMBRE\` de Vercel: gasta plata o cambia la propiedad de la cuenta (compra, facturación, transferencia, membresía). Es del usuario, desde el panel. Denegado por ADR 0022." ;;
  esac
fi

# 2. Credenciales. Dos formas: una lectura que devuelve un secreto (valores
# de variables, tokens, claves, enlaces de bypass) o una herramienta que crea
# uno. Las escrituras de variables (`create_project_env`, `edit_project_env`)
# NO entran acá: siguen a la regla 4, que es la que sabe si van a Production.
CREDENCIAL=0
if es_lectura_por_prefijo; then
  case "$NOMBRE" in
    *token*|*secret*|*key*|*_env|*_envs|*env_var*|*bypass*|get_access_to_vercel_url) CREDENCIAL=1 ;;
  esac
fi
case "$NOMBRE" in
  create_api_keys|create_sdk_key|create_edge_config_token|exchange_sso_token|*kms*|authenticate|complete_authentication) CREDENCIAL=1 ;;
esac
if [ "$CREDENCIAL" = 1 ]; then
  preguntar "El agente $AGENTE quiere usar \`$NOMBRE\` de Vercel: trae o crea CREDENCIALES (tokens, claves o valores de variables de entorno), que quedan en la transcripción. Aprobá solo si sabés para qué las necesita, y nunca para escribirlas en un archivo del árbol (ADR 0022).
Entrada: $DETALLE"
fi

# 3. Lectura: pasa sin preguntar.
es_lectura_por_prefijo && exit 0
case "$NOMBRE" in
  status|artifact_query|web_fetch_vercel_url|search_vercel_documentation) exit 0 ;;
esac

# 4. Escrituras que tocan el sitio publicado.
PRODUCCION=0
case "$NOMBRE" in
  request_promote|request_rollback|pause_project|unpause_project|assign_alias) PRODUCCION=1 ;;
  *domain*|update_record|*domains_records*|*firewall*|*attack*|*rolling_release*|update_project|update_network) PRODUCCION=1 ;;
esac
printf '%s' "$DETALLE" | grep -qi 'production' && PRODUCCION=1

if [ "$PRODUCCION" = 1 ]; then
  preguntar "⚠️ PRODUCCIÓN ⚠️ — ESCRITURA SOBRE EL SITIO PUBLICADO EN VERCEL.
Agente: $AGENTE
Operación: \`$NOMBRE\`
Entrada: $DETALLE
Afecta lo que ve el público (deploy, dominio, alias, firewall o variables de Production). Recordá que hoy Production, Preview y Development comparten la MISMA base de Neon de producción. Aprobá solo si pediste esta operación exacta (ADR 0010, ADR 0022)."
fi

# 5. Todo lo demás pregunta.
preguntar "El agente $AGENTE quiere usar \`$NOMBRE\` de Vercel, que escribe en la infraestructura real. Por ADR 0010 y ADR 0022 requiere tu confirmación explícita.
Entrada: $DETALLE"
