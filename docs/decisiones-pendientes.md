# Decisiones pendientes

Acá vive lo que **todavía no se decidió**, a propósito.

Una decisión se posterga cuando tomarla hoy sería decidir sin información: el
caso que la va a necesitar no existe todavía, y anticiparlo es diseñar para un
problema imaginado. Pero una decisión postergada y no escrita **se decide sola
por acumulación**: la toma implícitamente el primero que escribe código que la
roza, y nadie se entera. Este archivo existe para que eso no pase.

## Qué lo distingue de un ADR

| | `docs/adr/` | Este archivo |
| --- | --- | --- |
| Contiene | Lo que **ya** se decidió | Lo que **todavía no** se decidió |
| Se escribe | Cuando la decisión se aprueba | Cuando la decisión se posterga |
| Vida | Permanente: un ADR no se borra, se supersede | Temporal: la entrada se va cuando se decide |

**Cuando el disparador de una entrada se cumple, la entrada se saca de acá y
nace un ADR.** No conviven: si hay un ADR sobre el tema, la entrada acá está de
más.

Una decisión merece una entrada acá con los mismos criterios con los que
merecería un ADR (ver [`adr/README.md`](adr/README.md)): es cara de revertir,
condiciona otras decisiones, toca el modelo de datos o de despliegue, o define
un límite entre componentes. Lo trivial y reversible no entra: el ruido le quita
valor a lo que sí importa.

## Estructura de una entrada

Cuatro cosas, y las cuatro son obligatorias:

1. **Qué está pendiente** — la pregunta, enunciada como pregunta.
2. **Por qué no se decide hoy** — qué información falta.
3. **Disparador** — el hecho concreto y observable que obliga a decidir. No una
   fecha ni una sensación: un evento que se puede reconocer cuando pasa.
4. **Regla interina** — qué rige mientras tanto, para que el vacío no se llene
   solo. Si no hay ninguna, decilo explícitamente: eso también es información.

---

## 1. Política de errores: excepciones o resultados tipados

**Qué está pendiente.** Cuando una función de módulo no puede cumplir lo que le
pidieron, ¿lanza una excepción o devuelve un resultado que representa el
fallo como un valor? Y si son las dos cosas según el caso, ¿cuál es el criterio
que las separa? La respuesta aplica a los cinco módulos, así que es una decisión
transversal, no del módulo que la enfrente primero.

**Por qué no se decide hoy.** Porque el caso que la necesita no existe. Hoy la
única validación del sistema es la de la **importación**, y ahí lanzar es la
conducta correcta y no hay tensión: contenido inválido tiene que voltear el
proceso, no devolver algo que el llamador pueda ignorar. `validarDatos` lanza
`ZodError`, y su firma está elegida a propósito para **no** fijar la política.
No hay todavía una sola entrada de usuario en el sistema, que es donde la
pregunta se vuelve real.

**Disparador.** La primera función de módulo que reciba entrada de un usuario y
necesite una rama recuperable —esto es, un fallo que la pantalla tenga que
mostrar como un mensaje en vez de como una pantalla de error—. Concretamente:
la rebanada de **moderación**, validando **propuestas**. El ADR se escribe
**antes** de esa rebanada, no durante.

**Regla interina.** *Una excepción señala un fallo del programa o del contenido,
no una decisión del usuario.* Mientras no existan decisiones de usuario, lanzar
está bien y no hay nada que envolver. El día que aparezca la primera, la regla
se agotó y hay que decidir.

---

## 2. Identidad del visitante para el progreso

**Qué está pendiente.** ¿A quién pertenece un **evento** de progreso cuando no
hay cuentas? El MVP no tiene sesión —todo el mundo es **visitante**, que según
`CONTEXT.md` no es un rol sino la ausencia de sesión—, pero el **progreso**
necesita atribuir cada evento a alguien para poder sumar **puntos** y calcular
la **liga** y las **áreas flojas**.

Las candidatas obvias van desde no persistir nada y tener el progreso en la
memoria de la pestaña, hasta un identificador anónimo en el navegador que
después haya que reconciliar con la cuenta real cuando el usuario se registre.
Cada una empuja el modelo de datos en una dirección distinta.

**Por qué no se decide hoy.** Porque depende de dos cosas que todavía no
sabemos: si el progreso tiene que sobrevivir al cierre del navegador —una
pregunta de producto, no técnica— y qué forma va a tener la cuenta cuando
llegue **identidad**. Decidirlo ahora fijaría la clave de la tabla de eventos
sin saber con qué se va a reconciliar, que es exactamente el tipo de error que
después cuesta una migración de datos.

Hay además una dimensión que no es técnica y que hay que resolver antes de
elegir: la audiencia del producto arranca a los **doce años** (ADR 0012), y a
los doce se sigue siendo menor, así que persistir un identificador por navegador
es una decisión sobre datos de menores, no un detalle de implementación.

**Disparador.** El arranque de la **rebanada 5 (progreso)**. Bloquea esa
rebanada por completo: no se corta en tickets hasta que exista el ADR.

**Regla interina.** Ninguna, y es deliberado: **hasta la rebanada 5 no se
persiste nada de progreso.** Las **tarjetas** de la rebanada 3 se diseñan sin
guardar resultados. Si aparece la tentación de guardar "algo mínimo" antes de
tiempo, es señal de que el disparador ya se cumplió y toca escribir el ADR.

**Nota del ADR 0012.** Esta entrada se escribió cuando el producto era para
chicos de ocho años, y su dimensión no técnica era el nudo del asunto. Con la
audiencia de doce en adelante **se aflojó, pero no desapareció**: el párrafo de
arriba ya está redactado con la audiencia vigente. Deja de ser el nudo de esta
decisión; no deja de ser una consideración.

---

## 3. La versión para chicos

**Qué está pendiente.** El ADR 0012 dio vuelta la audiencia y pospuso la versión
para chicos; el usuario aclaró después que va a vivir **dentro de la misma
aplicación**. El **ADR 0013 ya cerró la parte de modelo**: una entidad es una
fila con un solo slug, el registro de lectura es un parámetro de lectura y las
dos prosas viven dentro de `datos`. Lo que queda abierto es más chico y más
concreto:

1. **La forma exacta dentro de `datos`.** Dos candidatas vivas: campos paralelos
   planos (`semblanzaChicos`) u objeto anidado (`prosa: { epico, chicos }`).
2. **Quién elige el registro**: el lector con un control, o el producto por él.
3. **Si el progreso y las tarjetas se comparten** entre los dos registros o se
   separan. Una **entidad** es la misma; un **evento** de progreso sobre ella,
   no está claro.
4. **Si la identidad visual se bifurca** —«quizás otro diseño», dijo el usuario—,
   lo que reabriría la sección 8 del ADR 0008, que hoy quedó sin objeto.

**Por qué no se decide hoy.** Porque todavía falta la información que haría
elegible una de las formas. Las pantallas del catálogo ya existen —`/catalogo` y
`/catalogo/[slug]` están entregadas— y la única ficha escrita ya está en
registro épico, así que las dos premisas originales de este párrafo caducaron.
Lo que **no** caducó es el disparador: nadie pidió una ficha para chicos y hay
**una** ficha publicada, no diez. Con una sola no se sabe cuánto cuesta escribir
la prosa de una, ni si el formato aguanta a escala, que es exactamente lo que
hay que saber para elegir entre campo paralelo y objeto anidado. Elegir hoy la
forma de los **datos** y la de la navegación sin haber visto funcionar ninguna
de las dos es el error caro. El propio motivo del vuelco —«es lo más
rápido a lo inmediato»— dice que primero hay que llegar rápido a algo, y esta
decisión no está en ese camino.

**Disparador.** El primero de estos dos hechos que ocurra:

1. **Alguien pide una ficha en registro para chicos.** El usuario, un lector, o
   un ticket. En ese momento hay un caso concreto y deja de ser hipotético.
2. **Hay diez fichas publicadas en registro épico.** Con diez, ya se sabe cuánto
   cuesta escribir una, cómo se ve en pantalla y si el formato aguanta — que es
   justamente la información que hoy falta para elegir la forma.

En cualquiera de los dos casos, el ADR se escribe **antes** de redactar la
primera ficha para chicos, no durante.

**Regla interina.** La del **ADR 0013**, que es citable y verificable, más dos de
prosa:

1. **Se escribe una sola versión de cada texto, en registro épico**, con las
   reglas de la skill `voz-narrativa`.
2. **No se escribe prosa intermedia.** Un texto que intente servirle a las dos
   audiencias no le sirve a ninguna. Si un párrafo parece «más accesible», es
   señal de que se está bajando el registro, no de que se esté anticipando la
   versión para chicos.
3. **Las prohibiciones interinas del ADR 0013**: ninguna columna `registro`,
   ninguna segunda fila ni segundo slug, ningún campo `*Chicos` en el descriptor
   y ningún registro en la ruta. Preparar el terreno para una forma que todavía
   no se eligió es elegirla en silencio.

---

## 4. El contrato del módulo `aprendizaje`

**Qué está pendiente.** ¿Cuál es la interfaz del módulo `aprendizaje` (ADR
0002): qué funciones expone, con qué firmas, y qué le devuelve a la capa web
para una **tarjeta** de repaso y para una pregunta de **quiz**?

**Por qué no se decide hoy.** Porque el módulo no existe, y la información que
haría falta para diseñarlo tampoco: no está decidido cómo se arma un mazo, si el
quiz se genera desde las entidades o se cura a mano, ni qué se guarda de una
respuesta —esto último bloqueado por la entrada §2 de este mismo archivo—.

Hay además un motivo específico para escribir esta entrada, y es el que la hace
necesaria: **dos archivos de la capa web ya declaran anticipar esa firma**.
`src/app/tarjetas/tarjetas-repaso.datos.ts` y
`src/app/quiz/quiz-pregunta.datos.ts` dicen en su encabezado que su función
mock «anticipa la firma de la consulta real que algún día va a vivir en el
módulo `aprendizaje`». Nadie aprobó esa firma: el módulo no tiene dueño
asignado todavía y el `backend-specialist` no la revisó. Es exactamente la
decisión que se toma sola por acumulación —la fija el primero que escribe
código que la roza— que este archivo existe para evitar.

**Disparador.** El arranque de la rebanada de **aprendizaje**. El contrato se
diseña ahí, con el `backend-specialist`, y si merece un ADR se escribe **antes**
de la primera función del módulo, no durante.

**Regla interina.** **Los mocks no son contrato.** Cuando llegue el módulo se
diseña desde cero, mirando el problema y no los dos archivos de la capa web; si
la firma que sale es distinta, la que se cambia es la de las pantallas. Mientras
tanto, ningún archivo nuevo puede citar a `obtenerMazoDeRepaso` ni a
`obtenerQuizMock` como si fueran la interfaz del módulo, y un `*.datos.ts` nuevo
que anticipe una firma tiene que decir en su encabezado que es simulada.

---

## 5. El puerto de salida del módulo `catalogo`

**Qué está pendiente.** ¿Debería `catalogo` declarar una interfaz de
persistencia que Drizzle implemente por detrás —el puerto de salida que el ADR
0016 dejó explícitamente afuera de su alcance—, o seguir importando `db`
directo como hace hoy?

**Por qué no se decide hoy.** El ADR 0018 resolvió esta pregunta por ahora:
**se pospone**. Hoy hay una sola tabla (`entidad`), un solo motor
(PostgreSQL/Drizzle) y ningún segundo adaptador de persistencia a la vista. Una
interfaz con una sola implementación real es la capa vacía que el propio
ADR 0016 advirtió que hay que evitar, y el beneficio concreto que se nombra a
favor —probar el módulo sin Postgres levantado— no está doliendo: las pruebas
de `catalogo.test.ts` corren rápido contra Docker, que ya es un prerrequisito
del flujo de desarrollo, y no existe todavía un pipeline de CI que se
beneficie de evitarlo.

**Disparador.** El primero de estos hechos que ocurra:

1. **Aparece un segundo adaptador de persistencia real** para algún módulo del
   catálogo —otro motor, una réplica, un caché delante de Postgres— y no uno
   hipotético.
2. **Aparece un pipeline de CI** y levantar Postgres ahí resulta costoso o
   inestable de forma medida, no supuesta.
3. **El tiempo de las pruebas del módulo se vuelve doloroso de forma medible**
   a medida que `catalogo` (u otro módulo) crece en funciones y pruebas.

En cualquiera de los tres casos, el ADR que reabra la pregunta se escribe
**antes** de introducir el puerto, no durante, y puede resolver que la interfaz
se agregue solo al módulo afectado, no a los cinco por igual.

**Regla interina.** `catalogo.ts` sigue con Drizzle directo (ver ADR 0018). Un
módulo nuevo (`moderacion`, `aprendizaje`, `progreso`, `identidad`) que se
diseñe mientras esta entrada siga abierta hace lo mismo: importa `db` directo,
sin anticipar una interfaz de persistencia por si acaso.

## 6. Proveedor de envío de correo, para verificar email y recuperar contraseña

**Qué está pendiente.** ¿Con qué proveedor se envía el correo saliente que
necesitan la verificación de email y la recuperación de contraseña del módulo
`identidad` (ADR 0019), y con qué configuración?

**Por qué no se decide hoy.** El ADR 0019 dejó las dos funcionalidades
explícitamente fuera de la primera rebanada de `identidad`: ninguna de las dos
tiene un caso de uso presente —cero usuarios reales todavía— y las dos
necesitan una pieza que hoy no existe en el stack en absoluto, un proveedor de
envío de correo (Resend, Postmark, SES, u otro), con su propia cuenta,
credenciales y configuración de dominio. Elegir uno ahora, sin un flujo
concreto que lo use, sería exactamente la infraestructura anticipada que el
principio de arquitectura del proyecto prohíbe.

**Disparador.** El primero de estos hechos que ocurra:

1. Se pide recuperación de contraseña como funcionalidad (`sendResetPassword`
   de Better Auth deja de ser un callback sin implementar).
2. Se pide requerir email verificado antes de dejar entrar a un usuario
   (`requireEmailVerification` pasa de `false` a `true` en la configuración de
   `identidad`).
3. Aparece cualquier otra necesidad de enviarle correo a un usuario —una
   notificación de moderación, por ejemplo— que independientemente ya
   obligaría a elegir un proveedor.

**Regla interina.** `emailAndPassword.requireEmailVerification` queda en
`false` y no se implementa `sendResetPassword`. Un usuario que pierde su
contraseña no tiene, hoy, forma de recuperarla sin intervención manual del
usuario del proyecto contra la base. Es la deuda técnica que el ADR 0019 ya
declaró aceptada.

---

## 7. El alcance del agente de testing previsto

**Qué está pendiente.** Cuando llegue el agente de testing, que ya está previsto
como quinto especialista del nivel 3 (ver `CLAUDE.md`), ¿escribe él las
pruebas, o cada dueño de área sigue escribiendo las de lo suyo y él las revisa?
Y en cualquiera de los dos casos, ¿qué herramientas y qué dobles puede traer al
proyecto?

**Por qué no se decide hoy.** El agente no existe, y las pocas pruebas que hay
las escribió el dueño de cada área sin fricción observable. Con ese volumen no
hay evidencia de cuál de las dos formas conviene. Lo que sí apareció en la
auditoría de agentes de septiembre de 2026 son tres límites que, si no se
escriben ahora, el agente podría cruzar sin darse cuenta el día que llegue.
Esos límites no deciden la pregunta de arriba: acotan cualquier respuesta.

**Disparador.** Se crea el archivo del agente de testing en `.claude/agents/`.
El ADR que lo define se escribe **antes** de crearlo, y nace con estos tres
límites. Si pretende cambiar alguno, lo tiene que justificar ahí mismo.

**Regla interina.** Cada especialista escribe las pruebas de su área, y el
`delivery-specialist` lista en su informe de cierre cada criterio de aceptación
del ticket: los verificados, con el comando o la prueba que los cubre, y los
que quedan «a verificar por el usuario». A esto se suman tres límites que
también van a regir para el agente cuando llegue:

1. **Sin dobles de la base.** Las pruebas de los módulos corren contra
   PostgreSQL real en Docker. El ADR 0018 pospuso el puerto de salida
   apoyándose justamente en eso. Un doble en memoria de `db` reabriría el
   ADR 0018 por la puerta de atrás, sin su disparador (entrada 5).
2. **Sin Testing Library ni navegador.** No se agregan hasta que una pantalla
   concreta tenga un comportamiento que solo se pueda verificar así, y hoy
   ninguna lo tiene. Esa dependencia nueva pasa por la regla de la puerta del
   arquitecto, como cualquier otra.
3. **Las pruebas de la guarda del destino y de las migraciones siguen siendo
   del `database-specialist`**, porque verifican una invariante de la base
   (ADR 0023), no un comportamiento de producto.
