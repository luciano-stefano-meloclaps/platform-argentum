# 0015 — Identidad visual Argentum v2: giro museístico e institucional

- **Estado:** Aceptado
- **Fecha:** 2026-09-10
- **Decide:** el usuario

## Decisión

Adoptamos una **v2 parcial** de la identidad visual Argentum, versionada en
[`docs/marca/sistema-de-diseno-v2.md`](../marca/sistema-de-diseno-v2.md), que
**supersede parcialmente** al [ADR 0008](0008-identidad-visual-argentum.md):
reemplaza el concepto/encuadre de marca, el logotipo, la paleta de
celeste/dorado/error y la tipografía, y agrega un conjunto de elementos
distintivos nuevos (cinta bandera, filete dorado, efecto `.shiny`, rombo
separador, plates/medallón). **El sistema de ligas (Cobre/Plata/Oro/Litio),
la paleta de las 6 categorías de contenido y el verde laurel no cambian** y
siguen rigiendo desde v1.0 y el ADR 0008.

## Contexto

El ADR 0008 adoptó la identidad Argentum v1.0 con seis correcciones de
contraste y estableció, por escrito, un territorio de marca "transversal, no
infantil, **no gubernamental**" y una estética "editorial, bordes finos", con
una prohibición nombrada de "modernizar" el sistema con degradados, sombras
pesadas o glassmorphism. Ese ADR dejó anotado como disparador explícito de
revisión: *"la identidad se revisa y aparece una v2 del documento de
marca"* — exactamente lo que ocurre acá.

El usuario pegó un documento nuevo de guía de marca y confirmó explícitamente,
en dos rondas de preguntas, que se trata de una v2 real que reemplaza al
sistema vigente, no un anexo ni una referencia externa. El super-architect
detectó, y el `brand-specialist` confirmó de forma independiente, que el
documento nuevo:

- Contradice por nombre la prohibición de "modernizar" de la v1: introduce
  gradientes metálicos animados, un efecto de brillo continuo (`.shiny`), una
  cinta bandera de 40px y medallones ornamentales.
- Invierte el encuadre de marca: de "no gubernamental" a autodescribirse como
  "monumento estatal" y "cédula numismática".
- Cambia la familia tipográfica de cuerpo (Montserrat → Lora) y permite texto
  justificado, que v1 prohibía explícitamente.
- Cambia el logotipo (peso, `letter-spacing`, una variante epigráfica con V
  por U).
- Cambia el botón primario de relleno a outline, deshaciendo puntualmente la
  corrección de contraste que el ADR 0008 hizo sobre ese mismo componente.
- No menciona en absoluto el sistema de ligas, la paleta de categorías ni el
  verde laurel.
- Trae una sección de "voz y contenido" que contradice el ADR 0012 (registro
  épico), mezclando dominios que no le corresponden a un documento de marca.

A la vez, varios valores del documento nuevo —varios celestes, el rojo de
error— coinciden **byte a byte** con los valores que el ADR 0008 corrigió, no
con los originales de v1 previos a esa corrección. Esto indica que el
documento nuevo se escribió con conocimiento del sistema ya corregido: es una
evolución deliberada en algunos puntos, no una pieza desconectada del proyecto.

## Problema

Dos problemas distintos, y hay que resolver los dos sin mezclarlos.

**1. El documento nuevo, tomado literalmente, no es adoptable tal cual.**
Le faltan valores que hacen imposible verificar el componente más usado del
sistema (`--color-bg` sin hex, `--color-accent-600/700/800` como "pasos
generados" sin hex), y dos de sus propios elementos declarados fallan
contraste WCAG AA medido: el color de acento base como texto (1.93:1) y el
punto crítico del gradiente `.au` en su uso declarado, texto de cifras de
hero (2.57:1). Esto es independiente de cualquier decisión de alcance: aunque
el usuario confirme el giro estético al 100%, estos números no pasan y hay
que corregirlos antes de que el `frontend-specialist` construya sobre ellos.

**2. El documento nuevo calla sobre subsistemas enteros del sistema vigente**
(ligas, categorías, laurel) y cierra con una cláusula de sistema cerrado
("reusar estos tokens exactos... en vez de generar nuevos valores") que no
deja lugar para que sigan vigentes por default. Adoptar el documento sin
resolver esto por escrito dejaría esos subsistemas en un limbo que el próximo
agente que necesite pintar una categoría no podría resolver sin adivinar.

## Alternativas consideradas

### A. Adoptar el documento nuevo tal cual, como reemplazo total del ADR 0008

Se versiona sin corregir nada, incluidos los pares que no pasan contraste y
los valores faltantes, y se asume que todo lo no mencionado (ligas,
categorías, laurel) queda derogado por silencio.

### B. Adoptar como supersesión parcial, con correcciones vinculantes

Se versiona el documento nuevo como v2 **solo en lo que efectivamente
reemplaza** —concepto, logotipo, paleta celeste/dorado/error, tipografía,
elementos distintivos nuevos—, corrigiendo por escrito los valores faltantes
y los pares que fallan contraste, con el mismo método que usó el ADR 0008
sobre v1. Todo lo que el documento no menciona sigue rigiendo desde v1 sin
cambios, declarado explícitamente.

### C. Devolver el documento para que se complete y corrija antes de adoptar nada

No se escribe ADR hasta que el documento traiga todos los valores y pase
contraste por sí solo.

### D. No hacer nada / posponer

Se sigue con v1 hasta que haya pantallas que fuercen la decisión.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| --- | --- | --- | --- |
| A | Cero fricción, respeta literalmente el documento | Publica valores no verificables (botón primario) y dos fallas de contraste medidas; deja tres subsistemas completos en un vacío de facto | Alto: una vez construidas pantallas con esos huecos, hay que rehacerlas |
| B | La v2 entra hoy, corregida, con lo que no cambia declarado explícitamente; mismo patrón ya probado por el ADR 0008 | Introduce una diferencia entre el documento entregado y lo que corre, que hay que explicar (lo hace este ADR) | Bajo: son valores derivados y una tabla de alcance, no hay código todavía sobre lo nuevo |
| C | El documento queda coherente consigo mismo antes de adoptarse | Bloquea todo el frontend por un ida y vuelta que resuelve un puñado de valores; el criterio de accesibilidad lo tenemos nosotros, no el proceso externo | Medio |
| D | No se decide nada prematuro | Contradice lo que el usuario ya confirmó dos veces: el giro es real y quiere avanzar | Alto |

## Decisión elegida

**Alternativa B**, exactamente con el mismo patrón que el ADR 0008 usó para
v1: se adopta, se corrige por escrito lo que no pasa, y se declara
explícitamente el alcance de lo que cambia y lo que no.

### 1. Alcance: supersesión parcial

El ADR 0008 queda **vigente** en todo lo que la v2 no menciona: el sistema de
ligas (§6 del ADR 0008, con sus umbrales), la paleta de categorías, el verde
laurel, los íconos (Tabler copiado, sección 4 del ADR 0008), la carga de
fuentes con `next/font/google` (sección 5), el espaciado y los radios
generales. El ADR 0008 queda **corregido** en: contraste de celeste/dorado
(reemplazado por la paleta de §3 de la v2), peso tipográfico de títulos
(reemplazado por §4 de la v2), el encuadre de marca (§8 del ADR 0008, "no
gubernamental" y "piso de legibilidad", queda **sin objeto** en la parte del
encuadre; el piso de legibilidad para lectores de doce años en adelante
sigue vigente sin cambios).

### 2. El giro estético es intencional, confirmado por el usuario

El usuario confirmó explícitamente, con la prohibición de "modernizar" del
ADR 0008 puesta por delante, que quiere el cambio a un lenguaje
museístico/institucional con gradientes, animación y ornamento. Este ADR
**deroga esa prohibición puntual** de la v1. No se reabre la discusión de
diseño: es una decisión de producto ya tomada.

### 3. Correcciones vinculantes, mismo método que el ADR 0008

Todas derivadas por el `brand-specialist` bajando *lightness* en HSL,
conservando tono y saturación, hasta pasar 4.5:1 medido con la fórmula WCAG
de luminancia relativa:

| Punto | Documento nuevo | Vigente (v2) | Contraste | Sobre |
| --- | --- | --- | ---: | --- |
| `--color-bg` | Sin hex ("hueso") | `#FBF7F0` (alias de `--crema` de v1) | — | — |
| `--color-accent-600` | Sin hex | `#D99A26` (decorativo, nunca texto) | — | — |
| `--color-accent-700` | Sin hex | `#94691A` | **4.58:1** | `--color-bg` |
| `--color-accent-800` | Sin hex | `#604411` | **8.43:1** | `--color-bg` |
| Gradiente `.au`, stop 50% | `#C79331` | `#8B6722` | **4.85:1** | `--color-bg` |
| `--error-invertido` *(nuevo)* | No existía | `#DE9191` | **4.58:1** | `--celeste-900` |
| `.au-dark`, peor stop | `#E8BE63` | Sin cambio | **6.40:1** | `--celeste-900` |

Y dos decisiones de componente, delegadas por el usuario al
`brand-specialist` con la instrucción explícita de resolverlas con su
criterio, ajustables más adelante sin necesidad de un nuevo ADR:

- **Botón primario: outline**, no relleno. Texto/borde en `--color-accent-700`
  (4.58:1). Se agregan estados `:hover`/`:active`/`:focus-visible` que el
  documento nuevo no traía para ningún componente — ver deuda técnica.
- **Texto de error "Incorrecta ✕":** `--error` (vigente, sin cambios) sobre
  fondos claros; `--error-invertido` (nuevo, acotado) exclusivamente dentro de
  paneles invertidos.

Detalle completo de cada valor, con su fórmula y su razón, en
[`sistema-de-diseno-v2.md`](../marca/sistema-de-diseno-v2.md).

### 4. Lo que el documento nuevo no cubre, sigue igual

Ligas, categorías y verde laurel **no se tocan**. Esto lo confirmó el usuario
explícitamente al resolver las preguntas bloqueantes de este ADR, no es una
inferencia del equipo.

### 5. La sección de voz queda fuera

El documento entregado traía una sección 5 ("Voz y contenido") con un tono
"informativo, neutro" que contradice el ADR 0012 (registro épico). Esa
sección **no es territorio de una identidad visual** y no se adopta por este
ADR. El ADR 0012 sigue rigiendo la prosa del catálogo sin cambios.

## Motivo

Corregimos en el ADR en lugar de devolver el documento al usuario porque el
criterio de accesibilidad, otra vez, lo tenemos nosotros: dos fallas de
contraste y tres valores faltantes son un detalle de implementación que se
resuelve acá con el mismo método ya probado, no un motivo para frenar un giro
de producto que el usuario ya decidió y confirmó dos veces.

Declaramos la supersesión como **parcial** y no total porque el usuario lo
pidió explícitamente y porque el propio documento nuevo, leído con cuidado,
no da ninguna señal de haber considerado ligas, categorías o laurel — adoptar
en silencio su ausencia como derogación habría sido inventar una decisión que
nadie tomó.

Delegamos botón y color de error al `brand-specialist` porque son
exactamente el tipo de caso que su rol ya cubre ("resolver el caso que la
marca no cubre, con el criterio de la marca") y porque el usuario autorizó
explícitamente resolverlos sin volver a preguntarle.

## Consecuencias

**Aceptamos:**

- Un documento de marca **fragmentado en dos partes que hay que leer juntas**
  (v1 para lo que sigue vigente, v2 para lo que cambió) — igual que ya
  convivían v1 y el ADR 0008, ahora conviven tres documentos. El `README.md`
  de ADR y `brand-specialist.md` dejan explícito qué se lee para qué.
- Una **inversión de jerarquía de color** respecto a v1 (el dorado pasa a
  protagonizar donde antes protagonizaba el celeste) que hay que sostener
  consistentemente en cada pantalla nueva.
- Tres **interpretaciones no confirmadas explícitamente por el usuario**
  (peso de `--type-h3`, permanencia de Montserrat en interfaz, alcance exacto
  de "cuerpo" en Lora), documentadas como tales en `sistema-de-diseno-v2.md`
  §4 y §8, resolubles con un cambio barato si están mal.

**Obtenemos:**

- Un lenguaje visual **completo y verificado** para las áreas que la v2 cubre,
  antes de que exista la primera pantalla construida sobre él.
- Una paleta nueva que **pasa WCAG AA**, medida y no supuesta, con el mismo
  rigor que ya se le aplicó a v1.
- Continuidad total de tres subsistemas (ligas, categorías, laurel) sin
  reescribir nada que funcionaba.

**Deuda técnica asumida:**

- **`--ok-invertido` no existe todavía.** El mismo problema de contraste que
  motivó `--error-invertido` existe para el verde de acierto contra el panel
  invertido (2.21:1, medido). No se resuelve porque no hay todavía una
  pantalla de quiz real. Disparador: el arranque de esa pantalla.
- **No hay sistema de foco (`:focus-visible`) especificado** para ningún
  componente de la v2 salvo el botón primario, que el `brand-specialist`
  agregó por su cuenta. Cada componente nuevo necesita su propio tratamiento
  hasta que exista una regla de sistema.
- Las mismas texturas y activos pendientes de v1 (baldosa calcárea, isotipo
  "Ag") siguen sin producirse.

**Revisar si:**

- El usuario aclara que Montserrat también se retira de la interfaz (labels,
  botones, chips, nav) y no solo del cuerpo de ficha — hoy es una
  interpretación, no una confirmación.
- Aparece la primera pantalla con panel invertido y feedback de acierto, sin
  `--ok-invertido` resuelto.
- Se define un sistema de foco consistente, en vez de resolverlo componente
  por componente.
- Ligas, categorías o verde laurel necesitan adaptarse a la nueva estética
  museística — hoy el usuario confirmó que no cambian, pero si en la práctica
  chocan visualmente con el resto (dorado/museístico vs. chips pastel de
  v1), es una señal para revisarlo con un ADR nuevo, no en silencio.
