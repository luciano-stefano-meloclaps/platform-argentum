# 0014 — Historiador especialista y neutralidad en disputas políticas

- **Estado:** Aceptado
- **Fecha:** 2026-09-09
- **Decide:** el usuario

## Decisión

Se crea un cuarto agente del **equipo de backend**, `historiador-specialist`,
dueño de **investigar y contrastar entre varias fuentes** los hechos de una
ficha antes de que el `narrative-specialist` los narre. Es una fuente
**adicional**, no un reemplazo: el material que el usuario aporte directamente
sigue siendo válido y sigue siendo la referencia cuando existe.

Se agrega además una regla nueva a la voz del catálogo —**neutralidad ante
disputas políticas en interpretación histórica**— acotada a un puñado de temas
concretos de la historia argentina donde existe una disputa política vigente
sobre cómo calificar un hecho, no sobre si el hecho ocurrió. La regla no
suaviza los hechos duros: exige narrarlos sin eufemismo y agregar, cuando
corresponde, un contrapunto breve que reconozca la interpretación en disputa sin
tomar partido.

Este ADR **extiende** el ADR 0012 (no lo supersede) y **reinterpreta, sin
editarlo**, un supuesto del ADR 0004. Ver la sección *Qué extiende, y qué no*.

## Contexto

El estado del árbol al momento de decidir: existe una ficha publicada
(`contenido/procer/manuel-belgrano.ts`, pendiente de reescritura por el ADR
0012) y el `narrative-specialist` con su skill `voz-narrativa`, creados el mismo
día que el ADR 0012. El modelo vigente hasta hoy es simple y está escrito en dos
lugares: el ADR 0004 declara que la exactitud histórica es *"el riesgo número
uno del proyecto"* y la resuelve así — *"lo cargo yo, desde cero"*, dijo el
usuario—; y el `narrative-specialist` no tiene `WebFetch` ni `WebSearch` a
propósito, para que la prosa nunca pueda sonar verdadera sobre un hecho que
nadie verificó.

El usuario pidió tres cosas sobre cómo se produce esa prosa:

1. Que quien investiga los hechos tenga **expertise en historia argentina**.
2. Que los hechos políticamente disputados se sostengan en **fuentes múltiples
   y contrastadas**, porque —textual— *"Argentina es un país sumamente
   politizado"* y una sola fuente no alcanza para esos casos.
3. Contar la historia **sin juzgar ideológicamente**, mantenido el juicio de
   actos concretos de una persona, que la skill ya permite.

Sobre el punto 2 se presentó al usuario la tensión real: darle acceso a
internet al mismo agente que narra reintroduce el riesgo que la restricción
original evitaba —*"prosa excelente alrededor de un hecho falso… nadie lo
nota, porque suena bien"*—, agravado porque ahora el agente buscaría
activamente en fuentes de calidad desigual. El arquitecto propuso separar
investigar de narrar; el usuario aceptó esa dirección y dejó en manos del
arquitecto la forma técnica exacta —un agente con una o dos skills— con una
condición sola: **el `backend-specialist` es solo código, nunca contenido ni
investigación histórica**, y el `narrative-specialist` sigue siendo quien
escribe en `contenido/`.

Sobre el punto 3, el usuario acotó el alcance con ejemplos concretos —ver
*Decisión elegida*, sección de neutralidad— y fue explícito en una distinción
que hay que sostener: *"mi idea es contar la verdad aunque sea dura"*. Se
puede narrar que **Montoneros fue una organización guerrillera** —es un hecho
que pasó—; lo que la regla nueva prohíbe es tomar partido en la **disputa
política vigente sobre cómo calificar** un hecho como la Campaña del Desierto,
no en si el hecho ocurrió. El usuario también fue explícito sobre su propia
mirada —*"más patria y más nacionalista"*, que valora el sacrificio y la
sangre derramada por el crecimiento del país— y pidió expresamente que esa
mirada **no se traduzca en prosa favorable a un lado u otro** de una disputa
concreta.

El usuario aportó además un párrafo propio, sobre San Martín cruzando los
Andes, como muestra de la prosa que él mismo redacta y espera que el catálogo
sostenga. No es material de este ADR —la evaluación de si entra a
`muestras.md` es del `narrative-specialist`—, pero es evidencia de que la voz
épica del ADR 0012 sigue siendo la que el usuario quiere, con o sin esta
decisión.

## Problema

Dos problemas distintos, que conviene no confundir aunque lleguen juntos:

**Problema 1 — de dónde salen los hechos.** El modelo vigente asume que el
usuario cura todo el material antes de entregarlo. Eso sigue siendo cierto para
la mayoría del catálogo —el propio usuario acotó que *"los padres de la
patria"* no tienen tanta polémica real—, pero para un puñado de temas
concretos hace falta contrastar entre varias fuentes, y eso es un trabajo de
historiador que hoy no hace nadie en el sistema: ni el usuario está obligado a
hacerlo solo, ni el `narrative-specialist` puede hacerlo sin dejar de ser
narrador.

**Problema 2 — cómo se narra un hecho en disputa.** Aun con los hechos ya
contrastados, alguien tiene que decidir cómo se escribe una interpretación que
está políticamente en disputa sin que la prosa —que es persuasiva por
diseño, ver ADR 0012— termine sonando a que el catálogo tomó partido.

## Alternativas consideradas

### Para el problema 1 — quién investiga

**A. Dárselo al `narrative-specialist`.** Agregarle `WebFetch`/`WebSearch` a su
lista de herramientas actual.

**B. Dárselo al `backend-specialist`.** Ya es dueño de `contenido/` y de la
importación; podría investigar antes de convocar al narrador.

**C. Agente nuevo, `historiador-specialist`, en el equipo de backend.** Separa
investigar de narrar; entrega un dossier de hechos contrastados, nunca prosa.

**D. No hacer nada.** El usuario sigue curando todo el material él mismo,
como hasta hoy.

### Para la estructura del agente nuevo (si se elige C) — una skill o dos

**C1. Una sola skill**, `investigacion-historica`, que cubre metodología de
búsqueda y contraste **y** el criterio para detectar cuándo un tema entra en
la lista de disputas políticas.

**C2. Dos skills bajo el mismo agente**: `investigacion-historica` para la
metodología general, y una segunda, `fuentes-en-disputa`, exclusiva para el
criterio de qué cuenta como disputa política y cómo documentarla en el
dossier.

**C3. Una skill para el historiador (`investigacion-historica`, con el
criterio de detección incluido) y una extensión de `voz-narrativa`** —no una
skill nueva— para la regla de **cómo se narra** un hecho ya flaggeado como en
disputa.

### Para el problema 2 — cómo se escribe la neutralidad

**E. Nueva skill independiente de `voz-narrativa`**, citada tanto por el
historiador como por el narrador.

**F. Sección nueva dentro de `voz-narrativa`**, junto a la sección 6
(*Prohibiciones de contenido*), que ya gobierna «no se juzga a pueblos ni
naciones» y «las sombras se cuentan, con dureza si corresponde» — la nueva
regla es un vecino directo de esas dos, no un tema aparte.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A (narrador con internet) | Un agente menos; cero coordinación nueva | Reintroduce el riesgo que la restricción original evitaba, exactamente cuando el tema es más sensible; investigar y narrar en el mismo turno no deja un punto donde revisar "¿esto es hecho o postura?" antes de que quede envuelto en metáfora | Bajo hoy, pero repetible cada vez que aparezca un tema sensible |
| B (backend investiga) | No agrega un agente; backend ya orquesta a narrative-specialist | Contradice lo que el usuario pidió explícitamente: *"el Backend es solo código"*; mezcla investigación histórica con contratos y validación, que es un territorio completamente distinto | Bajo, pero vuelve a violar la separación que motivó la pregunta |
| C (agente nuevo) | Sigue el patrón ya probado dos veces en el proyecto (custodio bajo un dueño); el dossier queda como artefacto revisable entre investigar y narrar; el `backend-specialist` sigue siendo solo código | Un agente más para mantener; una coordinación más (backend → historiador → backend → narrador) | Medio: hay que retirar el agente y sus referencias, pero ninguna ficha depende de su existencia para compilar |
| D (statu quo) | Cero trabajo nuevo | No resuelve lo que el usuario pidió: fuentes múltiples contrastadas para temas sensibles | — |
| C1 (una skill, todo junto) | Menos archivos; el criterio de detección de disputa vive donde se genera, en la investigación misma | Mezcla "cómo busco y evalúo fuentes" con "qué cuenta como disputa política en la historia argentina", que son dos tipos de juicio distintos aunque estén cerca | Bajo |
| C2 (dos skills en el historiador) | Separación más fina | La segunda skill quedaría casi vacía de metodología propia — es una lista de temas y un criterio de cuándo aplican, no un proceso — y crea una tercera pieza para mantener sin ganancia clara de profundidad | Bajo |
| C3 (una skill + extensión de voz-narrativa) | Cada regla vive donde se **usa**: detectar la disputa es del que investiga, narrarla sin tomar partido es del que escribe; ninguna de las dos piezas queda hueca; la regla de neutralidad se apoya en el trabajo ya hecho de la sección 6 de `voz-narrativa`, que es vecina temática directa | El criterio de "qué es una disputa política" y el de "cómo se narra" quedan en dos archivos distintos, y hay que mantenerlos coherentes a mano | Bajo |
| E (skill de neutralidad aparte) | Reutilizable si algún día otro agente narra algo políticamente sensible fuera del catálogo | Hoy solo la usa un agente (`narrative-specialist`), que es exactamente el criterio por el que este proyecto no separa una skill sin una segunda razón que la use — la misma regla que ya aplicó `voz-narrativa` para no separar la sección de fuentes/procedencia | Bajo |
| F (sección de voz-narrativa) | Un solo archivo sigue gobernando toda la voz; la nueva regla es contigua a las que ya existen sobre juicio de actos y de pueblos, así que se lee en el lugar donde ya se resuelve una pregunta parecida | Ninguno concreto | Bajo |

## Decisión elegida

**C, con la estructura C3, y F.**

### 1. Nuevo agente: `historiador-specialist`

Vive en el **equipo de backend**, como par de `narrative-specialist`, y lo
convoca el **`backend-specialist`** — el mismo patrón que ya usa el proyecto
para `brand-specialist`/`ui-reviewer` bajo `frontend-specialist`. No es un
cuarto especialista de nivel 3: es un custodio, como el narrador, y como él
**no tiene `Agent`** — lo convocan, no convoca.

**Territorio.** Investigar los hechos de una ficha antes o durante su
redacción, cuando: el usuario lo pide explícitamente; el tema cae en la lista
acotada de la sección 3; o el `narrative-specialist` señala, vía
`backend-specialist`, que le falta un dato que el usuario no proveyó. Entrega
un **dossier**: los hechos, la o las fuentes que sostienen cada uno, y —cuando
el tema está en la lista acotada— las interpretaciones en disputa,
explicitadas como tales y con su propia fuente cada una. **Nunca narra y
nunca decide qué entidades entran**: eso sigue siendo del usuario.

**Herramientas propuestas** (a definir en el archivo del agente, fuera de este
ADR): `Read`, `Glob`, `Grep`, `WebFetch`, `WebSearch`, `Skill`, `SendMessage`,
`ListAgents`, `TodoWrite`. **Sin `Write` ni `Edit`**: su artefacto es el
dossier que entrega en su informe, no un archivo — el mismo motivo por el que
el `ui-reviewer` y el `typescript-specialist` tampoco escriben archivos ajenos.
**Sin `Bash`**: no verifica código ni corre el compilador, así que no lo
necesita. **Sin `Agent`**: lo convocan.

**Skill nueva:** `investigacion-historica`, precargada, de su propiedad. Cubre:
cómo evaluar la calidad de una fuente, cuántas fuentes independientes hacen
falta para un hecho disputado, cómo estructurar el dossier, y **el criterio
para reconocer cuándo un tema entra en la lista de la sección 3** —esa
detección es un juicio de investigación, no de redacción, y por eso vive acá y
no en `voz-narrativa`—. La escribe el `super-architect` junto con el
`historiador-specialist` cuando se implemente, no este ADR.

### 2. Reparto con el ADR 0004 — no se edita, se reinterpreta

El ADR 0004 sigue vigente entero: el contenido curado vive en archivos
versionados, y la exactitud histórica sigue siendo el riesgo número uno del
proyecto. Lo que este ADR aclara es **de dónde puede salir un hecho**:

- El **usuario** sigue siendo la autoridad final: decide qué entidades entran,
  aporta el material que quiera cuando quiere —el párrafo de San Martín de la
  sección de contexto es exactamente ese aporte—, y su **visto bueno explícito
  sobre el texto de cada ficha sigue siendo condición de cierre**, sin cambios.
- El **historiador** es una **fuente adicional de datos contrastados**, no un
  reemplazo. Se activa en los tres casos de la sección 1. Nunca aprueba nada y
  nunca decide qué entra.
- Si el historiador y el material del usuario **discreparan** en un hecho, no
  lo resuelve ningún agente: se lo señala al usuario y se espera, con el mismo
  mecanismo de pregunta bloqueante que ya usa el `narrative-specialist`.

### 3. Neutralidad ante disputas políticas — extensión de `voz-narrativa`

Se agrega una sección nueva a la skill `voz-narrativa`, contigua a la sección
6 (*Prohibiciones de contenido*), con este contenido (a redactar en detalle
por el `narrative-specialist` cuando se implemente; el criterio ya está
cerrado por el usuario):

**Alcance acotado, no todo el catálogo.** La regla aplica solo a temas donde
existe una **disputa política vigente sobre cómo calificar un hecho**, no
sobre si ocurrió. Lista de arranque, dada por el usuario: los conflictos entre
unitarios y federales, la anarquía del año 20, la Campaña del Desierto de
Roca, la última dictadura militar y sus actores —incluida la guerrilla de los
años setenta, con Montoneros nombrado explícitamente—. La mayoría del
catálogo —los próceres de baja polémica real— **no** cae bajo esta regla y se
sigue escribiendo como hoy.

**No es una regla para suavizar.** Es lo opuesto: el hecho duro se narra sin
eufemismo. El patrón que dio el usuario, con la Campaña del Desierto: se narra
el sometimiento de los pueblos originarios sin blindarlo, y se agrega un
contrapunto breve que reconoce que existe una lectura en disputa sobre cómo
calificarlo —conquista o consolidación territorial, para algunos; genocidio,
para otros—, sin que la prosa falle a favor de ninguna de las dos. Montoneros
se puede nombrar como lo que fue —una organización guerrillera—, que es un
hecho, no una interpretación.

**No es lo mismo que "no juzgar".** La skill ya permite, y sigue permitiendo
sin cambios, juzgar los **actos concretos** de una persona: «crueldad
pragmática», «su brutalidad contra los galos» siguen siendo la voz correcta.
Lo nuevo prohíbe exclusivamente tomar partido en una **interpretación política
en disputa** sobre un hecho puntual de la lista de arriba. Y es indiferente a
la mirada personal de quien redacta: el usuario fue explícito en que su propia
posición —nacionalista, valora el sacrificio por el país— no debe traducirse
en prosa que favorezca un lado de una disputa concreta.

**A quién obliga.** Al `narrative-specialist`, que es quien escribe la prosa
final. Al `historiador-specialist` le corresponde la mitad anterior: detectar
que un tema cae en la lista y entregar las posturas documentadas con sus
fuentes; no redacta el contrapunto, lo hace posible.

### Qué extiende, y qué no

**No supersede al ADR 0012.** La audiencia y el registro épico no cambian: la
prosa sigue siendo la de las muestras, sin simplificar y sin bajar de tono. Lo
que este ADR agrega es un límite de contenido —a qué interpretaciones no se
les puede dar la razón—, no un límite de estilo.

**No supersede al ADR 0004**, y no se edita: se reinterpreta la fuente de los
hechos como se explica arriba, sin tocar su decisión de fondo (archivos
versionados, importados a la base).

**No supersede al ADR 0009** (formato del contenido curado): el historiador no
escribe en `contenido/`, así que su dossier no es contenido curado en el
sentido de ese ADR — es un insumo previo, con el mismo estatus que el material
que hoy aporta el usuario.

**Pendiente de implementación, fuera de este ADR:** el archivo
`.claude/agents/historiador-specialist.md`, la skill
`.claude/skills/investigacion-historica/`, la extensión de
`.claude/skills/voz-narrativa/SKILL.md`, y la actualización del organigrama en
`CLAUDE.md` —tabla de agentes, sección "Equipo de backend", y el `Agent(...)`
del `backend-specialist` para incluir a `historiador-specialist`—. Ninguno de
esos archivos se toca en este ADR: son configuración e implementación, fuera
del alcance de escritura del arquitecto.

## Motivo

**Porque separar investigar de narrar no cuesta nada hoy y cuesta mucho
después.** Hay una sola ficha publicada y ninguna pantalla de catálogo — el
mismo argumento de oportunidad que ya usó el ADR 0012 para el registro y el
ADR 0007 para la severidad del compilador: hay decisiones que salen gratis el
día cero y no se toman nunca más tarde.

**Porque el riesgo que motivó la restricción original del narrador no
desapareció: se hizo más grande.** Un agente que investiga temas
políticamente disputados y a la vez escribe con una voz persuasiva por diseño
(ADR 0012) es exactamente el escenario que la sección 4 de
`narrative-specialist` ya identificó como el peor resultado posible. Separar
en dos agentes deja un punto de revisión intermedio —el dossier— entre reunir
los hechos y envolverlos en metáfora.

**Porque el usuario fijó una restricción concreta y hay que respetarla en la
forma, no solo en el espíritu.** *"El backend es solo backend, solo
código"* descarta la alternativa B sin ambigüedad; construir un agente nuevo en
el equipo de backend, en vez de forzarlo dentro del `backend-specialist`, es la
única forma de cumplirla.

**Porque la neutralidad de interpretación es una regla de redacción, no de
investigación**, y por eso vive en `voz-narrativa` y no en una skill nueva.
Detectar que la Campaña del Desierto es un tema en disputa es un juicio
historiográfico; decidir cómo se escribe el contrapunto sin que suene a
relleno es un juicio de lengua, igual que decidir dónde va la metáfora madre.
Cada regla vive donde el agente que la aplica hace su trabajo, que es el mismo
criterio que ya separa a `narrative-specialist` de `backend-specialist` para
todo lo demás.

## Consecuencias

**Aceptamos:**

- Una coordinación más por ficha sensible: `backend-specialist` → convoca al
  `historiador-specialist` → recibe el dossier → convoca al
  `narrative-specialist` con el dossier como material. Para la mayoría del
  catálogo —los temas de baja polémica— este paso no aplica y el flujo sigue
  siendo el de hoy.
- Un agente más para mantener, con su propia skill.
- El criterio de "qué es una disputa política vigente" empieza acotado a la
  lista de la sección 3 de la decisión elegida, y **no** es exhaustivo: puede
  aparecer un tema nuevo que no está en la lista y haya que agregar.

**Obtenemos:**

- Fuentes múltiples y contrastadas para los temas donde de verdad hace falta,
  sin que el `narrative-specialist` pierda su restricción de no tener acceso a
  internet.
- Una regla de neutralidad verificable, calibrada con ejemplos concretos del
  usuario —el mismo criterio con el que se calibraron los números de
  `voz-narrativa` contando las muestras—, en vez de una intención genérica de
  "no juzgar" que cada agente interpretaría distinto.
- El `backend-specialist` se mantiene exclusivamente en código, sin absorber
  trabajo de contenido ni de investigación, tal como el usuario lo pidió.

**Deuda técnica asumida:**

- La lista de temas en disputa de la sección 3 se escribe con los ejemplos que
  dio el usuario hoy. No está probada contra un caso real todavía —no hay
  ninguna ficha escrita sobre esos temas— y es esperable que la primera vez
  que se use aparezca un caso límite que la lista no previó. Eso no invalida la
  regla: es el motivo por el que queda escrita como lista abierta, no cerrada.
- El refuerzo explícito de analogías y metáforas (punto 4 del pedido original)
  no ameritó una decisión propia: la sección 4 de `voz-narrativa` (la
  "metáfora madre") ya lo cubre. Queda como ajuste menor de redacción para
  cuando se toque la skill, no como parte de este ADR.

**Revisar si:**

- Aparece un tema políticamente disputado que no está en la lista de la
  sección 3 y alguien tiene que decidir sobre la marcha si aplica la regla:
  ese caso amplía la lista, no reabre este ADR.
- El historiador y el material del usuario discrepan en un hecho de forma
  reiterada: sería señal de que el reparto de la sección 2 necesita más
  precisión que la que tiene hoy.
- El volumen de fichas que requieren investigación resulta ser la mayoría del
  catálogo, no la minoría que el usuario describió: cambiaría el costo de
  coordinación asumido arriba y valdría la pena revisar si el historiador debe
  participar por defecto en vez de a demanda.
