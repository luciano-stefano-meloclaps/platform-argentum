# Argentum — Sistema de diseño v2 (giro museístico)

- **Estado:** fuente de la identidad visual para las áreas que cubre, adoptada
  por el [ADR 0015](../adr/0015-identidad-visual-argentum-v2.md), que
  **supersede parcialmente** al [ADR 0008](../adr/0008-identidad-visual-argentum.md).
- **Origen:** documento de guía de marca entregado por el usuario, con
  correcciones de contraste y valores derivados por el `brand-specialist` —
  mismo criterio que el ADR 0008 aplicó sobre la v1.
- **Dueño en el equipo:** `brand-specialist`.

> **Cómo se lee este documento.** Es un documento de **alcance parcial**, no un
> reemplazo completo de [`sistema-de-diseno.md`](sistema-de-diseno.md) (v1.0).
> Reemplaza el **concepto/encuadre**, el **logotipo**, la **paleta de
> celeste/dorado/error**, la **tipografía** y agrega los **elementos
> distintivos** nuevos (cinta, filete, `.shiny`, rombo, plates). **Todo lo que
> no aparece acá sigue rigiendo desde la v1, sin cambios**: el sistema de
> **ligas** (Cobre/Plata/Oro/Litio), la **paleta de las 6 categorías**, el
> **verde laurel**, el **espaciado**, los **radios generales**, las
> **sombras**, la guía de **íconos** (Tabler copiado como SVG) y la carga de
> **fuentes** con `next/font/google`. Para esas partes, seguí consultando
> `sistema-de-diseno.md` y el ADR 0008 — este documento no los repite.
>
> **Se conserva tal como se recibió del usuario, sin editar el contenido
> original**, salvo el agregado de valores que el documento no traía (marcados
> con ⚠️ **ADR 0015**) y las notas de alcance de este encabezado. Si la
> identidad cambia de nuevo, se escribe un ADR nuevo y una v3; no se edita este
> archivo.

---

## 0. Qué cambia y por qué (resumen del giro)

El [ADR 0015](../adr/0015-identidad-visual-argentum-v2.md) confirma un cambio
de **encuadre**, no solo de tokens: el producto pasa de un posicionamiento
"editorial, no gubernamental" a uno **museístico/institucional**, con
elementos ornamentales y animados que la v1 prohibía por nombre. Es una
decisión del usuario, tomada con conocimiento de esa prohibición. Ver el ADR
para el razonamiento completo.

---

## 1. Concepto de marca

**Estilo:** Beaux-Arts / neoclásico institucional — evoca catálogo de museo,
cédula numismática y monumento estatal. Fondo hueso, filetes dorados, cinta
celeste-blanco-celeste (bandera argentina).

⚠️ **ADR 0015 — reemplaza el encuadre de v1.** La v1 declaraba
"transversal a todas las edades — no infantil, **no gubernamental**". Este
giro es **intencional y confirmado por el usuario**: el producto adopta a
propósito un lenguaje institucional/estatal que la v1 evitaba explícitamente.
No es una lectura errónea del documento nuevo — es la decisión.

El nombre, el origen etimológico y el símbolo químico **no cambian** (siguen
en `sistema-de-diseno.md` §1): Argentum, del latín "plata", Ag.

---

## 2. Logotipo

⚠️ **ADR 0015 — reemplaza el logotipo de v1** (que era Cormorant Garamond 700,
`letter-spacing: 0.16em`).

- Tipo: "ARGENTUM" en **Cormorant Garamond 400**, `letter-spacing: 0.34em` +
  `text-indent` igual (compensa el rastreo).
- Variante epigráfica **"ARGENTVM"** (V por U) permitida únicamente en la
  pantalla de Ingreso. Es una elección deliberada, no un error tipográfico.
- 🔶 **Extensión — accesibilidad, no estaba en el documento original.** El
  nombre accesible (`aria-label` o texto alternativo) del logotipo es siempre
  **"Argentum"**, sin importar qué variante gráfica se muestre. No se puede
  confiar en que un lector de pantalla infiera la V como U.

El isotipo "Ag" **no cambia** (sigue en `sistema-de-diseno.md` §2 y el ADR
0008 §7: solo en contextos estándar, no en la navegación).

---

## 3. Paleta de color

⚠️ **ADR 0015 — reemplaza la paleta de celeste, dorado y error de v1.** La
paleta de **categorías**, el **verde laurel** y las **ligas** de v1 **no
cambian** — ver `sistema-de-diseno.md` §3.

### Base

```css
--color-bg: #FBF7F0;   /* "hueso" — alias del --crema de v1, no un tono nuevo */
```

⚠️ **ADR 0015.** El documento nuevo no traía un hex para "hueso". El
`brand-specialist` recomendó reusar el `--crema` de v1 en vez de introducir un
tercer neutro cálido sin necesidad concreta — no hay nada en el giro de marca
confirmado por el usuario que exija un fondo distinto del que ya existe.

Los neutrales restantes (`--blanco`, `--arena-borde`, `--arena-borde-suave`) y
los textos (`--texto-titulo`, `--texto-cuerpo`, `--texto-secundario`,
`--texto-terciario`) **no cambian** — siguen los de v1.

### Dorado (acento institucional — próceres, cifras, marcos)

```css
--color-accent:      #E0AC4C;   /* decorativo — filete, superficie, ícono; NUNCA fondo de texto */
--color-accent-300:  #F7DE9B;
--color-accent-400:  #EDC873;
--color-accent-600:  #D99A26;   /* decorativo/borde — NUNCA texto */   ⚠️ ADR 0015
--color-accent-700:  #94691A;   /* texto y borde de .btn-primary */    ⚠️ ADR 0015
--color-accent-800:  #604411;   /* texto chico / estado hover-activo */ ⚠️ ADR 0015
```

⚠️ **ADR 0015.** El documento nuevo declaraba `--color-accent-600/700/800`
como "pasos generados" sin hex. El dorado base (`#E0AC4C`) no sirve como texto
sobre ningún fondo hueso razonable: da **1.93:1**, muy por debajo de AA. La
rampa de arriba se derivó bajando *lightness* en HSL, conservando tono y
saturación — mismo método que usó el ADR 0008 para corregir `--dorado-text`.

**Gradiente metálico** (texto/filete dorado), clase `.au`:

```css
.au {
  background: linear-gradient(100deg,
    #2A1C06 0%,
    #473109 16%,
    #4F3600 34%,
    #8B6722 50%,
    #4F3600 66%,
    #473109 84%,
    #2A1C06 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: var(--color-accent-700); /* fallback sólido si background-clip no aplica */
}
```

⚠️ **ADR 0015.** Los stops originales del documento nuevo fallaban en su punto
crítico (el del centro, `#C79331`, daba **2.57:1** contra `--color-bg`) para
el uso declarado: texto de cifras destacadas del hero. El piso del proyecto es
AA para **todo** texto, no AA-large, y la única excepción ya escrita para
mezclar dos superficies —el dorso de la tarjeta de repaso— no aplica acá. Se
recalcularon los 4 stops únicos con el mismo delta de luminosidad que
`--color-accent-700`, conservando el tono y la saturación propios de cada uno.
El punto crítico queda en **4.85:1**.

Variante clara para fondo oscuro, clase `.au-dark` — **sin cambios**, ya pasa
(su stop más oscuro, `#E8BE63`, da 6.40:1 contra el panel invertido
`--celeste-900`):

```css
.au-dark {
  background: linear-gradient(100deg,
    #E8BE63 0%, #F2D488 18%, #F7DE9B 36%,
    #FFF3D0 50%, #F7DE9B 64%, #F2D488 82%, #E8BE63 100%);
  background-clip: text;
  -webkit-background-clip: text;
}
```

Filete fino dorado (decorativo, sin texto encima — no requiere verificación
AA):

```css
--gradiente-filete: linear-gradient(90deg, #8A5E12, #E0AC4C 20%, #FFF3D0 50%, #E0AC4C 80%, #8A5E12);
```

### Celeste (identidad "Argentina" — encabezados, notas, fichas secundarias)

Todos los valores de esta sección **son los mismos que ya rigen desde v1**
(no hay corrección nueva); se listan acá con el rol que les da el documento
nuevo, para que quede junto a la paleta que sí cambió:

```css
--celeste-text:  #0A5FA8;   /* = v1 --celeste-text — kicker, subtítulos, etiquetas */
--celeste-medio: #5DADE2;   /* = v1 --celeste-400 — rombos, filetes, outline de foco; sigue sin poder llevar texto (regla ADR 0008) */
--celeste-banda: #EAF4FE;   /* = v1 --celeste-50 — fondo de bandas/notas */
--celeste-borde: #BFE0FC;   /* = v1 --celeste-150 — borde sobre fondo celeste */
--celeste-900:   #0A3D66;   /* = v1 --celeste-900 — paneles invertidos */
```

Nuevo, exclusivo de la cinta del header:

```css
--celeste-cinta: #4FA8DE;   /* franja tricolor — decorativo, sin texto encima */
```

**Regla que no cambia:** `--celeste-medio` (`--celeste-400` de v1) sigue
siendo superficie, nunca fondo de texto — la regla del ADR 0008 sigue vigente
sin excepción nueva.

### Rojo de error

```css
--error:            #C23A3A;   /* = v1/ADR 0008 — fondos claros (crema, blanco) */
--error-invertido:  #DE9191;   /* NUEVO — exclusivo dentro de paneles invertidos */   ⚠️ ADR 0015
```

⚠️ **ADR 0015.** El documento nuevo no decía sobre qué fondo aparece
"Incorrecta ✕", pero ubica quiz y resultado dentro de los paneles invertidos
(§4). Sobre `--celeste-900` (`#0A3D66`), `--error` da **2.11:1** y falla. Se
agrega `--error-invertido`, derivado subiendo *lightness* y bajando saturación
en HSL conservando el tono, que da **4.58:1** contra el panel invertido —
mismo criterio que la excepción ya existente del dorado en el dorso de la
tarjeta de repaso: **una variante acotada, exclusiva de una superficie, nunca
la variante por defecto.**

**Deuda técnica anotada, no resuelta acá:** `--ok` (`#2E7C5A`, valor vigente
del ADR 0008) da **2.21:1** contra el panel invertido — el mismo problema,
para el feedback de "correcta". No se resuelve en este ADR porque no hay
todavía una pantalla de quiz real que lo necesite. **Disparador:** el
arranque de la primera pantalla que use un panel invertido con feedback de
acierto — ahí hace falta un `--ok-invertido` con el mismo tratamiento antes de
escribir esa pantalla.

---

## 4. Tipografía

⚠️ **ADR 0015 — reemplaza los pesos y el rol de las familias en las áreas que
cubre.** La escala numérica de tamaños de v1 (`--type-display`, `--type-h1`,
etc.) **no cambia** salvo el peso que se indica abajo.

- **Encabezados grandes** (`--type-display`, `--type-h1`, `--type-h2`):
  Cormorant Garamond, peso **400** (antes 700, corregido por el ADR 0008 desde
  el 900 original de v1). Cormorant Garamond sí tiene peso 400 nativo, así que
  esto no reabre el problema de negrita sintética que motivó esa corrección.
- **Kickers de sección** ("LAS SALAS DEL CATÁLOGO"): Cormorant Garamond, peso
  600 — **sin cambios** respecto a v1.
- **Itálica** para subtítulos y notas ("conocé tu país", leyendas, asides).
- 🔶 **Interpretación, no estaba explícito — `--type-h3` no se menciona en el
  documento nuevo.** Se asume que sigue en peso 600 (valor de v1), porque el
  documento nuevo solo habla de "títulos grandes" al fijar el 400. Si esto es
  incorrecto, es barato de corregir: es un solo valor.
- **Cuerpo de lectura de ficha** (`--type-body-lg`, párrafos largos):
  **Lora**, justificado, `hyphens: auto`. Reemplaza a Montserrat
  **específicamente en esta superficie** — el documento nuevo dice "cuerpo...
  justificado en párrafos largos de ficha", que es un alcance más angosto que
  "todo el cuerpo de texto" de v1.
- 🔶 **Interpretación, no estaba explícito — la interfaz sigue en Montserrat.**
  El documento nuevo no menciona qué pasa con labels, botones, chips,
  metadatos y navegación — la definición de "cuerpo" que trae es la de
  lectura de ficha, no la de interfaz. Se interpreta que **Montserrat sigue
  siendo la familia de interfaz** (`--type-body`, `--type-caption`,
  `--type-label`, `--type-button`, `--type-chip`, `--type-meta`, sin cambios
  de v1), porque nada en el documento pide reemplazarla ahí y America no
  quedaría ningún elemento "sans" para uso de UI si se retirara del todo. Si
  el usuario quiso decir que Lora reemplaza a Montserrat en todos lados, es
  una corrección barata — un cambio de un `font-family` en `@theme` — pero no
  se asume sin confirmación porque cambia sesenta componentes, no dos.
- **Logotipo:** ver §2.
- **Kickers/etiquetas** (todas las secciones): 10–11px, uppercase,
  `letter-spacing: 0.16–0.18em`, color gris neutro o `#0A5FA8` — consolida lo
  que ya traía v1.
- **Cifras:** siempre `font-variant-numeric: tabular-nums lining-nums` en
  números destacados — v1 lo pedía solo para dashboards; se extiende a toda
  cifra destacada.
- **Nunca sans-serif para énfasis dentro de un párrafo editorial:** la
  jerarquía se logra con tamaño, itálica y el gradiente dorado, no con peso
  bold ni cambio de familia. Esto no afecta el uso de Montserrat 600 como
  familia de botones/labels, que es un rol de interfaz, no de énfasis
  editorial.

**Regla de v1 que este documento deroga expresamente:** "Nunca texto
justificado" ya no aplica al cuerpo de ficha en Lora. Sigue aplicando a
cualquier otro texto que no sea ese cuerpo de lectura largo.

---

## 5. Elementos de marca distintivos (nuevos)

Estos elementos no existían en v1 y quedan incorporados tal como los describe
el documento, con las correcciones de §3 ya aplicadas donde corresponde.

### Cinta superior (bandera)

Franja de 40px de alto en el header, tricolor horizontal:

```css
background: linear-gradient(180deg,
  var(--celeste-cinta) 0 33.3%,
  #FFFFFF 33.3% 66.6%,
  var(--celeste-cinta) 66.6% 100%);
border-bottom: 1px solid var(--color-accent);
```

Referencia directa a la bandera argentina (celeste-blanco-celeste), no azul
marino. Es decorativa — no lleva texto encima, no requiere verificación AA.

### Filete dorado

Línea de 3px inmediatamente debajo de la cinta celeste, con el gradiente
`--gradiente-filete` de §3. Marca la transición hacia el contenido
dorado/institucional.

### Efecto "shiny" (brillo animado)

Clase `.shiny`: doble `background` (gradiente dorado base + banda de brillo
blanca) que se desliza con `@keyframes shinySweep` (3.4s, ease-in-out,
infinito). Reservado para **cifras destacadas del hero** — no en texto largo
ni en botones.

⚠️ **ADR 0015 — requisito de accesibilidad que el documento no traía.** Toda
animación de `.shiny` respeta `prefers-reduced-motion: reduce`: con esa
preferencia activa, la animación se detiene y el elemento queda en su estado
final (el gradiente `.au` estático, sin el barrido). Esto no es una
interpretación: es el mismo requisito de `revision-de-ui` que ya rige para
cualquier movimiento continuo en este proyecto, y una animación infinita de
3.4 segundos es exactamente el patrón que ese requisito cubre.

### Rombo separador

`<span>` de 5–6px rotado 45° (`transform: rotate(45deg)`), color
`--celeste-medio` o dorado, entre dos líneas hairline — motivo ornamental
repetido, equivalente a un fleurón tipográfico. Decorativo: lleva
`aria-hidden="true"`.

### Plates (imágenes) — reemplaza el marco de retrato circular de v1

⚠️ **ADR 0015 — reemplaza el "marco de retrato" de v1** (círculo con anillo
punteado, `sistema-de-diseno.md` §7).

Wrapper `.plate` + `border-radius: 150px 150px 2px 2px` (arco superior,
esquina recta abajo — forma de medallón/lápida) para retratos y fichas
destacadas. Placeholder actual: rayado diagonal
(`repeating-linear-gradient(135deg, ...)`) con etiqueta monoespaciada
indicando qué imagen falta — sin cambios respecto al criterio de v1 de no
inventar imágenes reales.

---

## 6. Componentes y patrones

- **Header:** cinta bandera → filete dorado → título centrado → nav plano de
  11 ítems.
  ⚠️ **ADR 0015 — corrige un piso de legibilidad que el documento no
  respetaba.** El documento pedía uppercase 10px para los 11 ítems de nav; el
  piso mínimo de v1 es 11px en chip y 12px en meta, y v1 prohíbe mayúsculas
  sostenidas fuera de chips de 1–2 palabras. El nav queda en **11px**,
  uppercase, `letter-spacing: 0.16em`, subrayado celeste en el activo.
- **Bandas de sección** (hero de cada pantalla no-Explorar): fondo
  `--celeste-banda`, bordes `--celeste-borde`/`--celeste-medio`, kicker
  celeste + título Cormorant + subtítulo itálico.
- **Paneles invertidos** (quiz, dorso de tarjeta, resultado): fondo
  `--celeste-900`, texto blanco/dorado claro (`.au-dark`), rojo de error en
  `--error-invertido`. Generaliza el patrón que v1 ya tenía solo para el dorso
  de la tarjeta de repaso.
- **Notas informativas:** fondo `--celeste-banda`, borde
  `1px solid var(--celeste-borde)` + `border-left: 2px solid var(--celeste-medio)`,
  kicker `--celeste-text`. Patrón para "reglas del sistema" (historial,
  permisos, ligas).
- **Botones:**

  ```css
  .btn-primary {
    background: transparent;
    border: 1px solid var(--color-accent-700);
    color: var(--color-accent-700);
  }
  .btn-primary:hover,
  .btn-primary:active {
    background: var(--color-accent-300);
    color: var(--color-accent-800);
  }
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-accent-700);
    outline-offset: 2px;
  }
  .btn-secondary {
    background: transparent;
    border: 1px solid var(--arena-borde);
    color: var(--texto-secundario);
  }
  ```

  ⚠️ **ADR 0015 — decisión delegada al `brand-specialist`, con dos agregados
  que el documento no traía.** El botón primario pasa de relleno (v1,
  corregido por el ADR 0008 a `--celeste-700`) a **outline**, porque el giro
  hacia un lenguaje restringido/museístico ya está confirmado y no es
  competencia de la marca reabrir esa decisión de encuadre por un solo
  componente. Se agregaron **estados `:hover`/`:active`/`:focus-visible`**,
  que el documento nuevo no definía para ningún componente — hueco señalado
  como riesgo, ver más abajo.
  Contraste verificado: texto/borde `#94691A` sobre `--color-bg`: **4.58:1**
  (pasa AA texto y el 3:1 de componentes no-texto). Hover `#604411` sobre
  `#F7DE9B`: **6.81:1**.
- **Tablas:** clase `.table` del design system; números siempre tabulares,
  columna de identificación en números romanos + Cormorant cuando es "ficha".
  🔶 **Extensión de accesibilidad, no estaba en el documento.** El numeral
  romano es decorativo (`aria-hidden="true"`); el nombre de la fila y un
  ordinal arábigo accesible son lo que anuncia el lector de pantalla. Los
  lectores de pantalla no anuncian números romanos de forma consistente.
- **Números romanos:** se usan para numerar salas, emblemas y filas de
  índice — refuerzo del tono museístico, siempre acompañados del nombre en
  texto, nunca como único identificador.

---

## 7. Voz y contenido — fuera de alcance

El documento entregado por el usuario incluía una sección 5 ("Voz y
contenido": tono informativo y neutro). **Queda fuera de este documento y de
cualquier ADR de identidad visual.** El registro de la prosa del catálogo lo
fija el **ADR 0012** (épico, de registro alto, para lectores de 12 años en
adelante) y lo custodia el `narrative-specialist` con la skill
`voz-narrativa`. Ese ADR no se toca acá.

Lo único de esa sección que sí es territorio de marca — "sin emojis, sin
iconografía decorativa" — **ya regía desde v1** y no cambia.

---

## 8. Pendientes / deuda técnica

- **`--ok-invertido`** — no derivado (ver §3). Disparador: primera pantalla
  con panel invertido y feedback de acierto.
- **Sistema de foco (`:focus-visible`) no especificado por el documento
  nuevo**, para ningún componente salvo el botón primario (agregado por el
  `brand-specialist`, ver §6). Hasta que se defina un tratamiento de sistema,
  cada componente nuevo necesita su propio indicador de foco visible, nunca
  su eliminación.
- **Imágenes reales, textura de baldosa calcárea e isotipo "Ag"** — sin
  cambios respecto a v1 (`sistema-de-diseno.md` §7 / ADR 0008 §8): siguen sin
  producirse.
- **`--type-h3`** — peso asumido en 600 por interpretación, no confirmado
  explícitamente (ver §4).
- **Familia tipográfica de interfaz (Montserrat)** — se asume que continúa
  fuera del cuerpo de ficha, por interpretación del alcance literal del
  documento, no por confirmación explícita (ver §4).

---

*Argentum Design System v2 — giro museístico, adoptado por el ADR 0015 sobre
la base de v1.0.*
