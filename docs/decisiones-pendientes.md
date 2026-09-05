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
elegir: el producto es **para chicos**, así que persistir un identificador por
navegador es una decisión sobre datos de menores, no un detalle de
implementación.

**Disparador.** El arranque de la **rebanada 5 (progreso)**. Bloquea esa
rebanada por completo: no se corta en tickets hasta que exista el ADR.

**Regla interina.** Ninguna, y es deliberado: **hasta la rebanada 5 no se
persiste nada de progreso.** Las **tarjetas** de la rebanada 3 se diseñan sin
guardar resultados. Si aparece la tentación de guardar "algo mínimo" antes de
tiempo, es señal de que el disparador ya se cumplió y toca escribir el ADR.
