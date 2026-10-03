#!/bin/bash
# Impide que los subagentes publiquen en el remoto, con una excepción acotada.
#
# Los agentes escriben código y preparan cambios, pero publicar es una decisión
# del usuario. Este hook deniega `git push` (y sus variantes) para CUALQUIER
# subagente, salvo el `delivery-specialist` empujando hacia una rama que no sea
# `main`. Esa excepción sostiene el flujo nuevo: sus commits van a la rama de
# la rebanada y de ahí a un PR contra `development` (ver `limitar-gh.sh`);
# `main` la mergea el usuario a mano, nunca un agente.
#
# Es una lista negra por defecto para todo lo demás, a propósito: antes era una
# lista blanca de tres nombres y cualquier agente nuevo nacía sin el bloqueo.
# Ahora un agente nuevo queda cubierto sin tocar este archivo.
#
# Solo pasa sin restricción la sesión principal (agent_type vacío), que es
# donde está el usuario. El arquitecto **no** está exento: publicar no es una
# acción que se coordine, es la última milla del usuario, igual que en
# limitar-vercel.sh.
#
# El hook se declara en `.claude/settings.json` SIN el campo `if`. Con
# `if: "Bash(git *)"` solo corría cuando el comando empezaba con `git`, y
# `rtk git push` —la forma que el propio `CLAUDE.md` manda usar— no empieza con
# `git`: el hook no corría y el push pasaba. El filtrado por comando lo hace el
# grep de abajo, que sí desenvuelve el prefijo.
#
# Auditoría del 2026-10-01: se cerraron tres huecos que dejaban pasar un push a
# main o forzado — el refspec entre comillas (`'HEAD:main'`), el force por
# `+refspec`, y `git push` sin argumentos cuando la rama actual (o su upstream)
# es main. Ahora también se deniegan `--all` y `--mirror`.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')
DIRECTORIO=$(printf '%s' "$ENTRADA" | jq -r '.cwd // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

denegar() {
  jq -n --arg a "$AGENTE" --arg m "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("El agente \($a) no puede hacer ese push: \($m)")
    }
  }'
  exit 0
}

# Las comillas se sacan antes de clasificar: `git push origin 'HEAD:main'` es
# el mismo push que sin comillas, y con ellas la búsqueda de `main` como token
# no lo veía (auditoría del 2026-10-01).
LIMPIO=$(printf '%s' "$COMANDO" | tr -d "\"'")

# Cada tramo de una línea compuesta se evalúa por separado.
FRAGMENTOS=$(printf '%s' "$LIMPIO" | tr ';|&' '\n')

# `git push`, `git -C ruta push`, `git ... push`.
PATRON_PUSH='(^|[[:space:]])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^[:space:]]+)?)*[[:space:]]+push([[:space:]]|$)'

while IFS= read -r FRAG; do
  printf '%s' "$FRAG" | grep -Eq "$PATRON_PUSH" || continue

  if [ "$AGENTE" != "delivery-specialist" ]; then
    denegar "preparás los cambios y los dejás commiteables; el push lo decide el usuario. Terminá tu turno indicando qué quedó listo para publicar."
  fi

  # El delivery-specialist puede pushear, pero nunca contra main: main la
  # mergea el usuario a mano. Se busca "main" como token completo en cualquier
  # forma de refspec (origin main, HEAD:main, +main, refs/heads/main...).
  if printf '%s' "$FRAG" | grep -Eq '(^|[/:+[:space:]])main([[:space:]]|$)'; then
    denegar "no podés pushear contra main. Empujá la rama de la rebanada y abrí el PR contra development."
  fi

  # Nunca force-push, ni siquiera hacia la rama de la rebanada. Incluye las
  # banderas cortas agrupadas (`-uf`) y el `+` de un refspec (`+rama`,
  # `+HEAD:rama`), que fuerza igual que --force.
  if printf '%s' "$FRAG" | grep -Eq '(^|[[:space:]])(--force([[:space:]]|=|$)|--force-with-lease|--force-if-includes|-[A-Za-z]*f[A-Za-z]*([[:space:]]|$)|\+[^[:space:]])'; then
    denegar "el force-push no está permitido para ningún subagente."
  fi

  # `--all` y `--mirror` empujan todas las ramas, `main` incluida.
  if printf '%s' "$FRAG" | grep -Eq '(^|[[:space:]])(--all|--mirror)([[:space:]]|=|$)'; then
    denegar "--all y --mirror empujan también main. Empujá solo la rama de la rebanada."
  fi

  # Sin refspec explícito, el destino lo decide la configuración: la rama
  # actual y su upstream. Se resuelve en el repositorio real (`-C` si viene,
  # si no el cwd del agente) y se deniega si cualquiera de los dos es main.
  # Con refspec explícito eso no importa: el destino es el que se escribió.
  REPO=$(printf '%s' "$FRAG" | sed -nE 's/.*git([[:space:]]+-[^[:space:]]+([[:space:]]+[^[:space:]]+)?)*[[:space:]]+-C[[:space:]]+([^[:space:]]+).*/\3/p')
  [ -z "$REPO" ] && REPO="$DIRECTORIO"
  [ -z "$REPO" ] && REPO="."

  # Posicionales después de `push`, salteando banderas (y el valor de las que
  # lo llevan separado). Con menos de dos (remoto y refspec), es implícito.
  POSICIONALES=0
  ESPERA_VALOR=0
  DESPUES=$(printf '%s' "$FRAG" | sed -E 's/.*[[:space:]]push([[:space:]]|$)//')
  for TOKEN in $DESPUES; do
    if [ "$ESPERA_VALOR" = 1 ]; then ESPERA_VALOR=0; continue; fi
    case "$TOKEN" in
      -o|--push-option|--repo|--receive-pack|--exec) ESPERA_VALOR=1; continue ;;
      -*) continue ;;
    esac
    POSICIONALES=$((POSICIONALES + 1))
  done

  ACTUAL=$(git -C "$REPO" symbolic-ref --quiet --short HEAD 2>/dev/null)
  if [ "$ACTUAL" = "main" ]; then
    denegar "estás parado en main. Cambiá a la rama de la rebanada antes de pushear."
  fi

  if [ "$POSICIONALES" -lt 2 ]; then
    if [ -z "$ACTUAL" ]; then
      denegar "no se pudo determinar la rama actual (HEAD suelto o repositorio desconocido). Nombrá el destino explícito: git push -u origin <rama-de-la-rebanada>."
    fi
    UPSTREAM=$(git -C "$REPO" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)
    case "$UPSTREAM" in
      */main|main)
        denegar "la rama $ACTUAL sigue a $UPSTREAM, así que un push sin destino puede ir a main. Nombrá el destino explícito: git push -u origin $ACTUAL." ;;
    esac
  fi
done <<FIN
$FRAGMENTOS
FIN

exit 0
