# 0025 — Un solo agente ejecuta escrituras en producción: el `infra-specialist`, por cualquier canal

- **Estado:** Aceptado. **Supersede parcialmente** al
  [ADR 0024](0024-agentes-pueden-escribir-en-produccion-con-confirmacion-en-el-momento.md)
  (quién puede ejecutar), al [ADR 0010](0010-agentes-pueden-escribir-en-vercel-con-confirmacion.md)
  (qué agente escribe en Vercel), al [ADR 0021](0021-mcp-de-neon-detras-de-un-hook.md)
  («un agente», sin nombrar cuál) y a los párrafos del
  [ADR 0022](0022-infra-specialist-y-guarda-del-mcp-de-vercel.md) y del
  [ADR 0023](0023-bases-separadas-por-entorno-y-guarda-del-destino.md) que dicen
  que migrar e importar en producción lo ejecuta el usuario. Todo lo demás de
  esos cinco ADR sigue vigente.
- **Fecha:** 2026-10-02
- **Decide:** el `super-architect`, por delegación explícita del usuario
  («decidan entre los agentes»), tras la auditoría de coherencia de 2026-10-01.

## Decisión

**El `infra-specialist` es el único agente que ejecuta una escritura contra
producción**, sea cual sea el canal:

| Canal | Producción (Neon `main`, Vercel Production) | Fuera de producción |
| ----- | ------------------------------------------- | ------------------- |
| MCP de Neon | Solo `infra-specialist`, con confirmación y aviso de PRODUCCIÓN (`limitar-neon.sh`) | Solo `infra-specialist`, con confirmación (ADR 0022) |
| `pnpm db:migrate`, `contenido:importar`, `desplegar:datos` | Solo `infra-specialist`, con el comando completo a la vista y `DB_CONFIRMAR_DESTINO` (ADR 0023) | Cualquier especialista contra el Docker local; contra `preview`, solo `infra-specialist` |
| Comando `vercel` y MCP de Vercel | Solo `infra-specialist` (o `vercel:deployment-expert` convocado por él), con confirmación | Solo `infra-specialist` (o `deployment-expert` convocado por él), con confirmación |
| Cualquier canal | El usuario, siempre, por su cuenta | El usuario, siempre |

La condición del ADR 0024 no cambia: **cada escritura se confirma en el
momento, viendo la acción exacta**, y ningún comando de estos entra a `allow`.

El `database-specialist` escribe y prueba la migración en Docker; si hace
falta ensayarla con datos reales o aplicarla en producción, se la pasa al
`infra-specialist`. **No ejecuta contra producción por ningún canal**, ni por
`Bash` con la URL de producción.

## Contexto

La auditoría de 2026-10-01 encontró la regla de producción escrita de cuatro
maneras incompatibles:

- 0021 (Consecuencias): «un agente puede escribir en producción si el usuario lo
  aprueba», sin nombrar cuál.
- 0022 y 0023: el `infra-specialist` es el único que escribe en Neon, pero
  migrar e importar en producción «lo ejecuta el usuario».
- 0024, sección Decisión: lo pueden ejecutar el `infra-specialist` **y el
  `database-specialist`**; y en su sección Motivo, el `infra-specialist` es «el
  único escritor autorizado por el ADR 0022». El ADR se contradice a sí mismo.
- 0010: cualquier agente escribe en Vercel con confirmación.

Y los archivos que leen los agentes (CLAUDE.md, `infra-specialist.md`,
`backend-specialist.md`, un runbook) siguen con la regla anterior al 0024.

El hook de Neon ya aplica un solo escritor (`limitar-neon.sh` mira quién
llama). Los comandos de `pnpm` y el comando `vercel` no filtran por quién llama:
para ellos la regla es de conducta, sostenida por la confirmación del usuario.

## Problema

Un agente que lee las reglas vigentes no puede saber si le corresponde
ejecutar una migración en producción: según qué archivo abra, la respuesta es
«nunca», «sí, con confirmación» o «solo el usuario». Una regla de seguridad
ambigua es peor que una regla estricta, porque cada agente la resuelve a su
favor.

## Alternativas consideradas

### A. Dos ejecutores: `infra-specialist` y `database-specialist`
Lo que dice la sección Decisión del 0024. Separa la regla por canal: el
`database-specialist` podría correr `db:migrate` por `Bash` pero no escribir por
el MCP, porque el hook se lo deniega.

### B. Un solo ejecutor: el `infra-specialist`
Lo que ya aplica el hook de Neon y lo que el propio `database-specialist.md`
dice («nunca vos, ni por `Bash` con la URL de producción»).

### C. Volver a «lo ejecuta el usuario»
La regla de los ADR 0022 y 0023, que el usuario levantó a propósito con el 0024.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | El que escribió la migración puede aplicarla | Dos puertas a producción; la regla cambia según el canal; el hook de Neon y el de Bash dicen cosas distintas | Bajo |
| **B** | Una sola puerta, fácil de auditar; coincide con el hook de Neon y con el archivo del `database-specialist` | Una migración cruza de un agente a otro antes de llegar a producción | Bajo |
| C | Máxima supervisión | Contradice una decisión explícita del usuario (ADR 0024) | Bajo |

## Decisión elegida

**B**, para todos los canales y los dos proveedores.

## Motivo

- **Ya es lo que hace el sistema.** El hook de Neon solo deja escribir al
  `infra-specialist`, y `database-specialist.md` ya le prohíbe ejecutar contra
  producción. La alternativa A obligaba a cambiar un archivo y a convivir con
  una regla distinta por canal; B solo corrige el texto que se había apartado.
- **Una puerta se audita; dos se olvidan.** El dueño de dónde corre el sistema
  (ADR 0022) es el que sabe contra qué base apunta cada variable. El que diseñó
  la migración sabe lo que hay adentro, y por eso la prueba en Docker y se la
  entrega lista; no necesita además saber a dónde apunta la URL.
- **No le saca nada al usuario.** La confirmación en el momento del ADR 0024
  sigue siendo el control real; esta decisión solo fija quién la pide.
- **Vercel entra en la misma regla** porque el 0010 es anterior a la existencia
  del `infra-specialist`: cuando se escribió no había un dueño de plataforma, y
  hoy lo hay (ADR 0022).

## Consecuencias

**Aceptamos:**
- Aplicar una migración en producción requiere convocar al `infra-specialist`,
  aunque la haya escrito el `database-specialist`.
- Para los comandos de `pnpm` y el comando `vercel`, la regla **no la aplica un
  hook**: la aplica la conducta del agente y la confirmación del usuario, que ve
  el comando y quién lo pide.

**Obtenemos:**
- Una sola regla, escrita en un solo lugar (esta tabla), que los archivos de
  los agentes citan en vez de copiar.
- Coherencia con lo que el hook de Neon ya aplicaba.

**Deuda técnica asumida:**
- **Ningún hook filtra por quién llama** a `pnpm db:migrate`,
  `contenido:importar`, `desplegar:datos` ni al comando `vercel`. Resolverlo
  costaría un clasificador de destino en un hook de `Bash`, que tendría que
  leer las variables de entorno de la línea. **Disparador:** un agente distinto
  del `infra-specialist` propone o ejecuta una escritura de producción por
  alguno de esos canales, aunque el usuario la rechace. Ahí la conducta ya no
  alcanza y el hook se justifica.

**Revisar si:**
- Aparece un pipeline de CI que migre o despliegue sin supervisión: eso es un
  ADR nuevo sobre automatización (mismo disparador que el ADR 0024).
- Aparece una segunda persona operando el proyecto.
