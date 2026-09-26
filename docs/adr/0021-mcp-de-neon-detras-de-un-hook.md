# 0021 — El MCP de Neon, detrás de un hook

- **Estado:** Aceptado
- **Fecha:** 2026-09-25
- **Decide:** Luciano Melo Claps

## Decisión

Lo que el servidor MCP del plugin `neon-postgres@neon` puede hacer queda
mediado por un hook versionado, `.claude/hooks/limitar-neon.sh`: **lectura
libre**; **toda escritura con confirmación del usuario**, y la de producción con
un aviso de PRODUCCIÓN imposible de pasar por alto; y **denegado** lo que
ninguna aprobación en el momento puede reemplazar: los productos de Neon que el
proyecto no eligió, crear o borrar proyectos, restaurar snapshots y las
herramientas de migración del MCP.

**Quién lo usa lo fija el ADR 0022**, escrito el mismo día y antes de aceptar
este: escribe solo el `infra-specialist`; el `database-specialist` lo conserva
para leer y diagnosticar; a cualquier otro subagente el hook le deniega todo lo
que no sea lectura. La primera versión de este ADR, nunca aceptada, le daba el
MCP entero al `database-specialist`; se reescribió en lugar de supersederse
porque no había llegado a regir.

## Contexto

El usuario instaló el plugin oficial de Neon (v2.0.1): un servidor MCP remoto
(`https://mcp.neon.tech/mcp`, OAuth con su cuenta) que lee **y escribe** —SQL
arbitrario, ramas, proyectos, migraciones, snapshots, Neon Auth, Functions,
Object Storage, AI Gateway—, y ocho skills. Lo habilitó **solo para él y solo en
este repositorio**, en `.claude/settings.local.json`: no es para el equipo. Pidió
que el `database-specialist` trabaje con eso, y que el arquitecto decida si hace
falta una skill o un subagente.

Dos reglas vigentes chocan con un agente que puede escribir en Neon:

- las escrituras en la base de producción —migrar, importar, SQL que
  modifique— las ejecuta el usuario, nunca un agente (tickets #121 y #124);
- las migraciones van por drizzle-kit (ADR 0005), y la autenticación es Better
  Auth propio (ADR 0019).

Los tres hooks del proyecto (`bloquear-git-push.sh`, `limitar-gh.sh`,
`limitar-vercel.sh`) miran `Bash`. **Una herramienta MCP no pasa por `Bash`**,
así que ninguno la ve.

## Problema

Sin una guarda aplicada, la regla de #121 y #124 sería un párrafo en el archivo
de un agente, y bastaría una llamada a `run_sql` sin `branchId` —que el servidor
resuelve contra la rama por defecto, producción— para romperla. A eso se suma que
cinco de las ocho skills empujan productos que el proyecto no eligió, y que todas
tratan al agente como operador del proyecto de Neon.

## Alternativas consideradas

### A. Un hook `PreToolUse` sobre `mcp__…neon__.*`
Con tres salidas: `allow`, `ask`, `deny`. Las variantes de abajo discuten qué va
en cada una.

(Las alternativas B y C de la versión anterior —un agente propio para Neon, una
skill propia— son de quién usa el MCP, no de cómo se guarda: pasaron al ADR
0022.)

### D. Todo `ask`, sin `deny`
El criterio del ADR 0010 para Vercel, aplicado tal cual.

### D'. Producción en `ask`, con un aviso destacado; el resto de los `deny`, igual
Una escritura en producción pregunta en lugar de denegarse, pero con un mensaje
que abre con «⚠️ PRODUCCIÓN» en mayúsculas, la operación, la rama, la sentencia
completa y la advertencia de que no se deshace. Lo que no es una escritura de
datos —productos no elegidos, proyectos, snapshots, migraciones fuera de
drizzle-kit— sigue denegado.

### E. MCP en modo de solo lectura (`?readonly=true` o alcance de OAuth)
Sin escrituras de ningún tipo; cero guarda que mantener.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | La regla queda aplicada, no escrita | Una lista de nombres que hay que mantener al día con el servidor | Bajo |
| D | Una sola regla, igual que Vercel | Un `DROP` aprobado sin leer en producción es irreversible —un rollback de Vercel no lo es— y contradice #121 y #124 | Bajo |
| D' | El usuario decide cada escritura en producción viéndola, sin tener que salir a la consola; lo irreversible de verdad sigue denegado | Un `DROP` aprobado sin leer sigue siendo posible; el aviso lo hace menos probable, no imposible. Relaja la regla de #121 y #124 de «nunca un agente» a «un agente, con aprobación en el momento» | Bajo: volver a `deny` es cambiar una línea del hook |
| E | Máxima seguridad | Pierde las ramas descartables, que es lo más útil del plugin para probar migraciones con datos reales (ADR 0006) | Bajo |

## Decisión elegida

**Alternativa A, con D'.** La primera versión de este ADR —todavía sin
commitear— elegía A con `deny` para toda escritura en producción, y descartaba
D' junto con D. **El arquitecto recomendaba el `deny`; el usuario eligió D'**:
«que no las deniegue, que las pregunte pero con un mensaje que sobresalga». Se
registra así, con su riesgo, en Consecuencias. Alcance:

- **Pasa sin preguntar:** `list_*`, `describe_*`, `get_database_tables`,
  `compare_database_schema`, `inspect_database`, `query_logs`, búsqueda de
  documentación, y `explain_sql_statement` sin `analyze`.
- **Pregunta siempre:** `create_branch`; cualquier herramienta que devuelva
  credenciales; `run_sql` sin rama cuando es un único `SELECT`, `EXPLAIN` o
  `SHOW` sin palabras que modifiquen (heurística, por eso pregunta); toda
  escritura sobre una rama explícita que no figure como protegida; y cualquier
  herramienta que no esté en ninguna lista, incluidas las que Neon agregue.
- **Pregunta con el aviso de PRODUCCIÓN:** cualquier escritura —o herramienta
  desconocida— sin `branchId` o sobre una rama protegida (`main`,
  `production`, o un id listado en la variable de entorno personal
  `NEON_RAMAS_PROTEGIDAS`). Una lectura evidente sobre esas mismas ramas
  pregunta con el mensaje normal.
- **Denegado:** `complete_database_migration` y `complete_query_tuning`, que
  cambian el esquema por fuera de drizzle-kit y desincronizan su diario de
  migraciones (ADR 0005); Neon Auth, Data API, Functions, triggers, Object
  Storage y AI Gateway, que se adoptan con un ADR y no con un clic;
  `create_project`, `delete_project` y restaurar snapshots, que no escriben
  datos sino que reemplazan o destruyen la rama o el proyecto entero, y son del
  usuario desde la consola de Neon.
- **La sesión principal no pasa por el hook**, igual que en los otros tres:
  ahí está el usuario, y Claude Code ya le pide permiso por cada herramienta MCP.

El hook y la referencia al MCP en `tools:` **se versionan** aunque el plugin
sea personal: en un clon sin el plugin no existe ninguna herramienta que
matchee, el hook no corre y la entrada de `tools:` no resuelve a nada. Si
alguien habilita el plugin después, nace protegido.

## Motivo

A resuelve el problema presente —que un agente use el plugin sin que la regla
de #121 y #124 sea solo un párrafo—. D —todo `ask`, igual que Vercel— se descarta
porque la asimetría con Vercel es real: allá lo peor es un deploy revertible;
acá, datos borrados en producción, sin política de copias todavía (ADR 0006).
D' toma de D solo la parte que el usuario quiere decidir en el momento —las
escrituras de datos en producción— y compensa la asimetría con el aviso; lo que
no es una escritura de datos sigue denegado, porque ahí la aprobación no
reemplaza una decisión que falta (un ADR, drizzle-kit, la consola). E se
descarta porque las ramas son la razón por la que se eligió Neon.

Documentación consultada: `https://code.claude.com/docs/en/hooks` (nombres
`mcp__plugin_<plugin>_<servidor>__<herramienta>` y matcher por regex) y
`https://neon.com/docs/ai/neon-mcp-server` (categorías, `?readonly=true`,
`?category=`, `?projectId=`). La lista exacta de herramientas y sus parámetros
**no está publicada en esas páginas ni en el plugin**: el hook se escribió por
patrón y no estaba verificado cuando se escribió; lo está ahora (ver Deuda técnica).

## Consecuencias

**Aceptamos:**
- **Un agente puede escribir en producción si el usuario lo aprueba en el
  momento.** Es un riesgo elegido por el usuario: un `DROP` o un `DELETE` sin
  `WHERE` aprobado de apuro no se deshace. La regla de #121 y #124 pasa de
  «nunca un agente» a «nunca sin la aprobación del usuario sobre la sentencia
  exacta». Las migraciones y la importación a producción siguen sin pasar por
  el MCP: van por `pnpm db:migrate` y el script de importación, porque solo así
  queda al día el diario de drizzle-kit.
- Sin `NEON_RAMAS_PROTEGIDAS`, una escritura que nombre explícitamente el id
  `br-…` de producción pregunta con el mensaje **normal**, no con el de
  PRODUCCIÓN: el hook no puede saber qué id es producción. Nunca pasa sin
  preguntar; lo que se pierde es el aviso, justo en el caso en que más sirve.
- En modo automático, `ask` no muestra el diálogo y la llamada se rechaza:
  falla del lado seguro, pero el agente no puede escribir en Neon desde una
  sesión desatendida.
- La heurística de `SELECT` puede equivocarse; por eso pregunta y no deja pasar.
- Una cadena de conexión aprobada queda en la transcripción.

**Obtenemos:**
- Toda escritura en producción pasa por un portón con un aviso propio, no por
  el diálogo genérico de permisos.
- Se puede diagnosticar producción y ensayar migraciones en ramas
  descartables, con el usuario aprobando cada escritura (quién hace cada cosa:
  ADR 0022).
- Los productos de Neon que el proyecto no eligió no entran por una skill.

**Deuda técnica asumida:**
- **Verificado** con `claude mcp list`: el servidor es `plugin:neon:neon`, así
  que las herramientas son `mcp__plugin_neon_neon__*`, que el matcher cubre.
- **Verificado** con el servidor autenticado (117 herramientas): argumentos
  planos y rama en `branch_id`; la lista blanca de lectura incluye los `get_*`
  de metadatos que antes disparaban el aviso de PRODUCCIÓN sin razón. El hook
  sigue leyendo también la forma anidada, por si el servidor cambia.

**Revisar si:**
- Tras autenticar el servidor con `/mcp`, los nombres reales no coinciden con
  la lista blanca de lectura o con las de denegado.
- Se adoptan ramas de Neon por *pull request* o para migrar de forma rutinaria:
  ahí aparecen convenciones (nombres, vencimiento, id de producción) que
  justificarían la skill propia de la alternativa C.
- Las confirmaciones se aprueban sin leer (mismo disparador que el ADR 0010).
  Para las de PRODUCCIÓN, el primer incidente —una escritura aprobada que no
  se quería— devuelve esa salida a `deny`.
