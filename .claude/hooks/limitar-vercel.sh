#!/bin/bash
# Limita lo que los subagentes pueden hacer con `vercel`.
#
# Tercer hook de la misma familia. bloquear-git-push.sh impide publicar
# código; limitar-gh.sh impide publicar contra el repositorio remoto; este
# impide publicar contra la infraestructura. El criterio es el del ADR 0006 y
# el del ticket #7: desplegar no es una acción de agente, y ningún agente
# tiene credenciales de Vercel de escritura.
#
# Existe porque el plugin `vercel@claude-plugins-official` es todo-o-nada: no
# hay forma documentada de habilitar sus agentes (`deployment-expert`,
# `performance-optimizer`, `ai-architect`) sin habilitar también `/deploy`,
# `/bootstrap` y `/env`. Este hook es lo que hace que esa decisión sea barata:
# los agentes asesoran, el usuario ejecuta.
#
# La lista es BLANCA por comando, como en limitar-gh.sh: lo que no está
# explícitamente permitido se deniega, así que un subcomando nuevo de `vercel`
# nace denegado.
#
#   - lectura (ls, inspect, logs, whoami, y los `ls` de cada recurso):
#     permitida para todo subagente;
#   - todo lo demás: denegado.
#
# Dos diferencias deliberadas con limitar-gh.sh:
#
#   1. El subcomando VACÍO se deniega. `vercel` a secas no es ayuda: despliega
#      el directorio actual. Es exactamente lo que este hook existe para
#      impedir, y es el caso que más fácil se escapa.
#   2. El super-architect NO está exento. En limitar-gh.sh lo está porque
#      coordina el repositorio; acá no hay nada que coordinar, porque el
#      despliegue es del usuario. Solo pasa la sesión principal, que es donde
#      está el usuario.
#
# `vercel env pull` queda del lado denegado aunque sea "lectura": materializa
# credenciales de producción en un archivo del disco. Leer qué variables
# existen (`env ls`) no necesita bajar sus valores.
#
# Se desenvuelven los prefijos que no cambian el comando: `rtk` (filtro de
# salida) y los lanzadores `npx`, `bunx`, `pnpm dlx`, `pnpm exec`. Sin eso el
# fragmento no arrancaría con `vercel` y caería en la rama de "envuelto en
# otro comando", que deniega incluso una lectura permitida.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

denegar() {
  jq -n --arg a "$AGENTE" --arg c "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("El agente \($a) no puede correr `\($c)`: escribe en la infraestructura real. Desplegar, promover, revertir y tocar variables de entorno lo hace el usuario (ticket #7 y ADR 0006). Terminá tu turno indicando qué habría que ejecutar y por qué.")
    }
  }'
  exit 0
}

FRAGMENTOS=$(printf '%s' "$COMANDO" | tr ';|&' '\n')

while IFS= read -r FRAG; do
  FRAG=$(printf '%s' "$FRAG" | sed -E 's/^[[:space:]]+//; s/^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*//')
  FRAG=$(printf '%s' "$FRAG" | sed -E 's/^rtk([[:space:]]+proxy)?[[:space:]]+//')
  FRAG=$(printf '%s' "$FRAG" | sed -E 's/^(npx([[:space:]]+-y)?|bunx|pnpm[[:space:]]+(dlx|exec))[[:space:]]+//')

  case "$FRAG" in
    vercel|vercel[[:space:]]*) ;;
    *)
      # Formas de EJECUCIÓN, no la palabra en cualquier lado: si no, un
      # `git commit -m 'apaga el plugin de vercel'` se denegaría. Mismo criterio
      # y mismo patrón que limitar-gh.sh.
      if printf '%s' "$FRAG" | grep -Eq '(\$\(|`|[[:space:]]-c[[:space:]]+.?|xargs[[:space:]]+|eval[[:space:]]+|env[[:space:]]+)[[:space:]"'"'"']*vercel([[:space:]]|$)'; then
        denegar "vercel envuelto en otro comando"
      fi
      continue
      ;;
  esac

  # Saltear flags globales para encontrar el subcomando real.
  # `--scope`, `--token` y `--cwd` se llevan su valor cuando va separado.
  SUB=""
  VERBO=""
  ESPERA_VALOR=0
  TOKENS=$(printf '%s' "$FRAG" | tr -s '[:space:]' '\n' | tail -n +2)
  while IFS= read -r TOKEN; do
    [ -z "$TOKEN" ] && continue
    if [ "$ESPERA_VALOR" = 1 ]; then ESPERA_VALOR=0; continue; fi
    case "$TOKEN" in
      -S|--scope|-t|--token|--cwd|-A|--local-config) ESPERA_VALOR=1; continue ;;
      -*) continue ;;
    esac
    if [ -z "$SUB" ]; then SUB="$TOKEN"; else VERBO="$TOKEN"; break; fi
  done <<< "$TOKENS"

  # Ayuda y versión: no tocan nada.
  case "$SUB" in
    help|--help|-h|--version|-v) continue ;;
  esac

  # Lectura de un recurso puntual.
  case "$SUB $VERBO" in
    "env ls"|"env list") continue ;;
    "project ls"|"project list") continue ;;
    "domains ls"|"domains inspect") continue ;;
    "dns ls"|"certs ls"|"alias ls"|"secrets ls") continue ;;
    "teams ls"|"integration list"|"git ls") continue ;;
  esac

  # Lectura global.
  case "$SUB" in
    ls|list|inspect|logs|whoami) continue ;;
  esac

  # `vercel` a secas despliega. No es ayuda.
  [ -z "$SUB" ] && denegar "vercel (despliega el directorio actual)"

  denegar "vercel $SUB $VERBO"
done <<EOF
$FRAGMENTOS
EOF

exit 0
