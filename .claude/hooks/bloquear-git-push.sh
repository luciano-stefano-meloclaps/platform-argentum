#!/bin/bash
# Impide que los subagentes publiquen en el remoto.
#
# Los agentes escriben código y preparan cambios, pero publicar es una decisión
# del usuario. Este hook deniega `git push` (y sus variantes) para CUALQUIER
# subagente.
#
# Es una lista negra por defecto, a propósito: antes era una lista blanca de
# tres nombres y cualquier agente nuevo nacía sin el bloqueo. Ahora un agente
# nuevo queda cubierto sin tocar este archivo.
#
# Solo pasa la sesión principal (agent_type vacío), que es donde está el
# usuario. El arquitecto **no** está exento, y antes lo estaba: publicar no es
# una acción que se coordine, es la última milla del usuario, igual que en
# limitar-vercel.sh. Con la excepción puesta, `CLAUDE.md` decía las dos cosas a
# la vez —"bloqueado para todos" en un lado y "solo pasan la sesión principal y
# el arquitecto" en el otro—; sacarla es lo que hace verdadera la primera.
#
# El hook se declara en `.claude/settings.json` SIN el campo `if`. Con
# `if: "Bash(git *)"` solo corría cuando el comando empezaba con `git`, y
# `rtk git push` —la forma que el propio `CLAUDE.md` manda usar— no empieza con
# `git`: el hook no corría y el push pasaba. El filtrado por comando lo hace el
# grep de abajo, que sí desenvuelve el prefijo.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

# Solo la sesión principal, donde está el usuario.
[ -z "$AGENTE" ] && exit 0

# `git push`, `git -C ruta push`, `git ... push`, en cualquier parte de una
# línea compuesta con && o ;
if printf '%s' "$COMANDO" | grep -Eq '(^|[;&|]|[[:space:]])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^[:space:]]+)?)*[[:space:]]+push([[:space:]]|$)'; then
  jq -n --arg a "$AGENTE" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("El agente \($a) no puede publicar en el remoto. Preparás los cambios y los dejás commiteables; el push lo decide el usuario. Terminá tu turno indicando qué quedó listo para publicar.")
    }
  }'
  exit 0
fi

exit 0
