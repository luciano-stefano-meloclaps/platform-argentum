#!/bin/bash
# Limita lo que los subagentes pueden hacer con `vercel`.
#
# Tercer hook de la misma familia. bloquear-git-push.sh impide publicar
# código; limitar-gh.sh impide publicar contra el repositorio remoto; este
# media lo que se publica contra la infraestructura. El criterio es el del
# ADR 0010, que supersede en este punto al ADR 0006 y al ticket #7: un agente
# **puede** escribir contra Vercel, pero nunca en silencio — cada escritura
# pasa por una confirmación explícita del usuario antes de ejecutarse.
#
# Existe porque el plugin `vercel@claude-plugins-official` es todo-o-nada: no
# hay forma documentada de habilitar sus agentes (`deployment-expert`,
# `performance-optimizer`, `ai-architect`) sin habilitar también `/deploy`,
# `/bootstrap` y `/env`. Este hook es lo que hace que esa decisión sea barata:
# los agentes proponen y ejecutan, pero el usuario ve el comando exacto y lo
# aprueba o lo rechaza en el momento.
#
# La lista es BLANCA por comando, como en limitar-gh.sh: lo que no está
# explícitamente permitido como lectura pasa a preguntar, así que un
# subcomando nuevo de `vercel` nace preguntando, nunca ejecutando directo.
#
#   - lectura (ls, inspect, logs, whoami, y los `ls` de cada recurso):
#     permitida para todo subagente, sin preguntar;
#   - todo lo demás (incluida `env pull`, ADR 0010): pide confirmación al
#     usuario antes de ejecutarse.
#
# Dos diferencias deliberadas con limitar-gh.sh:
#
#   1. El subcomando VACÍO pide confirmación. `vercel` a secas no es ayuda:
#      despliega el directorio actual. Es exactamente el caso que más fácil se
#      escapa, así que nunca se ejecuta sin que el usuario vea que eso es lo
#      que va a pasar.
#   2. El super-architect NO está exento. En limitar-gh.sh lo está porque
#      coordina el repositorio; acá no hay nada que coordinar, porque
#      desplegar sigue siendo una decisión del usuario, solo que ahora puede
#      delegar la ejecución con su aprobación explícita. Solo pasa la sesión
#      principal, que es donde está el usuario y donde no hace falta
#      preguntarle a través de un hook.
#
# `vercel env pull` ya no tiene un trato especial (ADR 0010, alternativa D):
# antes se denegaba siempre porque materializa credenciales de producción en
# disco; ahora pasa por la misma confirmación que cualquier otra escritura, sin
# la excepción que hubiera exigido recordarla aparte.
#
# Se desenvuelven los prefijos que no cambian el comando: `rtk` (filtro de
# salida) y los lanzadores `npx`, `bunx`, `pnpm dlx`, `pnpm exec`. Sin eso el
# fragmento no arrancaría con `vercel` y caería en la rama de "envuelto en
# otro comando", que también pide confirmación aunque fuera una lectura
# permitida.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

preguntar() {
  jq -n --arg a "$AGENTE" --arg c "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: ("El agente \($a) quiere correr `\($c)`: escribe en la infraestructura real (deploy, variables de entorno, promoción, rollback). Por ADR 0010, esto requiere tu confirmación explícita antes de ejecutarse.")
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
        preguntar "vercel envuelto en otro comando"
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
  [ -z "$SUB" ] && preguntar "vercel (despliega el directorio actual)"

  preguntar "vercel $SUB $VERBO"
done <<EOF
$FRAGMENTOS
EOF

exit 0
