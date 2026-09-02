# Tracker de issues: GitHub

Los tickets de este repositorio viven como **issues de GitHub**, en
`luciano-stefano-meloclaps/platform-argentum`. Todas las operaciones se hacen con
la CLI `gh`, que infiere el repositorio sola cuando corre dentro del clon.

Este archivo lo leen las skills de ingeniería (`to-tickets` y las que vengan
después). **Está adaptado a este repositorio**: no es la plantilla genérica.

## Quién puede escribir acá

Lo impone el hook `.claude/hooks/limitar-gh.sh`, no la buena voluntad:

| Quién | Puede |
| ----- | ----- |
| Sesión principal y `super-architect` | Todo, sin restricción |
| `delivery-specialist` | Leer, y `issue create/edit/comment/close/reopen` |
| Cualquier otro subagente | Solo lectura (`issue view`, `issue list`, `pr view`…) |

Denegado para **todo** subagente: `gh pr`, `gh repo`, `gh release`,
`gh label create`, `gh api` con método de escritura, y `gh` envuelto en otro
comando. `git push` está bloqueado aparte, para todos.

Si algo hay que publicar y no te toca, terminá el turno diciendo qué hay que
publicar y quién debería hacerlo.

## Convenciones

- **Crear**: `gh issue create --title "..." --body "..."`. Para cuerpos de varias
  líneas, heredoc.
- **Leer**: `gh issue view <n> --comments`
- **Listar**: `gh issue list --state open --json number,title,body,comments`
- **Comentar**: `gh issue comment <n> --body "..."`
- **Cerrar**: `gh issue close <n> --comment "..."`

## Sin etiquetas, por ahora

El repositorio tiene **solo las diez etiquetas que GitHub crea por defecto**:
`bug`, `documentation`, `duplicate`, `enhancement`, `good first issue`,
`help wanted`, `invalid`, `question`, `wontfix` y `accessibility`.

**Verificá con `gh label list` antes de usar `--label`**: con una etiqueta
inexistente, `gh issue create` **falla**, y crear etiquetas está denegado para
los subagentes —`gh label create` lo bloquea el hook—. Si hace falta una
etiqueta nueva, pedila: la crea la sesión principal o el usuario.

La skill `triage` **no está instalada**, así que no apliques `ready-for-agent`
ni ninguna del vocabulario canónico de triage: acá no existen y nadie las
consumiría.

## Dependencias entre tickets: como texto

Las dependencias nativas de GitHub necesitan `gh api --method POST` y los ids
internos de cada issue, y eso está denegado para los subagentes a propósito.

Las dependencias van como **texto, arriba del cuerpo**:

```
Bloqueada por: #12, #13
```

Un ticket está desbloqueado cuando todos sus bloqueantes están cerrados. Con la
cantidad de tickets que maneja este proyecto, eso se lee de un vistazo.

## Los PR no son una superficie de pedidos

**PRs as a request surface: no.** _(Ponelo en `yes` solo si este repositorio
empieza a tratar los PR externos como pedidos de funcionalidad.)_

Hoy no hay contribuciones externas y `gh pr` está denegado para los subagentes.

## Idioma y vocabulario

Los tickets se escriben **en español**, con los términos exactos de
[`CONTEXT.md`](../../CONTEXT.md). Donde la skill dice *slice*, acá se dice
**rebanada**; donde dice *ticket*, se dice **ticket**, que también está en el
glosario.

Y ojo con la distinción que define el corte del trabajo inicial: una **rebanada**
atraviesa todas las capas y queda usable; un **cimiento** no, porque todavía no
hay capas. El arranque del proyecto son cimientos, no rebanadas.

## Cuando una skill dice…

- **"publicá en el tracker"** → creá un issue de GitHub.
- **"traé el ticket"** → `gh issue view <n> --comments`.
