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

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

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

# `git push`, `git -C ruta push`, `git ... push`, en cualquier parte de una
# línea compuesta con && o ;
if printf '%s' "$COMANDO" | grep -Eq '(^|[;&|]|[[:space:]])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^[:space:]]+)?)*[[:space:]]+push([[:space:]]|$)'; then

  if [ "$AGENTE" != "delivery-specialist" ]; then
    denegar "preparás los cambios y los dejás commiteables; el push lo decide el usuario. Terminá tu turno indicando qué quedó listo para publicar."
  fi

  # El delivery-specialist puede pushear, pero nunca contra main: main la
  # mergea el usuario a mano. Se busca "main" como token completo en cualquier
  # forma de refspec (origin main, HEAD:main, rama:main, -u origin main...).
  if printf '%s' "$COMANDO" | grep -Eq '(^|[/:[:space:]])main([[:space:]]|$)'; then
    denegar "no podés pushear contra main. Empujá la rama de la rebanada y abrí el PR contra development."
  fi

  # Nunca force-push, ni siquiera hacia la rama de la rebanada.
  if printf '%s' "$COMANDO" | grep -Eq '(^|[[:space:]])(--force([[:space:]]|=|$)|--force-with-lease|-f)([[:space:]]|$)'; then
    denegar "el force-push no está permitido para ningún subagente."
  fi

  exit 0
fi

exit 0
