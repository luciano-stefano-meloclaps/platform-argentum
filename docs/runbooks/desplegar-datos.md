# Runbook: migrar e importar el contenido en producción

Ticket #121; ADR 0004 (contenido curado importado a la base), ADR 0005
(migraciones con drizzle-kit), ADR 0022 (quién opera qué), ADR 0023 (guarda del
destino), ADR 0024 (agentes pueden ejecutar esto, con confirmación en el
momento); runbooks hermanos `entornos-y-bases.md` e
`identidad-en-produccion.md`. Ningún valor secreto vive en este archivo.

**Esto puede ejecutarlo el `infra-specialist` (o el `database-specialist`
dentro de su área), contra producción, siempre que el usuario apruebe en el
momento el comando exacto que va a correr** (ADR 0024). No es una autorización
general para "correr esto cuando haga falta": es una confirmación por cada
ejecución, viendo la línea completa —incluida la variable
`DB_CONFIRMAR_DESTINO` con el host— antes de que el proceso arranque. Nada de
esto se agrega a la lista `allow` de `.claude/settings.json`: eso convertiría la
confirmación puntual en un permiso permanente, que es exactamente lo que el ADR
0024 no autoriza. El usuario sigue pudiendo ejecutarlo él mismo en cualquier
momento, como antes.

## Qué hace `pnpm desplegar:datos`

Es `pnpm db:migrate && pnpm contenido:importar`, en ese orden:

1. `db:migrate` aplica las migraciones pendientes de `drizzle/`. Lee
   `DATABASE_URL_UNPOOLED` (cadena **sin** pooler).
2. `contenido:importar` lee `contenido/`, valida cada ficha contra el
   descriptor de su tipo y la escribe en `entidad`. Lee `DATABASE_URL`.

Cada paso conserva su guarda del destino (ADR 0023). Los pasos por separado
siguen valiendo y son la forma de operar cuando solo hace falta uno.

## Cuándo se corre, y en qué orden

Se corre **una vez por cada despliegue que cambie el esquema o el contenido**
(una migración nueva, una ficha nueva o editada). Si el despliegue no toca
ninguno de los dos, no hace falta.

Orden, siempre:

1. **Mergear a `main`** (lo hace el usuario) **sin promover todavía**, o tener el
   código listo, según el caso de abajo.
2. **`pnpm desplegar:datos` contra producción** (invocación abajo).
3. **Desplegar o redesplegar producción.**
4. **Verificar** (sección al final).

Por qué el redespliegue es obligatorio: la ficha se prerenderiza en el build
(`dynamicParams = false`, `generateStaticParams` sobre `listarSlugs`). El build
guarda en HTML lo que había en la base **en ese momento**. Importar después de
un despliegue no cambia lo que sirve el sitio: hasta que se redesplegue,
`/catalogo` y `/catalogo/[slug]` muestran el contenido viejo, y una ficha
nueva devuelve 404 aunque ya esté en la base. Por eso el orden es **datos
primero, despliegue después**; y si por cualquier motivo se importó después de
desplegar, hay que **redesplegar** (Vercel, Deployments, Redeploy del último de
producción, o el mecanismo habitual del usuario).

Cuándo migrar antes de promover: si el código nuevo espera tablas o columnas
nuevas, migrar antes de que ese código sirva tráfico (como en el runbook de
identidad). Si el cambio es solo de contenido, el orden es el mismo: importar y
después redesplegar.

## Cómo se invoca

Desde una máquina cuyo `.env` local **no** apunte a producción por error. Las
cadenas van en la línea de comando de un solo proceso, nunca en un archivo del
árbol y nunca con `vercel env pull`:

```bash
DB_CONFIRMAR_DESTINO=<host de main, del panel de Neon> \
DATABASE_URL_UNPOOLED='<cadena SIN pooler de main>' \
DATABASE_URL='<cadena de main>' \
pnpm desplegar:datos
```

- Las cadenas salen del panel de Neon (rama `main`, Connect) o de las variables
  de la integración en Vercel. La de `DATABASE_URL_UNPOOLED` es sin pooler; la
  de `DATABASE_URL` puede ser con pooler.
- `db:migrate` evalúa el host de `DATABASE_URL_UNPOOLED` y `contenido:importar`
  el de `DATABASE_URL`. El sufijo `-pooler` se normaliza, así que **un solo
  valor de `DB_CONFIRMAR_DESTINO` sirve para los dos**, porque con Neon
  comparten endpoint.
- Verificá el host antes de dar Enter: la guarda pide el host exacto, pero es
  el usuario quien lo escribe a mano.
- No hay modo de prueba (dry-run). Para ensayar, hacerlo primero contra
  `preview` (ver `entornos-y-bases.md`) con la cadena de esa rama y su host.

## Si algo falla

- **Falla `db:migrate`:** no se importa nada (el `&&` corta). Se lee el error,
  se corrige la causa y se vuelve a correr el comando completo. Las
  migraciones ya aplicadas no se repiten.
- **Falla `contenido:importar`:** las migraciones **ya quedaron aplicadas**. La
  importación es idempotente (una transacción por ficha), así que se reintenta
  **solo ese paso**, sin volver a migrar:

  ```bash
  DB_CONFIRMAR_DESTINO=<host de main> \
  DATABASE_URL='<cadena de main>' \
  pnpm contenido:importar
  ```

- **La guarda rechaza el destino tras migrar:** si los hosts de
  `DATABASE_URL_UNPOOLED` y de `DATABASE_URL` divergieran, la guarda de importar
  puede rechazar después de que la migración ya corrió. Se corrige la cadena y
  se corre solo `contenido:importar`. Es la señal de que una de las dos cadenas
  no es de `main`: pararse y revisarlas antes de reintentar.
- Una ficha inválida no entra (la valida el descriptor); el error nombra la
  ficha. Se corrige el archivo de `contenido/` por su dueño y se reintenta.

## Por qué no está automatizado (todavía)

Sigue siendo un paso con supervisión a propósito, aunque desde el ADR 0024 lo
pueda disparar un agente: cada corrida exige que alguien —el usuario, siempre;
un agente, con confirmación en el momento— vea el host que confirma antes de
que el comando arranque (ADR 0022, ADR 0023, ADR 0024). Es un solo comando.

**Disparador para automatizarlo:** la **segunda vez** que alguien olvide el
paso (un despliegue que llegó a producción sin importar, o sin redesplegar
después de importar). Recién ahí se propone la opción; hasta entonces no se
construye.

**Advertencia sobre la forma:** importar **dentro del build** de Vercel escribiría
en la base de producción desde cada build, incluidos los de Preview, y hoy el ADR
0004 dice que el contenido se importa desde archivos como paso explícito, no
que lo haga el build. Hacerlo requiere **un ADR nuevo que precise el 0004**
(y que decida, entre otras cosas, cómo impedir que un build de Preview escriba
en `main`, y cómo se sostiene la guarda del ADR 0023). No se hace sin ese ADR.
Otras opciones a evaluar entonces: un workflow de CI, o un paso manual con
recordatorio.

## Verificar que producción lista las fichas

Después del redespliegue, con lecturas:

1. **En la aplicación:** abrir `/catalogo` en el dominio de producción y
   comprobar que lista las fichas esperadas (hoy, al menos la de Manuel
   Belgrano) y que `/catalogo/manuel-belgrano` (o el slug de una ficha
   importada) abre la ficha y no un 404.
2. **En la base (solo lectura), sin ver credenciales en un archivo:** con la
   cadena en la línea de comando,
   `SELECT tipo, count(*) FROM entidad GROUP BY tipo;` debe dar un conteo distinto
   de cero por cada tipo importado (o pedírselo al `infra-specialist`, que lo
   lee por el MCP de Neon con `branch_id` explícito).
3. **Si `/catalogo` está vacío o falta una ficha y la base sí la tiene:** falta
   el redespliegue (el HTML prerenderizado es el viejo). Redesplegar y volver
   a mirar.
4. **Si la base no la tiene:** falló o no se corrió la importación; se repite
   `pnpm contenido:importar` (idempotente) y después se redespliega.
5. Logs de Vercel del despliegue: sin errores de conexión a la base durante el
   build (el build lee la base para prerenderizar).

## Reversa

- La migración y la importación no se deshacen con este runbook: la importación
  es un upsert idempotente; una ficha equivocada se corrige en `contenido/` y se
  reimporta. Para deshacer una migración, ver el runbook de identidad
  (`0001`, aditiva) o restaurar desde una rama de respaldo antes de migrar (la
  ventana de historia es de 6 horas).
- El despliegue se revierte con rollback en Vercel; el código anterior sigue
  funcionando con tablas nuevas aditivas.
