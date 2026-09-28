# 0024 — Agentes pueden escribir en producción, con confirmación del usuario en el momento

- **Estado:** Aceptado. **Supersede parcialmente** al [ADR 0022](0022-infra-specialist-y-guarda-del-mcp-de-vercel.md)
  y al [ADR 0023](0023-bases-separadas-por-entorno-y-guarda-del-destino.md), en un
  solo punto: quién **ejecuta** una escritura contra la base de producción de
  Neon (rama `main`) o contra el sitio publicado de Vercel producción. Todo lo
  demás de esos dos ADR —dueños de plataforma, guarda del MCP de Vercel, guarda
  del destino de `db:migrate`/`contenido:importar`, bases separadas por
  entorno— sigue vigente sin cambios.
- **Fecha:** 2026-09-27
- **Decide:** Luciano Melo Claps

## Decisión

El `infra-specialist` y el `database-specialist` **pueden ejecutar** escrituras
contra producción —incluidos migrar e importar contenido (runbook
`docs/runbooks/desplegar-datos.md`), y las escrituras de Vercel producción ya
cubiertas por el ADR 0010—, siempre bajo una condición que no se relaja:

> **El usuario ve la acción concreta —el comando exacto, la sentencia SQL
> exacta, o la llamada MCP exacta con sus parámetros— y la autoriza en ese
> momento, para esa ejecución puntual.** No es un permiso general ni una
> autorización de una vez para "escribir en producción": es una confirmación
> por cada escritura.

Lo que el ADR 0022 y el ADR 0023 decían —"esto lo ejecuta el usuario"— queda
reemplazado por "esto lo puede ejecutar un agente, con el usuario confirmando
en el momento la acción exacta". El mecanismo de esa confirmación es el que ya
existe: el hook de `PreToolUse` que responde `ask` (`.claude/hooks/limitar-neon.sh`
para el MCP de Neon, `.claude/hooks/limitar-vercel-mcp.sh` para el MCP de
Vercel, `.claude/hooks/limitar-vercel.sh` para el comando `vercel`) o, para los
comandos de `pnpm` que no pasan por ningún hook (`db:migrate`,
`contenido:importar`, `desplegar:datos`), el diálogo de permisos estándar de
Claude Code sobre `Bash`, que muestra el comando completo antes de correrlo.
**Ningún comando de estos entra a una lista de `allow`** en
`.claude/settings.json`: eso convertiría la confirmación puntual en un permiso
general, que es exactamente lo que el usuario no pidió.

## Contexto

El ADR 0022 fijó al `infra-specialist` como único escritor de Neon y
responsable de Vercel, pero dejó una excepción explícita: "Migrar e importar en
producción lo sigue ejecutando el usuario (#121, #124)". El ADR 0023, al
diseñar la guarda del destino de `db:migrate` y `contenido:importar`, repitió
esa misma frontera, y el runbook `docs/runbooks/desplegar-datos.md` la
convirtió en instrucción operativa: *"Esto lo ejecuta el usuario contra
producción. Ningún agente corre estos comandos contra la base de `main`"*.

Esa frontera nunca estuvo sostenida por un hook: `db:migrate`,
`contenido:importar` y `desplegar:datos` son scripts de `pnpm` que corren por
`Bash`, y ninguno de los tres hooks de la familia (`bloquear-git-push.sh`,
`limitar-gh.sh`, `limitar-vercel.sh`) los mira — el primero es git, el segundo
es `gh`, el tercero solo intercepta el comando `vercel`. La frontera era
puramente de conducta: el runbook y los ADR le decían al agente que no lo
hiciera, y ningún mecanismo del repositorio se lo hubiera impedido si el agente
lo hubiera intentado igual.

El usuario decidió ahora, explícitamente, levantar esa frontera de conducta: los
agentes de plataforma (`infra-specialist`, `database-specialist` dentro de su
área) pueden ejecutar escrituras de producción, con la condición de que cada
una se le muestre y la autorice en el momento — no una vez para siempre.

Al revisar el estado del árbol para este ADR se encontró un cambio ya hecho y
sin commitear en `.claude/settings.json`: se había agregado
`"Bash(pnpm desplegar:datos:*)"` a la lista `allow`. Eso es lo opuesto a la
condición que puso el usuario: una entrada en `allow` hace que Claude Code deje
de preguntar, así que la próxima vez que cualquier agente corra
`pnpm desplegar:datos` —contra la base que sea, con las variables de entorno
que tenga el proceso en ese momento— se ejecutaría **sin que nadie lo vea ni lo
apruebe**. Este ADR revierte esa entrada como parte de la misma decisión: la
manera correcta de autorizar esto no es una entrada en `allow`, es dejar que el
diálogo de permisos pregunte, cada vez, con el comando a la vista.

## Problema

Dos cosas concretas:

1. El ADR 0022 y el ADR 0023 dejaban una frontera —"esto lo ejecuta el
   usuario"— que el usuario ahora quiere levantar, sin que quede un ADR
   contradictorio en el árbol.
2. Levantarla sin cuidado abre la puerta a que una escritura de producción
   ocurra sin que el usuario la vea antes de que pase. Hace falta que la
   decisión deje explícita la condición bajo la que se levanta, no solo el
   hecho de que se levanta.

## Alternativas consideradas

### A. No tocar nada, dejar la frontera como está
El usuario pidió explícitamente lo contrario; no resuelve el problema real
(migrar e importar en producción sigue siendo un paso manual que alguien tiene
que acordarse de correr).

### B. Permiso general: los agentes pueden escribir en producción, sin más
Es lo que el `allow` ya agregado hacía en los hechos. Contradice la condición
que el propio usuario puso al pedirlo ("me tiene que decir qué van a hacer los
agentes, yo lo autorizo").

### C. Permiso condicionado a confirmación explícita por cada acción concreta
Usa el mecanismo que ya existe (hooks en `ask` para Neon y Vercel; diálogo
estándar de `Bash` para los comandos de `pnpm`) en vez de construir uno nuevo.

## Trade-offs

| Alternativa | A favor | En contra |
| ----------- | ------- | --------- |
| A | Cero cambios | No es lo que pidió el usuario |
| B | Cero fricción | Nadie ve la escritura antes de que ocurra; revierte de hecho el motivo del ADR 0023 (guarda del destino) sin decirlo |
| **C** | El usuario ve el comando o la sentencia exacta antes de aprobar, cada vez; no requiere hooks nuevos | La ejecución es más lenta que un permiso general; depende de que nadie agregue el comando a `allow` más adelante "para no tener que confirmar" |

## Decisión elegida

**C.**

## Motivo

C es la única alternativa que cumple la condición tal como la puso el usuario:
autorización explícita, viendo la acción concreta, en cada escritura — no una
vez. Los hooks de Neon (`limitar-neon.sh`) y del MCP de Vercel
(`limitar-vercel-mcp.sh`) ya responden `ask` con un aviso de PRODUCCIÓN cuando
el `infra-specialist` —el único escritor autorizado por el ADR 0022— pide una
escritura sobre la rama protegida o el entorno de producción; **no hace falta
tocarles el criterio**, porque ya hacen exactamente lo que esta decisión pide.
Igual con `limitar-vercel.sh` sobre el comando `vercel`: cualquier escritura,
la ejecute quien la ejecute, ya pasa por confirmación (ADR 0010). Lo único que
faltaba resolver era la frontera puramente textual del runbook y del ADR 0022 y
0023 sobre `db:migrate`/`contenido:importar`/`desplegar:datos`, que este ADR
levanta explícitamente, y la entrada en `allow` que —de haber quedado— hubiera
anulado en la práctica la condición que el usuario acaba de pedir.

No se construye un hook nuevo para los comandos de `pnpm`. El diálogo de
permisos estándar de Claude Code sobre `Bash` ya muestra el comando completo
—incluidas las variables de entorno en la línea, que es donde vive el destino,
según la guarda del ADR 0023— y pide aprobación cuando el comando no está en
`allow`. Agregar un hook dedicado sería introducir una capa nueva para replicar
un mecanismo que ya existe y ya cumple la condición, con la única disciplina de
**no** meter esos comandos en `allow`.

## Consecuencias

**Aceptamos:**
- Migrar e importar en producción deja de ser exclusivamente manual: un agente
  puede correr el comando, pero cada corrida sigue pasando por la aprobación
  del usuario, que ve el comando exacto (incluida la variable
  `DB_CONFIRMAR_DESTINO`, que sigue exigiendo escribir el host a mano —ADR
  0023— y ahora también queda a la vista de quien aprueba el comando del
  agente).
- El "clasificador de modo automático" de Claude Code es una capa del harness,
  ajena a este repositorio: puede seguir denegando una acción aunque este ADR
  la autorice, y este ADR no tiene forma de resolver eso. (Ver nota fuera del
  ADR, en la respuesta al usuario.)
- Se revierte la entrada `"Bash(pnpm desplegar:datos:*)"` que ya estaba en
  `.claude/settings.json` sin commitear, porque contradice la condición de
  confirmación puntual que motiva este ADR.

**Obtenemos:**
- Los agentes de plataforma pueden ejecutar el runbook de datos y las
  escrituras de Vercel producción sin que el usuario tenga que estar frente al
  teclado ejecutando el comando él mismo, pero sigue viendo y aprobando cada
  uno antes de que corra.
- Ningún hook ni configuración nuevos: se usa el mecanismo de confirmación que
  el ADR 0010, el ADR 0021 y el ADR 0022 ya construyeron para este propósito
  exacto.

**Deuda técnica asumida:**
- La condición de "confirmación en el momento" para los comandos de `pnpm`
  depende de que nadie agregue esos comandos a `allow` en el futuro "para
  ahorrar el paso". No hay un mecanismo del repositorio que lo impida más allá
  de esta nota. **Disparador para reconsiderar:** si aparece una necesidad real
  de correr `desplegar:datos` sin supervisión (por ejemplo, un pipeline de CI),
  eso es un ADR nuevo y explícito sobre automatización, no una entrada
  silenciosa en `allow`.

**Revisar si:**
- El usuario decide que quiere volver a ejecutarlo siempre él mismo: se
  redacta un ADR que supersede a este.
- Aparece una segunda persona operando el proyecto: la confirmación puntual de
  un solo usuario deja de alcanzar y hace falta repensar el mecanismo (mismo
  disparador que el ADR 0023 dejó anotado para el host de producción).
