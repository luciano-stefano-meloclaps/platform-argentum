# Runbook: identidad (Better Auth) en producción

Tickets #123, #124 y #121; ADR 0019 (Better Auth), ADR 0023 (guarda del
destino), runbook hermano `entornos-y-bases.md`. Ningún valor secreto vive en
este archivo. **Migrar e importar en producción lo ejecuta el usuario**; el
`infra-specialist` prepara, verifica y, con autorización expresa, opera solo la
rama `preview`.

Estado leído el 2026-09-26 (solo lectura, **HISTÓRICO: anterior a la migración
0001 en `main`; ver la actualización de abajo**): proyecto Neon
`long-night-55353572`, PostgreSQL 18, plan Free (`free_v3`, límite de 10
ramas). Ramas: `main` `br-super-leaf-awq2l79n` (producción, no protegida) y
`preview` `br-bitter-resonance-aw8b55is`. En Vercel no existe ninguna de las
cuatro variables de Better Auth, en ningún entorno (sigue siendo cierto).
Producción sirve `main` sin identidad (sigue siendo cierto: no se desplegó).

**Actualización 2026-09-26:** la migración `0001` ya está aplicada y verificada
en `main` (#124). Verificado por lectura: `main` tiene las tablas `account`,
`comments`, `entidad`, `session`, `user` y `verification`. `comments` es ajena a
este trabajo y no se toca. `entidad` tenía **0 filas**: falta poblar el
catálogo (#121, paso 8). Sigue sin cargarse ninguna variable de Better Auth en
Production ni en Preview (#123).

**Constancia de la excepción:** la `0001` en `main` la ejecutó el
`infra-specialist` **por excepción, con autorización expresa del usuario en esa
sesión (2026-09-26)**. No sienta precedente: la regla del ADR 0022 (migrar e
importar en producción lo ejecuta el usuario) sigue vigente. Además se **saltó
el orden de este runbook**: el ensayo previo en `preview` (pasos 1 a 4) no se
hizo, y tampoco se creó la rama de respaldo del paso 5.

## Qué requiere el código

`src/identidad/auth.ts` (`construirAuth`) lanza un error nombrando la variable
que falta, **en la primera petición** que use auth (no en `next build`). Lee
cuatro variables y **las cuatro son obligatorias, incluidas las de Google**:
aunque alguien solo quiera entrar con email y contraseña, si faltan
`GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` toda la identidad falla. La ruta del
protocolo es `src/app/api/auth/[...all]/route.ts`, así que el callback de Google
es `<BETTER_AUTH_URL>/api/auth/callback/google` (ruta por defecto de Better
Auth; confirmarla en la primera prueba real, ver "Verificación").

Migración `drizzle/0001_right_nuke.sql`: crea `account`, `session`, `user` y
`verification`. Es aditiva (no toca `entidad`). Para producción el código nuevo
espera esas tablas: **migrar antes de promover**.

## Variables (ticket #123)

Se cargan en el panel de Vercel, Settings, Environment Variables. Los valores no
pasan por un agente ni por un archivo del árbol.

| Variable | Production | Preview | Development |
| -------- | ---------- | ------- | ----------- |
| `BETTER_AUTH_SECRET` | propio, generado para producción | **distinto** al de producción | no se carga (usa `.env` local) |
| `BETTER_AUTH_URL` | dominio público de producción, `https://…`, sin barra final | ver decisión pendiente | no se carga |
| `GOOGLE_CLIENT_ID` | cliente OAuth | cliente OAuth | no se carga |
| `GOOGLE_CLIENT_SECRET` | secreto del cliente | secreto del cliente | no se carga |

- Generar cada secreto en tu máquina: `openssl rand -base64 32` (uno por
  entorno, nunca compartir el de producción con Preview ni con local). Marcar
  `BETTER_AUTH_SECRET` y `GOOGLE_CLIENT_SECRET` como **Sensitive**.
- Un `BETTER_AUTH_SECRET` compartido entre Preview y Production haría que una
  sesión creada en un preview valga en producción.
- **Decisión pendiente (del usuario, con el arquitecto si hace falta):** las
  URL de Preview cambian en cada despliegue, y `BETTER_AUTH_URL` y el URI de
  redirección de Google son exactos. Opciones: (a) Preview sin Google
  funcionando (las variables cargadas con los mismos valores, el botón de Google
  falla con `redirect_uri_mismatch` y solo se prueba email y contraseña); (b)
  fijar un dominio estable para Preview y registrarlo en Google y en
  `BETTER_AUTH_URL` de Preview. Mientras no se decida, aplicar (a).

## Google OAuth (lo hace el usuario en Google Cloud Console)

1. Crear un cliente OAuth de tipo **Web application**.
2. **URI de redirección autorizados** (uno por cada URL desde la que se inicie
   sesión):
   - `https://<dominio-de-produccion>/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (desarrollo local)
   - el de Preview, si se elige la opción (b) de arriba.
3. **Orígenes de JavaScript autorizados:** `https://<dominio-de-produccion>`
   (y `http://localhost:3000`).
4. Pantalla de consentimiento en modo **producción** (en "testing" solo pasan
   los correos listados como usuarios de prueba).
5. Copiar ID y secreto directo al panel de Vercel.

## Orden de trabajo: preview primero, producción después

No mergear `development` a `main` ni desplegar a producción hasta completar los
pasos 1 a 4.

1. **Migrar `0001` en la rama `preview`** de Neon. Lo puede hacer el
   `infra-specialist` **solo con autorización expresa** (todavía no otorgada), o
   el usuario:
   ```bash
   DB_CONFIRMAR_DESTINO=ep-silent-glitter-awaz5wyh.c-12.us-east-1.aws.neon.tech \
   DATABASE_URL_UNPOOLED='<cadena SIN pooler de la rama preview>' \
   pnpm db:migrate
   ```
   La cadena se copia del panel de Neon (rama `preview`, Connect, sin pooler) y
   va en la línea de comando de un solo proceso: nunca en `.env` ni en un
   archivo. El host de `DB_CONFIRMAR_DESTINO` se toma de esa misma cadena (con o
   sin `-pooler`, la guarda acepta ambos).
2. **Cargar las cuatro variables en Preview** (tabla de arriba).
3. **Probar en un preview** (rama `feat/111-identity-better-auth`): registrarse
   con email, cerrar e iniciar sesión, y el botón de Google si aplica.
4. Solo con eso en verde, seguir con producción.
5. **Copia de respaldo de `main`** antes de migrar. Para la `0001` este paso
   quedó superado: **NO se creó `main-respaldo-0001`, es decir, la migración
   corrió sin respaldo**. Sigue siendo válido antes de cualquier migración
   futura (hoy no hay política de copias, deuda del ADR 0006). Opción sin
   costo: en Neon crear una rama de respaldo desde `main` (cuenta contra el
   límite de 10 ramas y contra la cuota) y borrarla cuando la migración esté
   verificada. La ventana de historia del proyecto es de 6 horas
   (`history_retention_seconds` 21600), así que un restore a un punto anterior
   solo sirve dentro de ese margen. El `infra-specialist` puede crear la rama
   con autorización expresa.
6. **Migrar producción (#124). HECHO el 2026-09-26** (la `0001` está aplicada y
   verificada en `main`; no repetir). Referencia del comando, que lo ejecuta
   el usuario:
   ```bash
   DB_CONFIRMAR_DESTINO=<host de main, del panel de Neon> \
   DATABASE_URL_UNPOOLED='<cadena SIN pooler de main>' \
   pnpm db:migrate
   ```
   La cadena de `main` sale del panel de Neon o de la variable de la integración
   en Vercel; no usar `vercel env pull`. Correrlo desde una máquina donde el
   `.env` local **no** apunte a producción por error: la guarda pide el host
   exacto, pero verificá el host antes de dar Enter.
7. **Cargar las cuatro variables en Production** (#123).
8. **Poblar el catálogo (#121), lo ejecuta el usuario**, después de migrar:
   ```bash
   DB_CONFIRMAR_DESTINO=<host de main> \
   DATABASE_URL='<cadena de main>' \
   pnpm contenido:importar
   ```
   Es idempotente y lee `DATABASE_URL`. También existe `pnpm desplegar:datos`
   (migrar e importar en un solo comando): ver `desplegar-datos.md`, que además
   explica el **redespliegue** obligatorio tras importar.
9. **Recién ahora**: mergear `development` a `main` y desplegar (lo hace el
   usuario). Verificar (abajo).

   **Puerta antes de mergear `development` a `main`** (los dos, por lectura):
   - `SELECT count(*) FROM entidad;` en `main` distinto de cero (#121 hecho).
   - `vercel env ls` muestra en **Production** las cuatro variables:
     `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID` y
     `GOOGLE_CLIENT_SECRET` (#123 hecho).

   **Advertencia:** no usar `drizzle-kit push` contra `main`. La tabla
   `comments` es ajena al esquema de Drizzle y `push` intentaría reconciliarla
   (borrarla). Las migraciones van solo por `pnpm db:migrate`.

## Verificación

- Sin ver valores: `vercel env ls` muestra las cuatro variables en Production
  (y en Preview) por nombre.
- Base: consulta de solo lectura, con la cadena en la línea de comando,
  `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`
  debe listar `account`, `session`, `user`, `verification` y `entidad`. Y
  `SELECT count(*) FROM entidad;` distinto de cero tras #121.
- Aplicación: `/registro` crea un usuario; `/ingreso` lo reconoce; la nav muestra
  la sesión; `/catalogo` lista fichas. El botón de Google redirige a Google y
  vuelve sin `redirect_uri_mismatch`: **acá se confirma que la ruta real del
  callback es `/api/auth/callback/google`**.
- Logs de Vercel: sin el error «Falta la variable de entorno …».

## Reversa

- Variables: se pueden borrar en el panel; el sitio queda sin identidad pero el
  catálogo sigue funcionando solo si el código no exige auth en esas rutas (hoy
  la nav con sesión sí llama a Better Auth: sin variables, falla).
- Despliegue: rollback en Vercel al despliegue anterior (`dpl_AXXUt8Gz…`,
  `main` @ `543d2df`, sigue siendo rollback candidate). El código viejo no usa
  las tablas nuevas, así que el rollback es seguro sin tocar la base.
- Migración `0001`: aditiva. Si hay que deshacerla, borrar las cuatro tablas
  (`account`, `session`, `user`, `verification`) desde una sesión SQL del
  usuario. **No hay rama de respaldo** (la `0001` corrió sin ella). Como
  alternativa, un restore a un punto anterior de `main`, que solo sirve dentro
  de la ventana de historia de 6 horas, contada desde la migración (2026-09-26).
  Solo antes de que existan usuarios reales: después de eso se pierden cuentas.

## Riesgos

- Mergear a `main` antes de los pasos 6 y 7 rompe las rutas de auth y la nav
  con sesión en producción.
- `preview` es hoy copia de `main`. Con `identidad` (datos personales) el
  runbook `entornos-y-bases.md` pide crearla sin datos: hacer Reset cuando
  empiece a haber usuarios reales, y no copiar producción a Preview.
- La pantalla de consentimiento de Google en modo «testing» bloquea a cualquier
  usuario que no esté en la lista.
- Neon Auth sigue habilitado y sin uso, con `NEON_AUTH_BASE_URL` y
  `VITE_NEON_AUTH_URL` en Production. No interfieren con Better Auth propio;
  apagarlo es un paso de consola aparte, después de esto.
