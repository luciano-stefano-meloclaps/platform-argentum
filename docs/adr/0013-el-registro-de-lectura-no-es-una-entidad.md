# 0013 — El registro de lectura no es una entidad: dos prosas, una fila

- **Estado:** Aceptado
- **Fecha:** 2026-09-09
- **Decide:** el usuario

## Decisión

Cuando exista la versión para chicos, **una entidad va a seguir siendo una fila
con un solo slug**. El **registro de lectura** —épico o para chicos— es un
**parámetro de lectura**, no parte de la identidad de la entidad: no es una fila
nueva, no es un slug nuevo y no es una columna de `entidad`. Las dos prosas van a
vivir **dentro de `datos`**, en los campos de prosa y solo ahí; **los hechos no se
duplican nunca**.

**Hoy no se toca nada**: ni el esquema, ni el descriptor, ni la firma del módulo,
ni la ruta de la pantalla. Lo que este ADR fija es **la forma que va a tener el
cambio cuando llegue**, para que no se decida por omisión mientras tanto.

## Contexto

El ADR 0012 dio vuelta la audiencia hacia chicos grandes y adultos y **pospuso** la
versión para chicos. Al pedir los tickets del vuelco, el usuario aclaró algo que
cambia el problema: *«la visión para chicos va a estar más adelante **dentro de la
misma app**»*.

Eso convierte una decisión editorial en una decisión de modelo. El mismo prócer va
a tener **dos prosas del mismo hecho histórico**, y hoy el descriptor de `procer`
tiene un `semblanza` y uno solo.

El estado real del árbol, que es lo que hace que esta decisión sea barata hoy:

- La tabla `entidad` tiene `id`, `tipo`, `slug`, `nombre` y `datos` (JSONB), y una
  sola restricción además de la clave primaria: **`unique("entidad_slug_unico")`
  sobre `slug`**, global, no por tipo.
- Esa restricción **no es cosmética**: es sobre lo que se apoya el `ON CONFLICT
  (slug)` que hace **idempotente** a la importación (ADR 0004).
- Hay **una** fila de contenido real, **ninguno** de los cinco módulos escrito y
  **ninguna** pantalla de catálogo construida.

## Problema

Dos registros sobre la misma entidad se pueden modelar de maneras muy distintas, y
la diferencia entre ellas no se nota hasta que hay treinta fichas escritas y una
pantalla construida. Si nadie elige, elige el primero que escriba el módulo
`catalogo` o la ruta de la ficha, y nadie se entera hasta que hay que migrar.

Y hay una trampa simétrica: **decidir hoy la forma exacta también es un error**,
porque la versión para chicos está pospuesta a propósito y su lengua todavía no
existe. Diseñar la estructura para una prosa que nadie escribió es exactamente lo
que el principio de arquitectura del proyecto prohíbe.

## Alternativas consideradas

### A. Una fila por registro, con una columna discriminadora

Agregar `registro` a `entidad` y guardar dos filas por prócer, con
`unique(slug, registro)`.

### B. Una fila por registro, con un segundo slug

`manuel-belgrano` y `manuel-belgrano-chicos` como dos entidades distintas.

### C. Una fila, dos prosas dentro de `datos`

La entidad no se duplica. El registro vive dentro del JSONB, en los campos de
prosa, y la elección de la forma exacta —campos paralelos planos o un objeto
`prosa` anidado— se difiere.

### D. Decidir hoy la forma exacta dentro de `datos`

Lo mismo que C, pero eligiendo ya entre `semblanzaChicos` y
`prosa: { epico, chicos }`, y agregando los campos.

### E. No decidir nada

Escribir el registro épico y ver qué pasa.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | El registro queda consultable desde SQL; cada prosa se importa y se versiona por separado | **Rompe la importación idempotente**: el `ON CONFLICT (slug)` deja de tener sobre qué apoyarse y hay que migrar la restricción única; **duplica los hechos** —años, imagen, `nombreCompleto`— en dos filas que pueden desincronizarse; el módulo tiene que decidir qué fila es «la» entidad | Alto: migración de esquema, reescritura de la importación y deduplicación de datos |
| B | Cero cambios de esquema | Todo lo malo de A **más** la pérdida de identidad: dos slugs para un prócer, dos URL, dos fichas que el catálogo cuenta como dos entidades; `unique(slug)` sobrevive por accidente, no por diseño | Alto, y además hay que arreglar URL publicadas |
| C | **Cero migración** —`datos` es JSONB y el descriptor vive en código (ADR 0001)—; `unique(slug)` y la importación idempotente quedan intactas; los hechos existen **una sola vez**, que es lo que exige el riesgo número uno del ADR 0004 | La prosa para chicos no es consultable desde SQL sin abrir el JSON — irrelevante: nadie consulta por prosa | Bajo |
| D | No queda nada abierto | Agrega hoy campos para una prosa que no existe y cuya lengua está sin definir; hay que elegir entre dos formas sin haber visto ninguna funcionando | Bajo, pero es trabajo que probablemente se tira |
| E | Cero trabajo | Es exactamente el modo en que esta decisión se toma sola: la fija el primero que escriba `fichaPorSlug` o la ruta `/procer/[slug]` | Alto y silencioso |

## Decisión elegida

**La alternativa C**, con este alcance y estas prohibiciones.

**Lo que queda fijado desde hoy:**

1. **Una entidad es una fila y tiene un solo slug.** Manuel Belgrano no son dos
   entidades: es una, contada de dos maneras.
2. **El registro es un parámetro de lectura**, no una propiedad de la entidad.
   Cuando llegue, entra por la firma del módulo —`fichaPorSlug(tipo, slug,
   registro)`, con el épico por omisión— y por la ruta, de forma **aditiva**.
3. **Los hechos no se duplican jamás.** Los años, el `nombreCompleto`, la imagen
   con su crédito y su licencia existen **una sola vez** por entidad. Lo que varía
   entre registros es **la prosa y nada más**.
4. **La segunda prosa vivirá dentro de `datos`.** No en una columna de `entidad`,
   no en una tabla nueva, no en un segundo archivo de contenido con otro slug.

**Lo que se difiere, a propósito:** la forma exacta dentro de `datos`. Quedan dos
candidatas vivas —campos paralelos planos (`semblanzaChicos`) u objeto anidado
(`prosa: { epico, chicos }`)— y se elige **con la primera prosa para chicos
escrita delante**, no antes. Está en la entrada 3 de
`docs/decisiones-pendientes.md`.

**Prohibiciones interinas**, que son lo que impide que esto se decida por omisión:

- **No se agrega la columna `registro`** a `entidad`, ni ninguna otra, «para
  dejarlo preparado».
- **No se crea una segunda fila ni un segundo slug** para la misma entidad.
- **No se agrega hoy ningún campo `*Chicos`** al descriptor.
- **No se mete el registro en la ruta** todavía. Un segmento `/epico/...` hoy es
  una capa para una variante que no existe. **Cuál es la forma de la dirección de
  la ficha no lo decide este ADR**: lo decide el ticket que construye la pantalla,
  y a la fecha el #32 la fija en `/catalogo/<slug>`. Lo único que este ADR fija es
  que **el registro no entra ahí hasta que exista el segundo**.
- **Y no se escribe prosa intermedia** (ADR 0012): el día que haya versión para
  chicos, va a ser **otro texto**, no este bajado de tono.

## Motivo

**Porque duplicar los hechos es el error que este catálogo no puede cometer.** El
ADR 0004 declara la exactitud histórica como el riesgo número uno del proyecto. Un
modelo con dos filas por prócer crea un lugar donde el año de muerte puede decir
1820 en una y 1821 en la otra, y nadie lo nota porque las dos filas son válidas por
separado. La prosa varía entre registros; **1770 no varía**. Un modelo que permite
que varíe está mal, aunque nadie lo aproveche.

**Porque `unique(slug)` no es un detalle: es la importación.** Las alternativas A y
B obligan a cambiar la restricción única, y con ella el `ON CONFLICT (slug)` sobre
el que se apoya la idempotencia de la importación (ADR 0004). Eso convierte «tener
dos registros» en una migración de esquema más una reescritura del importador. La
alternativa C **no toca ni una coma del SQL**, porque `datos` es JSONB y la forma
la dicta el descriptor en código: es exactamente el beneficio para el que se tomó
el ADR 0001, y este es el primer caso real que lo cobra.

**Porque la profundidad está del lado correcto.** El módulo `catalogo` es el que
tiene que saber cómo se guardan dos prosas; la pantalla solo tiene que poder pedir
una. Con el registro como parámetro de lectura, la interfaz que aprende la capa web
crece en **un argumento con valor por omisión** y todo lo demás queda adentro. Con
dos filas, la capa web tendría que saber que una entidad puede ser dos cosas, que
es conocimiento que se filtra hacia afuera y ya no vuelve.

**Y porque decidir hoy la forma exacta no compra nada.** Los campos de `datos` son
gratis de agregar: el descriptor vive en código y el tipo de la columna lo da
`$type<Datos>()`, que es puramente de compilación. Esperar a tener la primera prosa
para chicos escrita cuesta cero y da información real. Lo caro no era el campo: era
la fila, y la fila ya quedó decidida.

## Consecuencias

**Aceptamos:**

- **La prosa para chicos no va a ser consultable desde SQL** sin abrir el JSON. No
  importa: nadie busca por prosa, y el ADR 0001 ya asumió esa deuda con la regla
  de que un atributo que se necesite filtrar se promueve a columna.
- **Queda una decisión abierta** —la forma exacta dentro de `datos`— y hay que
  resistir la tentación de cerrarla antes de tiempo.
- **La firma del módulo y la ruta van a cambiar** cuando llegue el segundo
  registro. El cambio es aditivo —un parámetro con valor por omisión— pero no es
  gratis: toca la capa web.

**Obtenemos:**

- **Cero migración** el día que llegue la versión para chicos.
- **La importación idempotente intacta**, y con ella `unique(slug)` y el `ON
  CONFLICT` que la sostiene.
- **Un solo lugar por hecho.** El año de nacimiento de Belgrano está escrito una
  vez y no puede contradecirse a sí mismo.
- **Una regla que se puede citar en una revisión**, que es lo que faltaba: cualquiera
  que proponga una columna `registro` o un segundo slug tiene un ADR en contra.

**Deuda técnica asumida:**

- Ninguna nueva. Este ADR **no agrega nada**: cierra puertas y deja una abierta con
  su nombre escrito.

**Revisar si:**

- **Aparece un tercer registro**, o uno que no sea de lengua sino de idioma. Dos
  variantes se resuelven con campos; cinco, no. Ahí la forma anidada gana y este ADR
  no la impide.
- **Un registro necesita hechos distintos, no solo prosa distinta.** Si alguna vez
  la versión para chicos necesita otra imagen o un recorte distinto de los datos, la
  premisa de este ADR —«lo que varía es la prosa y nada más»— dejó de valer y hay
  que escribir uno nuevo.
- **La importación deja de ser idempotente por otra razón.** Si el `ON CONFLICT
  (slug)` cae por un motivo ajeno, el argumento principal contra las alternativas A
  y B se debilita y conviene reevaluarlas.
