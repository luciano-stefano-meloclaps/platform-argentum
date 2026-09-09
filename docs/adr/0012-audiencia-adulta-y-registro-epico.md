# 0012 — Audiencia de chicos grandes y adultos, con registro épico

- **Estado:** Aceptado
- **Fecha:** 2026-09-09
- **Decide:** el usuario

## Decisión

El producto pasa a estar dirigido a **chicos grandes y adultos**, con una prosa
**épica de registro alto** —escenario dramático, período amplio, léxico rico y
metáfora sostenida—, que es la de las muestras que entregó el usuario y que están
versionadas en `.claude/skills/voz-narrativa/muestras.md`. La **versión para
chicos no se cancela: se pospone** como alcance futuro dentro de este mismo
proyecto, con otra lengua y quizás otro diseño.

Se propone fijar el piso de edad en **doce años**. Ese número es la única parte
de esta decisión que sale del arquitecto y no del usuario; ver *Decisión
elegida*.

## Contexto

Hasta hoy, el producto se describía en `CONTEXT.md`, en `README.md` y en
`CLAUDE.md` como «una aplicación web para que los chicos aprendan sobre
Argentina». Toda la documentación se escribió sobre esa premisa, y en varios
lugares el argumento **cuelga literalmente de la edad**: el ADR 0008 justifica su
piso de contraste y su cuerpo de 16px con «lo usan chicos de ocho años en
pantallas malas», y el `frontend-specialist` abre declarando que si algo es
elegante pero un chico de ocho años no lo entiende, está mal.

El estado del árbol al momento de decidir: existe **una sola** ficha de contenido
real, la de `contenido/procer/manuel-belgrano.ts`, escrita a propósito en
registro llano. No hay ninguna pantalla de catálogo construida, y ninguno de los
cinco módulos existe todavía. El rol de narrador —el agente
`narrative-specialist` y la skill `voz-narrativa`— se había creado ese mismo día,
calibrado contra el registro llano.

El usuario entregó dos muestras de prosa escritas por él —Almirante Brown y Julio
César, con un *Contexto Político-Social-Cultural* y una *Semblanza* cada una— en
registro adulto: latinizante, de período largo y con metáfora sostenida. La
decisión inmediatamente anterior había resuelto la contradicción entre esas
muestras y la audiencia infantil **a favor de la audiencia**: se conservaba lo
que las muestras hacían y se descartaba cómo lo decían.

El usuario dio vuelta esa resolución. Sus palabras: *«el lenguaje va a ser el que
te pase ahora, épico, con un escenario dramático… va a ser para chicos grandes y
adultos, una narrativa rica en metáforas y elementos de la lengua para darle peso
y emoción a los escritos. Eso por un lado; ahora la idea es tener dentro de este
proyecto una versión más para chicos y ahí sí cambiar a otra lengua, quizás otro
diseño. Damos vuelta el volante para hacerlo para grande ya que es lo más rápido
a lo inmediato.»*

## Problema

La audiencia no es una preferencia de estilo: es la premisa de la que cuelgan el
registro de la prosa, la tipografía, el tono de los errores y buena parte de las
justificaciones ya escritas. Cambiarla en una conversación y no registrarla
produce dos daños concretos:

1. **Documentación que se contradice sin que se note.** `CLAUDE.md` decía
   textualmente que el registro «está resuelto y no se reabre», y la skill
   `voz-narrativa` prohibía por escrito el léxico latinizante que ahora es el
   material de la voz. Cualquier agente que leyera esos archivos iba a rechazar
   el texto nuevo citando una regla vigente.
2. **Una decisión de producto disfrazada de decisión de redacción.** Escribir la
   versión para chicos «más adelante» sin escribir cuándo ni con qué regla
   interina es exactamente el caso que `docs/decisiones-pendientes.md` existe
   para evitar: la decisión se toma sola por acumulación, la toma el primero que
   escriba una ficha, y nadie se entera.

## Alternativas consideradas

### A. Sostener el registro llano y destilar las muestras

Lo decidido el día anterior: conservar de las muestras lo que hacen —el escenario
que abre, la metáfora madre, el retrato probado con una anécdota— y dejar afuera
el léxico y el período largo. Un solo producto, para chicos.

### B. Dos registros conviviendo en la misma ficha

Un campo en registro alto para el adulto que acompaña y otro llano para el chico,
en la misma página.

### C. Registro épico ahora, versión para chicos pospuesta

Dar vuelta la audiencia inmediata a chicos grandes y adultos, adoptar las
muestras como destino literal, y registrar la versión para chicos como alcance
futuro con su disparador.

### D. No hacer nada / posponer

Seguir escribiendo con la regla vigente hasta tener más fichas y decidir con más
información.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | Toda la documentación ya escrita sigue siendo cierta; cero trabajo de corrección; el piso de legibilidad del ADR 0008 conserva su justificación | **Contradice lo que el usuario quiere del producto**, que es el único insumo que no se puede sustituir con un argumento; la prosa que sabe escribir y disfruta escribir queda prohibida por una regla nuestra | Bajo hoy, alto con veinte fichas escritas |
| B | Nadie pierde; el material adulto se aprovecha tal cual | Una ficha es **una página que lee una persona**: un párrafo adulto en el medio de un texto para chicos es peor que cualquiera de los dos registros solos; duplica el trabajo de redacción por ficha y obliga a decidir cuál se muestra primero | Medio: hay que borrar la mitad de cada ficha |
| C | Es lo que el usuario decidió; el material de referencia **ya existe** y no hay que inventar una voz; es lo más rápido a lo inmediato, que es el criterio que él puso; libera la tensión del ADR 0008 entre la marca «no infantil» y el lector infantil | Obliga a reescribir tres artefactos recién hechos, una ficha publicada y varias premisas de documentación; deja desactualizado el criterio de aceptación del ticket #30; el argumento de legibilidad del ADR 0008 pierde su premisa | Bajo: hay **una** ficha escrita y ninguna pantalla de catálogo |
| D | No se tira trabajo | La regla vigente prohíbe explícitamente lo que el usuario acaba de pedir: seguir es escribir contra la decisión del dueño del producto | — |

## Decisión elegida

**La alternativa C**, con este alcance:

1. **La audiencia inmediata es chicos grandes y adultos.** El piso de edad
   propuesto son **doce años**.
2. **La voz es la de las muestras, tal cual.** No se destila, no se modula y no
   se baja de tono. Las reglas verificables —ritmo, léxico, metáfora, estructura—
   viven en la skill `voz-narrativa` y están **calibradas contando las cuatro
   muestras**, no estimadas.
3. **El único campo donde el registro baja es el `resumen`** de una ficha, porque
   no es narración: es una etiqueta de listado.
4. **La versión para chicos queda pospuesta**, con su entrada en
   `docs/decisiones-pendientes.md`, su regla interina y su disparador. **No se
   escribe una prosa intermedia** que intente servirle a las dos audiencias.
5. **Este ADR no supersede a ninguno.** Ver abajo.

Sobre el piso de doce años: **es lo único de esta decisión que propone el
arquitecto**. El usuario dijo «chicos grandes y adultos», que es una audiencia
real pero no verificable, y una regla de lengua no puede medirse contra una
audiencia difusa. Doce sale de lo que las muestras exigen: sostener una
subordinación de tres grados, entender vocabulario abstracto sin ilustración
—*soberanía*, *emancipación*, *proscripciones*— y traer del colegio un piso de
referencias históricas. Eso es lectura de secundaria. **El usuario lo confirma o
lo corrige**, y corregirlo no cambia nada del resto de este ADR: solo mueve un
número en la sección 1 de la skill.

### Qué supersede, y qué no

**No supersede a ninguno de los once ADR anteriores.** Lo que hace es **cambiar
una premisa** que tres de ellos usaban, y conviene ser explícito para no tirar
trabajo válido:

- **ADR 0004 (contenido en archivos versionados): intacto.** Su decisión no
  depende del lector. El riesgo que declara —volumen de redacción, exactitud
  histórica y derechos de imagen— **sigue siendo el riesgo número uno del
  proyecto** y no cambia con la audiencia; si acaso, la exactitud pesa más ante
  lectores adultos. Lo único que quedó viejo es la aposición «material educativo
  para chicos» de su sección *Contexto*. **No se edita el ADR 0004**: la
  corrección vive acá.
- **ADR 0009 (formato del contenido curado): intacto, y sin una sola frase que
  corregir.** Nunca menciona al lector; habla del redactor y de su perfil
  técnico. La prosa sigue viviendo en *template literals* de TypeScript.
- **ADR 0008 (identidad visual): sus valores siguen vigentes, su justificación
  cambia.** Los seis pares de contraste corregidos, el peso 700 de Cormorant
  Garamond y la carga con `next/font/google` **no se tocan**: el piso WCAG AA no
  lo fija la edad del lector, y su coartada real —«pantallas baratas, con brillo
  bajo y a veces al sol»— ya está escrita ahí y sobrevive entera. Lo que pierde
  su objeto es su **sección 8**, que existía para reconciliar la marca
  «transversal, no infantil» con un lector infantil: esa tensión **desapareció**,
  y ahora la marca y el producto están alineados. El cuerpo de 16px con
  interlineado 1,75 y líneas de 58–62 caracteres **se sostiene mejor que antes**,
  porque un texto épico es más denso y más largo que uno llano; lo que cambia es
  el argumento, no el número. **No se edita el ADR 0008**; se revisa si el
  rediseño llega a moverlo.
- **ADR 0001, 0002, 0003, 0005, 0006, 0007 y 0011: sin efecto.** Sus argumentos
  usan al chico como ilustración —«el chico ve un 500 donde correspondía un
  404»—, no como premisa.

## Motivo

**Porque la audiencia es del dueño del producto y no se gana con un argumento.**
La decisión anterior era defendible y estaba bien fundada, pero fundaba sobre una
premisa —«el producto es para chicos»— que el usuario acaba de cambiar. Un
arquitecto puede discutir cómo se construye algo; para quién se construye lo
decide quien lo hace.

**Porque el criterio que él puso es la velocidad, y acá se cumple de verdad.** El
material de referencia **ya existe**: hay dos muestras escritas, con dos items
por personaje, y una voz reconocible. Escribir para adultos con esa referencia es
copiar un registro que está delante; escribir para chicos exige inventar una voz
que todavía no está escrita en ningún lado. La alternativa C es la que menos
trabajo nuevo pide para producir la primera ficha buena.

**Porque el momento es el correcto y no se va a repetir.** Hay **una** ficha
escrita y **ninguna** pantalla de catálogo. El costo de dar vuelta el registro
hoy es reescribir un texto y tres archivos de configuración; con veinte fichas
publicadas es un proyecto de reescritura editorial. Este es el mismo argumento
por el que la severidad del compilador se fijó el día cero (ADR 0007): hay
decisiones que cuestan cero ahora y no se toman nunca más tarde.

**Y la alternativa B se descarta por una razón sola, que vale escribir.** Una
ficha no es un documento con secciones para lectores distintos: es una página que
lee una persona. Poner un párrafo de registro alto en el medio de un texto llano
no le sirve al chico, que lo saltea, ni al adulto, que ya se fue. Dos audiencias
piden **dos productos**, y por eso la versión para chicos se pospone entera
—lengua y diseño— en vez de mezclarse.

## Consecuencias

**Aceptamos:**

- **Hay que reescribir la semblanza de `contenido/procer/manuel-belgrano.ts`.**
  Es la única ficha publicada y está en el registro viejo: es cronología en vez de
  retrato, no tiene metáfora madre y cierra hablándole al lector en primera del
  plural. Conserva una sola cosa, y es la mejor: prueba con hechos y no con
  adjetivos.
- **El criterio de aceptación del ticket #30 quedó falso.** Dice «redactado para
  chicos, con el vocabulario de `CONTEXT.md`». **Este ADR no corrige el tracker**
  —no es del arquitecto—: la corrección la lleva el usuario al
  `delivery-specialist`.
- **Perdemos, por ahora, al lector que motivó el proyecto.** Un chico de ocho o
  diez años no va a poder leer estas fichas. Es el costo explícito de la decisión
  y el motivo por el que la versión para chicos se registra como pendiente en vez
  de desaparecer.
- **Un riesgo nuevo, y es el serio: el registro alto hace verosímil lo falso.**
  Una fecha inventada dentro de un período bien armado se lee como un dato de
  manual. La prohibición de inventar un hecho, que ya existía, **pesa más ahora
  que antes**, y por eso el `narrative-specialist` sigue sin `WebFetch` ni
  `WebSearch`: los hechos los entrega el usuario.
- **Documentación que queda vieja y no se corrige en este pasaje.** El `README.md`
  y las secciones de audiencia del `frontend-specialist`, del `ui-reviewer`, del
  `brand-specialist` y de la skill `revision-de-ui` siguen diciendo «lo usan
  chicos de ocho años». Sus **requisitos** sobreviven —contraste AA, objetivos
  táctiles, `prefers-reduced-motion`, el color como no-único portador de
  significado—; lo que envejeció es la justificación. Corregirlo toca el área de
  frontend y de marca, y **no se hace acá**.

**Obtenemos:**

- **Una voz que existe y se puede copiar**, en vez de una que había que inventar.
- **Reglas verificables**: las cuatro muestras se contaron, y de ahí salen la
  media de 22 a 42 palabras por oración, el techo de 55 y la cadencia de una
  oración corta cada cinco. Se cuentan, no se estiman.
- **La marca y el producto alineados.** El sistema de diseño declara un
  territorio «transversal a todas las edades, no infantil», y hasta hoy convivía
  a la fuerza con un lector de ocho años.
- **Una decisión pendiente que se destraba de paso.** La entrada 2 de
  `docs/decisiones-pendientes.md` —la identidad del visitante para el progreso—
  estaba bloqueada en parte por una dimensión que no era técnica: persistir un
  identificador por navegador era una decisión sobre **datos de menores**. Con
  audiencia adulta esa dimensión se afloja. No desaparece —chicos grandes de doce
  siguen siendo menores— pero deja de ser el nudo.

**Deuda técnica asumida:**

- **El campo `contexto` sigue sin existir** en el descriptor de `procer`, y con
  esta voz pasó de conveniente a estructural: en las dos muestras el escenario
  ocupa tanto lugar como el retrato y es el que instala el tono. Mientras no
  exista, el contexto se escribe y se entrega aparte, **nunca fundido dentro de
  `semblanza`**. Agregarlo no cuesta migración —los **datos** son JSONB y el
  descriptor vive en código (ADR 0001)—: cuesta un ticket.
- **El número 0010 está quemado.** Existió un `0010-agentes-pueden-escribir-en-vercel-con-confirmacion.md`,
  se borró, y no quedó nota en el índice. Por eso este ADR es el 0012 y no el
  0011. Es un hallazgo lateral, no una consecuencia de esta decisión.

**Revisar si:**

- **El usuario corrige el piso de doce años.** Es lo único que espera
  confirmación.
- **Aparece el disparador de la versión para chicos**, que está escrito en
  `docs/decisiones-pendientes.md`. Ese día nace un ADR nuevo, no una excepción a
  este.
- **El rediseño visual empieza a moverse.** Si la audiencia adulta empuja la
  interfaz hacia otro lado, se revisa la sección 8 del ADR 0008 —no sus valores—
  con un ADR nuevo.
- **La prosa épica no sobrevive al formato de la ficha.** Si al construir la
  pantalla resulta que doscientas palabras de contexto más trescientas de
  semblanza no se leen en pantalla, el problema es de diseño y no de voz, pero
  hay que mirarlo antes de escribir veinte fichas.
