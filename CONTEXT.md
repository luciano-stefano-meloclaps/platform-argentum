# platform-argentum

Aplicación web para que los chicos aprendan sobre Argentina: un catálogo de
contenido curado con tarjetas de repaso, un quiz y un panel de progreso.

Este archivo define el **vocabulario del proyecto**. Usá estos términos exactos
en el código, en los commits, en los tickets y en la interfaz. Cuando hay varias
palabras para un mismo concepto, elegimos una y las demás quedan bajo _Evitar_.

Las decisiones que explican *por qué* el dominio está modelado así viven en
[`docs/adr/`](docs/adr/).

## Catálogo

**Entidad**:
La unidad de contenido del catálogo: un prócer, un monumento, un animal, una
fecha patria. Todas viven en una sola tabla, distinguidas por su tipo.
_Evitar_: item, registro, elemento, artículo, contenido

**Tipo**:
La clase a la que pertenece una entidad y que determina qué campos tiene. El
conjunto de tipos no está cerrado: agregar uno es una operación barata y
esperada.
_Evitar_: categoría, clase, modelo, colección

**Descriptor**:
La definición en código —un esquema Zod— de los campos que tiene un tipo. Es la
fuente única que tipa la columna, valida la importación, valida las propuestas y
renderiza tanto el formulario como la ficha.
_Evitar_: esquema, schema, metadata, definición

**Datos**:
El objeto JSONB de una entidad, con los campos propios de su tipo. Su forma la
dicta el descriptor, no la base.
_Evitar_: atributos, propiedades, payload, campos extra

**Ficha**:
La página que muestra una entidad completa a un lector.
_Evitar_: detalle, página de detalle, perfil, vista

**Contenido curado**:
El que escribe el equipo en archivos versionados del repositorio, por oposición
a lo que proponen los usuarios.
_Evitar_: contenido oficial, contenido base, seed

## Moderación

**Propuesta**:
El pedido de un usuario para dar de alta, modificar o dar de baja una entidad.
Queda pendiente hasta que un admin la resuelve; **nada se publica sin
aprobación**.
_Evitar_: sugerencia, cambio, edición, solicitud, request

**Aprobar** / **Rechazar**:
Las dos únicas resoluciones posibles de una propuesta. Una propuesta resuelta se
conserva: el historial de propuestas *es* la auditoría del catálogo.
_Evitar_: aceptar, denegar, descartar

## Aprendizaje

**Tarjeta**:
Unidad de repaso con una pregunta de un lado y la respuesta del otro.
_Evitar_: flashcard, card, ficha (que es otra cosa)

**Quiz**:
La partida de preguntas con opciones, individual y sin competencia contra otros
usuarios.
_Evitar_: juego, kahoot, trivia, test, examen

**Distractor**:
Cada opción incorrecta de una pregunta del quiz. Se toma de otras entidades del
mismo tipo, por eso las preguntas no se redactan a mano.
_Evitar_: opción falsa, respuesta incorrecta, señuelo

## Progreso

**Evento**:
El registro de una actividad resuelta: qué entidad, qué tipo de actividad, si se
acertó y cuándo. Es lo único que se persiste del progreso; todo lo demás se
deriva de acá.
_Evitar_: resultado, intento, respuesta, log, historial

**Puntos**:
La suma derivada de los eventos. No se guarda un total: se calcula al leer.
_Evitar_: score, puntaje, créditos

**Liga**:
La franja fija en la que caen los puntos de un usuario —de 0 a 1000, bronce, y
así—. **No se sube ni se baja, y no se compite con nadie.** Es una función pura
del total de puntos.
_Evitar_: nivel, rango, ranking, emblema, medalla, insignia

**Área floja**:
Un tipo o tema en el que la tasa de acierto del usuario es baja. Se calcula
agrupando eventos.
_Evitar_: debilidad, punto débil, materia pendiente

## Identidad

**Usuario**:
Quien tiene sesión iniciada. Los roles son `usuario`, `admin` y `superadmin`.
_Evitar_: cuenta, miembro, jugador

**Visitante**:
Quien usa la aplicación sin sesión. **No es un rol: es la ausencia de sesión.**
En el MVP todo el mundo es visitante, porque todavía no hay cuentas.
_Evitar_: invitado, anónimo, guest, usuario no registrado

## Datos y despliegue

**Importación**:
El paso que lleva el contenido curado desde los archivos versionados a la base
de datos. Valida cada ficha contra el descriptor de su tipo y falla si no cumple.
_Evitar_: migración (reservado para el esquema), carga, seed, sincronización

**Migración**:
Un cambio de esquema de la base, generado por drizzle-kit y versionado como SQL.
Nunca se usa esta palabra para el contenido.
_Evitar_: usarla para la importación

## Trabajo

**Rebanada**:
Una unidad de trabajo que atraviesa todas las capas —datos, módulo, pantalla— y
termina desplegada y usable por sí sola. El proyecto avanza por rebanadas, no
construyendo primero "todo el backend".
_Evitar_: sprint, fase, tarea, capa, milestone

**Módulo**:
Cada una de las cinco piezas lógicas del sistema: `catalogo`, `moderacion`,
`aprendizaje`, `progreso` e `identidad`. La capa web no consulta la base de
datos: le pide al módulo.
_Evitar_: servicio, componente, capa, dominio
