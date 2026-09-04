#!/bin/bash
# Limita lo que los subagentes pueden hacer con `gh`.
#
# Complementa a bloquear-git-push.sh. Aquel impide publicar código; este
# impide publicar cualquier otra cosa contra el repositorio remoto. Un issue
# es tan "hacia afuera" como un push, con una diferencia que justifica el
# trato distinto: un issue es barato y reversible.
#
# Al revés que el hook de push, acá la lista es BLANCA por comando: lo que no
# está explícitamente permitido, se deniega. Un subcomando nuevo de `gh` nace
# denegado en lugar de nacer permitido, que es lo correcto para algo que toca
# el remoto.
#
#   - lectura (view, list, status, diff, search, `gh api` sin escritura):
#     permitida para todos;
#   - escritura de issues (create, edit, comment, close, reopen): SOLO para
#     delivery-specialist, que es el dueño del tracker;
#   - todo lo demás (pr, repo, release, workflow, secret, label create,
#     `gh api` con método de escritura): denegado para todo subagente.
#
# Un `gh` envuelto en otro comando (`bash -c`, `eval`, `$(...)`, `xargs`) se
# deniega sin analizar: la lista blanca solo sabe leer fragmentos que empiezan
# con `gh`, y lo que no puede leer no lo puede autorizar.
#
# Sin restricción: la sesión principal (agent_type vacío), que es donde está
# el usuario, y el arquitecto, que coordina el repositorio.
#
# `rtk` (github.com/rtk-ai/rtk) antepone su nombre a comandos para filtrar su
# salida y ahorrar tokens (`rtk gh pr view 123`). Sin desenvolverlo acá, el
# fragmento ya no arranca con `gh` y cae en la rama de "gh envuelto en otro
# comando", que deniega incluso una lectura permitida. Se lo saca antes de
# clasificar el fragmento, no después: es el mismo comando de siempre con un
# prefijo de filtrado, no un envoltorio real.

ENTRADA=$(cat)

AGENTE=$(printf '%s' "$ENTRADA" | jq -r '.agent_type // .agent // empty')
COMANDO=$(printf '%s' "$ENTRADA" | jq -r '.tool_input.command // empty')

case "$AGENTE" in
  ""|super-architect) exit 0 ;;
esac

denegar() {
  jq -n --arg a "$AGENTE" --arg c "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("El agente \($a) no puede correr `\($c)`: escribe en el repositorio remoto. Los issues los publica delivery-specialist, y solo con el corte aprobado; el resto (pr, repo, release, etiquetas, workflows) lo decide el usuario. Terminá tu turno indicando qué hay que publicar y quién debería hacerlo.")
    }
  }'
  exit 0
}

# Cada subcomando de una línea compuesta se evalúa por separado. Partir por
# ; | & convierte `a && b` en dos fragmentos; los que no empiezan con `gh`
# se ignoran.
FRAGMENTOS=$(printf '%s' "$COMANDO" | tr ';|&' '\n')

while IFS= read -r FRAG; do
  # Sacar espacios y asignaciones de entorno al principio (FOO=bar gh ...).
  FRAG=$(printf '%s' "$FRAG" | sed -E 's/^[[:space:]]+//; s/^([A-Za-z_][A-Za-z0-9_]*=[^[:space:]]*[[:space:]]+)*//')
  FRAG=$(printf '%s' "$FRAG" | sed -E 's/^rtk([[:space:]]+proxy)?[[:space:]]+//')

  case "$FRAG" in
    gh|gh[[:space:]]*) ;;
    *)
      # Un `gh` que no arranca el fragmento puede estar envuelto en otro
      # comando: `bash -c 'gh ...'`, `echo $(gh ...)`, `xargs gh ...`. La lista
      # blanca no puede analizar lo que no ve, así que se deniega sin analizar.
      #
      # Se buscan formas de EJECUCIÓN, no la palabra en cualquier lado. Antes
      # esto era un `grep` por `gh` suelto, y denegaba
      # `git commit -m 'arregla el hook gh'`: prosa, no un comando. El falso
      # positivo estaba tapado porque el hook se filtraba con `if` en el
      # settings y nunca corría sobre `git`; al pasar a correr siempre —para que
      # `rtk gh ...` y `gh` a secas no se escapen— quedó a la vista.
      #
      # Un `gh` dentro del texto entrecomillado de OTRO fragmento que sí empieza
      # con `gh` no llega hasta acá, y está bien: ese `gh` es texto.
      if printf '%s' "$FRAG" | grep -Eq '(\$\(|`|[[:space:]]-c[[:space:]]+.?|xargs[[:space:]]+|eval[[:space:]]+|env[[:space:]]+)[[:space:]"'"'"']*gh([[:space:]]|$)'; then
        denegar "gh envuelto en otro comando"
      fi
      continue
      ;;
  esac

  # El subcomando no siempre es la segunda palabra: `gh --repo a/b issue create`
  # llevaría a leer `--repo` como subcomando y a denegar algo legítimo. Se
  # saltean los flags globales, y `-R`/`--repo` se lleva además su valor cuando
  # va separado.
  SUB=""
  VERBO=""
  ESPERA_VALOR=0
  TOKENS=$(printf '%s' "$FRAG" | tr -s '[:space:]' '\n' | tail -n +2)
  while IFS= read -r TOKEN; do
    [ -z "$TOKEN" ] && continue
    if [ "$ESPERA_VALOR" = 1 ]; then ESPERA_VALOR=0; continue; fi
    case "$TOKEN" in
      -R|--repo) ESPERA_VALOR=1; continue ;;
      -*) continue ;;
    esac
    if [ -z "$SUB" ]; then SUB="$TOKEN"; else VERBO="$TOKEN"; break; fi
  done <<< "$TOKENS"

  # `gh api` es lectura mientras no lleve método ni campos de escritura.
  if [ "$SUB" = "api" ]; then
    # `-X POST` y `-XPOST` son la misma cosa: la forma pegada es idiomática y
    # antes se escapaba porque se exigía un espacio o un `=` después del flag.
    if printf '%s' "$FRAG" | grep -Eq '(^|[[:space:]])(-X[[:space:]]*[A-Za-z]|(--method|-f|-F|--field|--raw-field|--input)([[:space:]]|=))'; then
      denegar "gh api (escritura)"
    fi
    continue
  fi

  # Lectura y ayuda: permitidas para cualquier subagente.
  case "$SUB $VERBO" in
    "issue view"|"issue list"|"issue status") continue ;;
    "pr view"|"pr list"|"pr diff"|"pr checks"|"pr status") continue ;;
    "repo view"|"label list"|"release view"|"release list") continue ;;
    "run view"|"run list"|"workflow view"|"workflow list") continue ;;
    "auth status"|"status ") continue ;;
  esac
  case "$SUB" in
    search|help|--help|--version|-h|"") continue ;;
  esac

  # Escritura de issues: solo el dueño del tracker.
  if [ "$AGENTE" = "delivery-specialist" ]; then
    case "$SUB $VERBO" in
      "issue create"|"issue edit"|"issue comment"|"issue close"|"issue reopen") continue ;;
    esac
  fi

  denegar "gh $SUB $VERBO"
done <<EOF
$FRAGMENTOS
EOF

exit 0
