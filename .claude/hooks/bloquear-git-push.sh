#!/bin/bash
# Impide que los agentes especialistas publiquen en el remoto.
#
# Los especialistas escriben código y preparan cambios, pero publicar es una
# decisión del usuario. Este hook deniega `git push` (y sus variantes) cuando
# quien lo ejecuta es uno de los agentes especialistas.
#
# La sesión principal y el arquitecto NO quedan bloqueados.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

case "$AGENTE" in
  backend-specialist|frontend-specialist|database-specialist) ;;
  *) exit 0 ;;   # cualquier otro contexto pasa sin restricción
esac

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
