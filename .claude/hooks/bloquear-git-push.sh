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
# Solo pasan:
#   - la sesión principal (agent_type vacío), que es donde está el usuario;
#   - el arquitecto, que coordina el repositorio.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

case "$AGENTE" in
  ""|super-architect) exit 0 ;;   # sesión principal y arquitecto: sin restricción
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
