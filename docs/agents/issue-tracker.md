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
| Sesión principal | Todo, sin restricción: es donde está el usuario |
| `delivery-specialist` | Leer, `issue create/edit/comment/close/reopen`, `pr create`/`pr merge` contra `development` y `pr create --base main --head development` (con verificación del usuario en cada paso, ver `.claude/agents/delivery-specialist.md`). `pr merge` de un PR contra `main`, nunca |
| `delivery-specialist`, sobre el tablero | `project item-add` e `item-edit`: cargar y mover tarjetas entre columnas. Nada de crear, editar, ligar ni borrar el proyecto o sus campos |
| Cualquier otro subagente, **el arquitecto incluido** | Solo lectura (`issue view`, `issue list`, `pr view`…) |

Denegado para **todo** subagente: `gh repo`, `gh release`, `gh label create`,
`gh api` con método de escritura, y `gh` envuelto en otro comando. Para el
`delivery-specialist`, `gh pr create` sin `--base development` explícito
también se deniega —el default de `gh` es `main`—, y `--base main` se admite
solo con `--head development`. `git push` está bloqueado
aparte, para todos salvo el `delivery-specialist` empujando una rama que no sea
`main`.

Si algo hay que publicar y no te toca, terminá el turno diciendo qué hay que
publicar y quién debería hacerlo.

## Título: la misma convención que un commit

El título de un issue se escribe con **los mismos tipos que un commit**,
definidos en la skill `convenciones-git`:

```
tipo(alcance): mensaje breve
```

`feat` · `fix` · `refactor` · `style` · `docs` · `chore` · `test` · `ci` ·
`build` · `perf` · `revert`. Todo en minúscula, sin corchetes, mensaje muy
breve, sin punto final. El alcance es opcional: se omite si el ticket no cae
en un área puntual.

El motivo es que el ticket y el commit que lo cierra describen **el mismo
trabajo**, así que declarar el tipo en los dos lugares —y que coincida— hace
visible de un vistazo cuando no coinciden, que es exactamente el caso que hay que
mirar.

No se agrega un segundo prefijo. Que un ticket sea un **cimiento** y no una
**rebanada** se dice en el cuerpo, no en el título.

## Convenciones

- **Crear**: `gh issue create --title "..." --body "..."`. Para cuerpos de varias
  líneas, heredoc.
- **Leer**: `gh issue view <n> --comments`
- **Listar**: `gh issue list --state open --json number,title,body,comments`
- **Comentar**: `gh issue comment <n> --body "..."`
- **Cerrar**: `gh issue close <n> --comment "..."`

## Etiquetas

La lista vigente es la del repositorio: **`gh label list`**. Este documento no
la copia, porque se desactualiza. Verificala antes de usar `--label`: con una
etiqueta inexistente, `gh issue create` **falla**, y crear etiquetas está
denegado para los subagentes (lo bloquea el hook). Si hace falta una etiqueta
nueva, pedila: la crea la sesión principal o el usuario.

**Esquema vigente (2026-10-03).** Todo ticket nuevo lleva, como mínimo:

- una `tipo: <tipo>` que coincide con el tipo del título,
- una `area: <área>` (`backend`, `frontend`, `db`, `infra`, `contenido`,
  `marca`, `arquitectura`, `a11y`; puede haber dos),
- una `prioridad: <critica|alta|media|baja>`.

Y, cuando corresponde: `tamano: s|m|l`, `espera: usuario|arquitecto`
(el ticket espera una decisión humana, no código) y `bloqueada` (mientras algún bloqueante de "Bloqueada por:" siga abierto; se
quita al cerrarse). Las etiquetas viejas `bug`, `enhancement`, `documentation`,
`accessibility` y `urgente` ya no se usan.

La skill `triage` **no está instalada**, así que no apliques `ready-for-agent`
ni ninguna del vocabulario canónico de triage: acá no existen y nadie las
consumiría.

## Tablero

Proyecto de GitHub, privado, ligado al repo:
`https://github.com/users/luciano-stefano-meloclaps/projects/2`. Columnas:
`Backlog`, `Listo`, `En curso`, `En revisión`, `Hecho`.

Los PR llevan `Ticket: #n` y no `Closes`, así que GitHub no los vincula al
issue y los workflows de PR del tablero no se disparan. Por eso el
`delivery-specialist` mueve las tarjetas: `Listo` cuando no quedan
bloqueantes abiertos, `En curso` al abrir la rama, `En revisión` al abrir el PR.
`Hecho` lo pone el workflow `Item closed` al cerrar el issue.

Cada ticket pertenece a un **hito** (milestone): «Catálogo curado (#30)»,
«Identidad en producción» u «Orden de la casa». El hito da la barra de progreso.
En el tablero, `Prioridad`, `Tipo`, `Área`, `Tamaño` y `Espera` son campos con
su desplegable y se ven en la tarjeta de la vista **Kanban**; el delivery los
carga además de las etiquetas.

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

Hoy no hay contribuciones externas. Esto es sobre PR *externos* como fuente de
pedidos, no sobre el PR interno que el `delivery-specialist` abre contra
`development` para publicar una rebanada — ese es otro mecanismo, ver
"Quién puede escribir acá" arriba.

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
