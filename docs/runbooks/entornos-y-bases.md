# Runbook: entornos y bases de datos

Ticket #122, ADR 0023. Quién apunta a qué base, y los pasos que ejecuta el
usuario en los paneles. Ningún valor secreto vive en este archivo.

## Bases (proyecto Neon `argentum-project`, `long-night-55353572`)

| Rama | Id | Endpoint (host, sin credenciales) | Uso |
| ---- | -- | --------------------------------- | --- |
| `main` | `br-super-leaf-awq2l79n` | el de la integración | Producción |
| `preview` | `br-bitter-resonance-aw8b55is` | `ep-silent-glitter-awaz5wyh` (pooler: `…-pooler.c-12.us-east-1.aws.neon.tech`) | Vistas previas de Vercel |
| (Docker) | no es Neon | `localhost` | Desarrollo local |

`preview` nació como copia de `main` el 2026-09-26. **El ADR 0027 decidió que
se reemplace por una rama *schema-only*, sin padre**, poblada desde el
repositorio, antes de cerrar el #123. Al 2026-10-02 no tiene datos personales
(tampoco `main`: 0 usuarios), pero está desfasada: le falta la migración 0001 y
tiene 0 entidades. Cuando exista la rama nueva, cambian su id y su endpoint en
esta tabla.

## Mapa de variables

| Variable | Production | Preview | Development (Vercel) | Local (`.env`) |
| -------- | ---------- | ------- | -------------------- | -------------- |
| `DATABASE_URL` | la de la integración (`main`, pooler) | **propia**: cadena con pooler de `preview` | **ninguna** | Docker |
| `DATABASE_URL_UNPOOLED` | la de la integración (`main`) | **ninguna** | **ninguna** | Docker |
| `DATABASE_URL_DIRECT` | eliminar | eliminar | eliminar | (no existe; sin uso en el repo) |
| Resto (`PG*`, `POSTGRES_*`, `NEON_*`, `VITE_NEON_AUTH_URL`) | integración | quitar el registro de integración (paso 1) | quitar (paso 1) | no aplica |

Regla: **Preview nunca lleva una cadena de `main`**, y `pnpm db:migrate` /
`contenido:importar` no se corren desde una máquina con variables de Vercel
(`vercel env pull` no se usa salvo pedido explícito).

## Pasos del usuario en los paneles

Orden importa: primero la variable de Preview, después quitar la vieja.

1. **Cargar `DATABASE_URL` de Preview.** En Neon, rama `preview`, "Connect",
   copiar la cadena **con pooler**. En Vercel, Settings, Environment Variables,
   agregar `DATABASE_URL` solo para **Preview**. El secreto no pasa por un
   agente.
2. **Quitar Preview y Development de la integración.** El registro actual de
   `DATABASE_URL` (y los demás de la integración) está asignado a los tres
   entornos y es administrado por la integración. Vía documentada por Neon: en
   Vercel, Storage, la base Neon, Connect Project / ajustes del proyecto
   conectado, **desmarcar Preview y Development** y guardar. Alternativa: editar
   cada registro de Vercel y sacarle Preview y Development (puede volver a
   aparecer si la integración resincroniza; por eso se verifica en el paso 4).
3. **Eliminar `DATABASE_URL_DIRECT`** (tres registros: Production, Preview,
   Development). No la escribe la integración ni la lee el repo.
4. **Verificar** (abajo). Si tras un tiempo o un redeploy reaparecen Preview o
   Development en algún registro de integración, repetir el paso 2 por la vía
   de ajustes de la integración.
5. **Proteger `main` en Neon: no aplica.** El plan actual es Free
   (`free_v3`) y las ramas protegidas son de planes pagos. No se compra; la
   defensa es la separación de variables y la guarda del ADR 0023.

## Verificar sin ver valores

```bash
vercel env ls
```

Esperado: `DATABASE_URL` con dos filas —una `Production` (integración) y una
`Preview` (la propia)—; `DATABASE_URL_UNPOOLED` solo en `Production`; ningún
registro de la integración en `Development` ni en `Preview`;
`DATABASE_URL_DIRECT` ausente. Para confirmar que Preview apunta a `preview` y
no a `main`, comparar el host de la variable en el panel con el endpoint de la
tabla de arriba (`ep-silent-glitter-awaz5wyh`), sin copiar la contraseña.

## Operar `preview`

- **Esquema y contenido se actualizan a mano**, con el mismo procedimiento que
  producción pero apuntando a la cadena de `preview` en la línea de comando de
  un solo proceso (`DATABASE_URL_UNPOOLED=… pnpm db:migrate`), nunca en un
  archivo del árbol.
- **Prohibido desde el ADR 0027:** «Reset from parent» y «restore» sobre
  `preview` a partir de `main`. Copian datos de producción, que desde el módulo
  `identidad` pueden ser datos personales de menores. `preview` se pone al día
  migrando e importando, nunca copiando.
- **Escribe en `preview` solo el `infra-specialist`** (ADR 0025), con la
  confirmación del usuario.
- **Nada de esto toca producción.**
- **Guarda del destino (ADR 0023):** `pnpm contenido:importar` y `pnpm db:migrate`
  se niegan a escribir en un host que no sea local salvo que se anteponga
  `DB_CONFIRMAR_DESTINO=<host>` al comando. La confirmación acepta el host con o
  sin `-pooler`.

## Disparador para pasar a una rama por PR

Cualquiera de los dos, y se decide con ADR antes:

- Dos PR abiertos a la vez con migraciones que chocan en `preview`.
- ~~Llega el módulo `identidad`~~: cumplido y decidido en el ADR 0027 (`preview`
  sin padre, sin datos de producción).
