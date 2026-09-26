# 0019 — El módulo `identidad` se construye sobre Better Auth, con email y contraseña más Google

- **Estado:** Aceptado — su Regla 4 fue enmendada parcialmente por el
  [ADR 0020](0020-sesion-en-la-nav-leida-desde-el-cliente.md)
- **Fecha:** 2026-09-19
- **Decide:** el usuario (alcance y método); **redacta:** el `super-architect`

> **Nota del ADR 0020.** La Regla 4 (`identidad.ts` como punto de entrada para
> todo lo que no es el protocolo OAuth) queda enmendada solo para la lectura de
> la sesión que muestra la barra de navegación, que se hace desde el cliente. El
> resto de la regla y de la decisión rige sin cambios.

## Decisión

Se introduce el quinto módulo del ADR 0002, `identidad`, con su punto de
entrada en `src/identidad/identidad.ts` (ADR 0017). El módulo envuelve
**Better Auth** configurado con dos métodos de autenticación, los dos activos
desde el primer despliegue de esta rebanada:

- **Email y contraseña**, con alta (sign up) e inicio de sesión.
- **Google OAuth**, vía el proveedor social nativo de Better Auth.

`identidad` **no** declara un puerto de persistencia propio: delega toda la
persistencia a Better Auth, que ya trae el suyo (`drizzleAdapter`). El esquema
de sus tablas (`user`, `session`, `account`, `verification`) se genera con el
CLI de Better Auth y se aplica con `drizzle-kit`, en un archivo separado de
`src/db/esquema.ts`, con **sus nombres propios en inglés**, sin traducir al
español.

Fuera de alcance de esta rebanada, explícitamente: verificación de email y
recuperación de contraseña. Las dos requieren enviar correo, y no hay hoy un
proveedor de envío de email en el stack — introducirlo ahora sería exactamente
el tipo de infraestructura sin necesidad presente que el principio de
arquitectura del proyecto prohíbe. Queda anotado como decisión pendiente, más
abajo.

## Contexto

CLAUDE.md ya declaraba, en prosa y sin ADR propio, que el stack usa "Better
Auth **recién** cuando lleguen las cuentas: el MVP no tiene cuentas". Esta
rebanada es exactamente ese momento: el usuario pidió un login, y tras la
ronda de preguntas bloqueantes del `super-architect` confirmó tres cosas que
fijan el alcance:

1. Método: email + contraseña **y** Google OAuth, los dos juntos.
2. Alcance: alta (sign up) e inicio de sesión (login) en la misma rebanada.
3. Propósito: adelantar el módulo `identidad` de verdad —no una maqueta de
   interfaz—, aceptando que quede sin conectar a `progreso` hasta que esa
   rebanada llegue. `docs/decisiones-pendientes.md` (líneas 74-104) ya tiene
   registrado que la forma de la cuenta era, hasta hoy, una de las dos
   incógnitas que bloqueaban decidir cómo `progreso` atribuye sus eventos; esta
   decisión resuelve esa incógnita sin resolver la otra (si el progreso
   sobrevive al cierre del navegador), que sigue abierta y sigue bloqueando la
   rebanada 5 hasta que llegue su propio ADR.

Estado real del árbol: un solo desarrollador, producto sin validar, cero
usuarios, cero cuentas hoy. `catalogo` es el único módulo que existe
(`src/catalogo/catalogo.ts`, ADR 0016/0017), con `entidad` como única tabla
(ADR 0001) y su puerto de salida explícitamente pospuesto (ADR 0018). La capa
web es hexagonal con MVVM (ADR 0016): la regla de límite dice que la capa web
no consulta la base ni contiene lógica de negocio, y hoy no existe ningún
`/api` interno ni ninguna Server Action (Regla 2 del ADR 0016, que preveía la
primera Server Action recién con la propuesta de moderación).

La audiencia del producto arranca en los doce años (ADR 0012), y a esa edad se
sigue siendo menor.

## Problema

Cómo construir login y registro sin repetir, para el quinto módulo, errores
que el proyecto ya identificó y corrigió en los primeros cuatro:

- No repetir el patrón de `catalogo` de introducir un puerto de persistencia
  "por si acaso" sin un segundo candidato real (ADR 0018).
- No dejar que la primera pantalla con mutaciones reales decida, por
  acumulación y sin quedar escrito, si hace falta `/api` interno, dónde vive
  la validación y cómo se ve un mensaje de error.
- Autenticación es, además, la primera vez que el proyecto toca datos
  personales de una audiencia que empieza en los doce años, y eso tiene que
  quedar dicho, no asumido.

## Alternativas consideradas

### A. Better Auth (framework de autenticación, TypeScript, sobre Drizzle)
Librería que se integra en la propia aplicación Next.js: expone un handler de
ruta, un cliente para el navegador, y un adaptador de persistencia que ya sabe
hablar con Drizzle/PostgreSQL —el mismo ORM y el mismo motor que ya usa el
proyecto (ADR 0005, ADR 0006)—.

### B. Auth.js (ex NextAuth)
La alternativa histórica del ecosistema Next.js para el mismo problema:
proveedores sociales y de credenciales, adaptador de base de datos, sesión por
cookie.

### C. Proveedor administrado (Clerk, Auth0, Descope — vía `vercel:auth`)
Delegar la autenticación entera a un servicio externo con su propio panel,
tabla de usuarios y facturación, integrado como *marketplace* de Vercel.

### D. Autenticación propia
Hashear contraseñas a mano (`bcrypt`/`argon2`), armar la tabla de usuarios,
las sesiones y el flujo de OAuth de Google contra su API REST, sin librería de
por medio.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ------------------ |
| A. Better Auth | Corre en el mismo proceso (coherente con el monolito modular del ADR 0002); usa el Drizzle/PostgreSQL que el proyecto ya tiene, sin una base ni un panel externo nuevo; soporta email+contraseña y Google con configuración, no con código propio; ya estaba decidido en CLAUDE.md antes de esta rebanada | Trae sus propias tablas con sus propios nombres (en inglés), que no siguen la convención en español del resto del esquema; requiere una ruta de protocolo propia (`/api/auth/[...all]`) | Medio: migrar de proveedor de auth siempre implica migrar usuarios y sesiones existentes |
| B. Auth.js | Tan integrado a Next.js como A; comunidad más grande e historia más larga | Su modelo de sesión y su adaptador de Drizzle son menos maduros que los de Better Auth para el caso email+contraseña con verificación server-side; cambiar de A a B hoy, con cero usuarios, no tendría ningún costo de migración de datos que lo justifique | Medio, mismo motivo que A |
| C. Proveedor administrado | Cero código de autenticación propio; UI lista, paneles de administración incluidos | Los usuarios y sus contraseñas viven en un sistema de terceros ajeno al monolito del ADR 0002 —contradice la razón de ser de esa decisión, "un deploy, una base de código, el modelo escrito una vez"—; factura aparte; para un producto sin validar es pagar por escala y soporte que todavía no hacen falta | Alto: sacar usuarios de un proveedor administrado es la migración más cara de las cuatro |
| D. Autenticación propia | Cero dependencias nuevas; control total | Reinventa hasheo de contraseñas, gestión de sesión y el protocolo OAuth de Google — cada uno de esos tres es una superficie de seguridad real que una librería mantenida ya resolvió y audita; el costo no es escribirlo una vez, es mantenerlo bien para siempre | Alto: la superficie de seguridad casera no se reemplaza, se reescribe |

## Decisión elegida

**Alternativa A: Better Auth**, ya apuntada en CLAUDE.md antes de esta
rebanada. Este ADR la formaliza porque el disparador —"cuando lleguen las
cuentas"— ya se cumplió, y fija además las decisiones nuevas que trae
construir el módulo de verdad: sin puerto de persistencia propio, con sus
tablas en su nomenclatura original, y con dos exclusiones explícitas de
alcance (verificación de email, recuperación de contraseña).

### Regla 1 — Sin puerto de persistencia propio para `identidad`

`docs/decisiones-pendientes.md` §5 ya fija la regla interina para cualquier
módulo nuevo mientras esa entrada siga abierta: "importa `db` directo, sin
anticipar una interfaz de persistencia por si acaso". `identidad` va un paso
más allá y ni siquiera importa `db` directo: **Better Auth ya es el
adaptador**. Su configuración (`drizzleAdapter(db, { provider: "pg", schema
})`) es, en el vocabulario del ADR 0016, el puerto de salida y su
implementación, ya resueltos por la librería. Agregar una segunda interfaz
propia por encima sería exactamente la "capa vacía... escrita por deporte"
que el ADR 0016 ya advirtió y que el ADR 0018 evitó para `catalogo`: hoy hay
una sola implementación real (Better Auth sobre Drizzle/PostgreSQL) y ningún
candidato a segunda.

### Regla 2 — Las tablas de Better Auth no se traducen

`user`, `session`, `account` y `verification` se generan con el CLI de Better
Auth (`npx @better-auth/cli generate`, verificado contra su documentación) y
viven en un archivo propio, **no** en `src/db/esquema.ts`, que sigue siendo
solo la tabla `entidad` del ADR 0001. Sus columnas quedan con los nombres que
la librería genera, en inglés, y no con la convención en español del resto
del esquema.

Es una excepción explícita y acotada a estas cuatro tablas, no un cambio de
convención: son tablas del *vendor*, que sus propias rutinas internas —y
cualquier versión futura de la librería— leen y escriben por nombre. Traducir
las columnas obligaría a mantener un mapeo propio contra cada actualización
de Better Auth, a cambio de una prolijidad que nadie más que nosotros
necesita, porque nadie fuera del módulo `identidad` va a leer esas tablas
directo (Regla 1 de este ADR y Regla 1 del ADR 0016, aplicada por analogía).

Consecuencia de implementación para el `database-specialist`: `drizzle.config.ts`
pasa de `schema: "./src/db/esquema.ts"` a una lista con los dos archivos.

### Regla 3 — Una ruta de protocolo, no un `/api` interno

`src/app/api/auth/[...all]/route.ts`, con `toNextJsHandler(auth)`, es
infraestructura obligatoria de Better Auth: sirve el intercambio de cookies de
sesión y el *callback* de OAuth de Google, que por diseño necesita una URL
alcanzable por HTTP fuera del ciclo de una función de servidor.

Esto **no** es el `/api` interno que la Regla 2 del ADR 0016 prohíbe. Aquella
regla evita que la capa web se cree a sí misma una segunda copia del contrato
de un módulo, expuesta como JSON, para "poder curlear" algo que ya podía
llamar directo. Esta ruta no expone nada del dominio del proyecto: es el
protocolo propio de un tercero, que el propio `frontend-specialist` no
escribe a mano —lo genera `toNextJsHandler`— y con el que ninguna otra parte
del sistema interactúa salvo el propio cliente de Better Auth en el
navegador.

### Regla 4 — `identidad.ts` es el punto de entrada para todo lo que no es el protocolo OAuth

`src/identidad/identidad.ts` expone, para el resto del sistema (hoy la capa
web; mañana `progreso` u otro módulo que necesite saber quién es el usuario):

- `registrarse(datos)` — alta con email y contraseña.
- `iniciarSesion(credenciales)` — inicio de sesión con email y contraseña.
- `cerrarSesion()`.
- `obtenerSesion()` — la sesión actual, o `undefined`.

Ninguna de las cuatro lanza por un error esperado del usuario (contraseña
incorrecta, email ya registrado): devuelven un resultado explícito
(`{ ok: true, ... } | { ok: false, mensaje, campo? }`), mismo criterio que
`catalogo.ts` ya aplica para "no encontrado". `mensaje` sale de un diccionario
propio de `identidad` que traduce los `$ERROR_CODES` de Better Auth —que
vienen en inglés y pensados para desarrolladores, no para el lector final— a
mensajes en español dirigidos al usuario. Ese diccionario, y la validación
Zod de forma (formato de email, longitud mínima de contraseña) que corre
**antes** de llamar a Better Auth para poder mostrar un error de campo sin
esperar una vuelta de red, son responsabilidad del `backend-specialist` y
viven dentro de `src/identidad/`, nunca duplicados en la capa web.

**La única excepción real a "la capa web le pide al módulo":** el botón
"Continuar con Google" no pasa por `identidad.ts`. Dispara el cliente de
Better Auth (`authClient.signIn.social({ provider: "google" })`) desde un
componente de cliente chico, que redirige el navegador y vuelve por la Regla
3. Es una excepción **narrow** y nombrada, no una grieta en la regla de
límite del ADR 0002: el flujo OAuth es, por naturaleza, una coreografía de
varios saltos del navegador que ninguna función de servidor puede mediar
sola, y es exactamente el problema que el cliente de Better Auth existe para
resolver. Todo lo que sí puede resolverse con una llamada de servidor
—alta, login con contraseña, cierre de sesión, lectura de la sesión actual—
pasa por `identidad.ts`, sin excepción.

### Regla 5 — Llegan las primeras Server Actions

El ADR 0016 preveía que la primera Server Action llegara con la propuesta de
moderación. Esta rebanada la adelanta: `registrarse` e `iniciarSesion` con
contraseña son mutaciones y se invocan como Server Actions desde el
formulario de login/registro. Se agrega el plugin `nextCookies()` a la
configuración de Better Auth (último de la lista de plugins, según su propia
documentación) para que las cookies de sesión que la librería fija se
propaguen solas en ese contexto.

## Motivo

Aplicando la regla de la puerta del proyecto a cada pieza nueva:

**¿Por qué Better Auth y no rodar autenticación propia (Alternativa D)?**
Porque el problema que resolvería escribirla a mano —tener control total—
no está doliendo hoy, y el costo es concreto y permanente: hasheo de
contraseñas, gestión de sesión y el protocolo OAuth de Google son tres
superficies de seguridad que hay que mantener correctas para siempre, no
escribir una vez. Una librería mantenida y con adaptador nativo para el
Drizzle/PostgreSQL que el proyecto ya eligió (ADR 0005, ADR 0006) resuelve el
mismo problema sin ese costo.

**¿Por qué no un proveedor administrado (Alternativa C)?** Porque mueve a los
usuarios fuera del monolito modular que el ADR 0002 eligió explícitamente
para no pagar "dos proyectos, dos deploys, el modelo duplicado" — un
proveedor externo es exactamente esa duplicación, con el agravante de que acá
se trata de la tabla más sensible del sistema.

**¿Por qué ningún puerto de persistencia propio?** Mismo criterio que el ADR
0018: una interfaz con una sola implementación real es la capa vacía que el
proyecto evita a propósito, y acá la variabilidad ya la resuelve Better Auth
mismo —cambiar de PostgreSQL a otro motor el día de mañana es cambiar el
argumento de `drizzleAdapter`, no reescribir `identidad.ts`—.

**¿Por qué no verificación de email ni recuperación de contraseña en esta
rebanada?** Las dos requieren enviar correo saliente, que hoy no existe en el
stack: ni proveedor (Resend, Postmark, SES...), ni configuración, ni
variables de entorno. Introducirlo ahora, para dos flujos que el usuario no
pidió, sería exactamente la infraestructura sin necesidad presente que el
principio de arquitectura del proyecto prohíbe. Queda como decisión
pendiente, no como omisión silenciosa: ver la entrada nueva en
`docs/decisiones-pendientes.md`.

Verificado contra la documentación oficial de Better Auth (vía Context7,
`/better-auth/better-auth`): la configuración de `emailAndPassword` y
`socialProviders.google`, el adaptador de Drizzle (`drizzleAdapter`, con
`schemaName` para un esquema de PostgreSQL propio si hiciera falta más
adelante), la generación de esquema por CLI, el handler
`toNextJsHandler(auth)` para `app/api/auth/[...all]/route.ts`, el plugin
`nextCookies()` para Server Actions, `auth.api.getSession({ headers })` para
leer la sesión del lado del servidor, y el objeto `$ERROR_CODES` del cliente
para mapear errores a mensajes propios. No verificado (queda para el
`backend-specialist` al implementar): el comportamiento exacto de
`drizzle-kit generate` cuando el esquema vive en dos archivos, y cualquier
límite de la versión concreta de Better Auth que se instale contra Next.js
16.3.4.

## Consecuencias

**Aceptamos:**
- Cinco tablas nuevas en la base (`entidad` ya existía; se suman `user`,
  `session`, `account`, `verification`) con dos convenciones de nombres
  distintas conviviendo en el mismo esquema: español para `entidad`, inglés
  para las de Better Auth. Es una inconsistencia deliberada, no un descuido
  (Regla 2).
- Una ruta HTTP nueva (`/api/auth/[...all]`) en un proyecto que hasta hoy no
  tenía ninguna — infraestructura de un tercero, no un endpoint propio.
- Las primeras Server Actions del proyecto, antes de lo que el ADR 0016
  anticipaba.
- El módulo `identidad` queda sin conectar a `progreso`: existen cuentas, pero
  todavía no hay nada que una cuenta desbloquee funcionalmente más allá de
  poder iniciar sesión. Es la consecuencia que el usuario ya aceptó al elegir
  adelantar el módulo de verdad.

**Obtenemos:**
- Login y registro reales, con dos métodos, sin tabla de usuarios propia que
  mantener ni proveedor externo que pagar.
- Mensajes de error en español, propios del producto, en vez de los códigos
  de error en inglés que Better Auth expone por defecto.
- Un módulo que respeta la regla de límite del ADR 0002 en todo lo que puede
  resolverse sin un salto de navegador, con la única excepción nombrada y
  acotada de la Regla 4.

**Deuda técnica asumida:**
- Ninguna verificación de email ni recuperación de contraseña. Un usuario que
  olvida su contraseña no tiene, hoy, forma de recuperarla sin intervención
  manual. Aceptable con cero usuarios reales; no aceptable indefinidamente.

**Riesgo abierto, no resuelto por este ADR:**
- La superficie de datos personales que este login trata es email, contraseña
  (hasheada, nunca en texto plano) y lo que Google devuelva vía OAuth (email,
  nombre, foto de perfil). La audiencia del producto arranca en los doce años
  (ADR 0012), y a esa edad se sigue siendo menor. Este ADR no determina si esa
  superficie amerita una nota de tratamiento de datos de menores, un aviso de
  privacidad específico, o si un consentimiento/aviso estándar alcanza para
  esta rebanada: es una pregunta legal y de producto que el usuario señaló
  como no resuelta explícitamente, y no la resuelve un ADR de arquitectura.
  Se documenta acá para que no quede asumida en silencio.

**Revisar si:**
- Se pide recuperación de contraseña o verificación de email: dispara la
  decisión pendiente de proveedor de envío de correo (ver
  `docs/decisiones-pendientes.md`).
- Aparece un segundo método de login más allá de email+contraseña y Google
  (otro proveedor social, *magic link*): se reevalúa si sigue alcanzando la
  configuración declarativa de Better Auth o hace falta un plugin adicional.
- La rebanada 5 (`progreso`) arranca: ahí `identidad.obtenerSesion()` se
  convierte en la pieza que resuelve la mitad de la incógnita que
  `docs/decisiones-pendientes.md` §5 seguía teniendo abierta.
