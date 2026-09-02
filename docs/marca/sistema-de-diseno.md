# Argentum — Sistema de diseño v1.0

- **Estado:** fuente de la identidad visual, adoptada por el
  [ADR 0008](../adr/0008-identidad-visual-argentum.md).
- **Origen:** documento de handoff entregado por el cliente, resultado del
  proceso de definición de identidad visual.
- **Dueño en el equipo:** `brand-specialist`.

> **Cómo se lee este documento.** Es la **fuente de la marca**: el concepto, el
> logotipo, la paleta, la tipografía y las reglas de aplicación salen de acá y
> no se discuten pantalla por pantalla.
>
> **Se conserva tal como se recibió, sin editar.** Cuatro puntos fueron
> corregidos o resueltos por el ADR 0008 —contrastes que no pasan WCAG AA, el
> peso tipográfico 900, la librería de íconos y la carga de fuentes— y **en esos
> cuatro puntos gana el ADR**. Están marcados abajo con ⚠️ y detallados en el
> ADR. Todo lo demás de este documento es vinculante.
>
> Si la identidad cambia, se escribe un ADR nuevo y una **v2** de este archivo;
> no se edita la v1.

---

## 1. Concepto de marca

**Nombre:** Argentum
**Origen:** Latín para "plata" — raíz etimológica de Argentina y del Río de la Plata.
**Símbolo químico:** Ag (número atómico 47)
**Tagline sugerido:** *conocé tu país*

**Territorio de marca:** Argentina europea y amigable. Confitería de barrio,
cartel de fachada porteña, documento histórico bien hecho. Transversal a todas
las edades — no infantil, no gubernamental.

---

## 2. Logotipo

### Wordmark

- Tipo: "ARGENTUM" en Cormorant Garamond 700
- Espaciado: `letter-spacing: 0.16em`
- Color: `--texto-titulo` (#1F3B4D)
- Tamaño: 22–26px según contexto (navbar, documentos, certificados)

### Nota sobre el isotipo

El isotipo (placa "Ag") se usa solo en contextos estándar (app stores, favicon
de navegador, marca de notificaciones). No aparece en la navegación ni en la
interfaz de usuario principal.

---

## 3. Paleta de color

### Color de marca

```
--celeste-400: #5DADE2   /* color de marca, protagonista visual */
```

Este es el celeste base elegido por el cliente. Toda la rampa se deriva de él.

### Rampa celeste (primario)

```
--celeste-50:   #EAF4FE   /* fondos de página, cabeceras suaves */
--celeste-150:  #BFE0FC   /* bordes sobre fondos celeste */
--celeste-400:  #5DADE2   /* color de marca — superficies destacadas, franja de tarjeta */
--celeste-600:  #1E96F5   /* botones de acción principal */          ⚠️ ADR 0008
--celeste-text: #0A5FA8   /* texto y links sobre blanco o crema */
--celeste-900:  #0A3D66   /* texto oscuro sobre celeste claro, uso mínimo como superficie */
```

### Dorado (acento 1 — logros y ligas)

```
--dorado-bg:     #FFF8E8   /* fondo de tarjeta de liga — NUNCA sobre celeste */
--dorado-borde:  #F0DFB8   /* borde de tarjeta de liga */
--dorado-filete: #F2D488   /* filete decorativo bajo la franja celeste, más claro */
--dorado-text:   #C98A00   /* texto dorado sobre fondo crema o blanco */   ⚠️ ADR 0008
```

> ⚠️ El dorado NUNCA convive en la misma superficie con el celeste.
> Siempre vive sobre fondos blancos o crema (`--blanco`, `--crema`, `--dorado-bg`).

### Verde laurel (acento 2 — logros, categoría próceres, estados positivos)

```
--laurel-bg:     #EAF0DF
--laurel-borde:  #D6E2C2
--laurel-text:   #4B6A2C
--laurel-dark:   #33471F
```

Referencia: laureles del escudo nacional.

### Paleta de categorías de contenido

Cada categoría tiene tres tokens: fondo pastel, borde tenue, texto/ícono oscuro.
El fondo siempre es la versión desaturada del color; el texto es la versión
oscura.

```
/* Próceres */
--cat-proceres-bg:     #EAF0DF
--cat-proceres-borde:  #D6E2C2
--cat-proceres-text:   #4B6A2C

/* Monumentos */
--cat-monumentos-bg:    #EAF4FE
--cat-monumentos-borde: #CFE4F8
--cat-monumentos-text:  #0A5FA8

/* Comidas */
--cat-comidas-bg:    #FBECE4
--cat-comidas-borde: #F2D6C7
--cat-comidas-text:  #A8492A

/* Fechas patrias */
--cat-fechas-bg:    #FBE9EF
--cat-fechas-borde: #F2CFDC
--cat-fechas-text:  #96324F

/* Animales */
--cat-animales-bg:    #EFEAFB
--cat-animales-borde: #DDD2F4
--cat-animales-text:  #5A45A0

/* Naturaleza / Monumentos naturales */
--cat-naturaleza-bg:    #E4F4EF
--cat-naturaleza-borde: #C2E2D6
--cat-naturaleza-text:  #1F7A5C
```

> Cuando se agreguen categorías nuevas, seguir el mismo patrón: tono pastel para
> el fondo (10–15% saturación) y versión oscura del mismo tono para texto.

### Neutrales cálidos (la clave anti-gubernamental)

```
--crema:             #FBF7F0   /* fondo de página principal */
--blanco:            #FFFFFF   /* tarjetas y superficies elevadas */
--arena-borde:       #EDE4D6   /* bordes de tarjetas sobre blanco/crema */
--arena-borde-suave: #F5EFE4   /* divisores finos */
```

> El fondo nunca es blanco puro ni gris frío. Siempre `--crema`.
> Este detalle es el 80% de lo que hace que no parezca página de organismo público.

### Textos

```
--texto-titulo:        #1F3B4D   /* títulos, nombres, valores destacados */
--texto-cuerpo:        #4A4235   /* párrafos de contenido */
--texto-secundario:    #6B5D4A   /* subtítulos, descripciones */
--texto-terciario:     #8A7B66   /* metadatos, conteos, epígrafes */      ⚠️ ADR 0008
--texto-sobre-celeste: #FFFFFF   /* texto sobre superficies celeste-400 o celeste-600 */  ⚠️ ADR 0008
```

> Los textos secundarios son marrón-arena, no gris azulado.
> Mezclar grises fríos con fondo crema rompe la calidez del sistema.

### Feedback (semánticos — reservados, no usar para categorías)

```
--ok:        #2E7D5B   /* correcto, aprobado */     ⚠️ ADR 0008
--ok-bg:     #E9F5EF
--error:     #C94A4A   /* incorrecto, rechazado */  ⚠️ ADR 0008
--error-bg:  #FBE9E9
--alerta:    #B26A00   /* pendiente, advertencia */ ⚠️ ADR 0008
--alerta-bg: #FBF0DA
```

### Sistema de ligas — Metales argentinos

```
--liga-cobre-bg:   #FBEDE4   --liga-cobre-text:  #8A4E1F   /* 0–500 pts */
--liga-plata-bg:   #F1F3F5   --liga-plata-text:  #5B666F   /* 501–1500 pts */
--liga-oro-bg:     #F0E2C4   --liga-oro-text:    #83590A   /* 1501–3000 pts */
--liga-litio-bg:   #EAF0DF   --liga-litio-text:  #4B6A2C   /* 3001+ pts */
```

Las ligas se llaman Cobre, Plata, Oro y Litio — los cuatro metales del suelo
argentino en orden ascendente. El litio es la liga máxima, conectando con la
riqueza minera contemporánea del país.

---

## 4. Tipografía

### Familias

| Familia | Fuente | Rol |
| --- | --- | --- |
| **Cormorant Garamond** | Google Fonts | Logotipo, títulos, nombres de categoría, números destacados |
| **Montserrat** | Google Fonts | Labels, botones, etiquetas, metadatos, navegación y todo el cuerpo de texto |

⚠️ **ADR 0008:** las fuentes **no** se cargan con `@import` desde Google Fonts.
Se cargan con `next/font/google`, que las auto-hospeda. El `@import` de abajo se
conserva solo como declaración de qué familias y qué pesos usa la marca.

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Montserrat:wght@400;500;600&display=swap');

--font-titulo:   'Cormorant Garamond', Georgia, serif;  /* logotipo, H1–H3, números destacados */
--font-cuerpo:   'Montserrat', system-ui, sans-serif;   /* todo lo demás: párrafos, labels, botones, nav */
```

> **Por qué Cormorant Garamond para el logo:** revisión moderna del Garamond del
> siglo XVI — el tipo de letra de los documentos de la época de los próceres.
> Contraste de trazo muy marcado entre trazos finos y gruesos, lo que genera la
> sensación de elegancia y sofisticación. A tamaños menores a 14px usar
> Montserrat en su lugar.
>
> **Por qué Montserrat para UI:** diseñada por Julieta Ulanovsky (Argentina)
> basándose en los carteles del barrio de Montserrat, CABA. Coherencia
> conceptual con la identidad.

### Escala tipográfica

⚠️ **ADR 0008:** los títulos son `font-weight: 700`, no 900. Cormorant Garamond
no tiene un peso 900 — pedirlo produce negrita sintética.

```
/* Títulos — Cormorant Garamond */
--type-display:  font-size: 36px; font-weight: 900; line-height: 1.1;    ⚠️ 700
--type-h1:       font-size: 30px; font-weight: 900; line-height: 1.15;   ⚠️ 700
--type-h2:       font-size: 24px; font-weight: 900; line-height: 1.2;    ⚠️ 700
--type-h3:       font-size: 18px; font-weight: 600; line-height: 1.3;

/* Cuerpo e interfaz — Montserrat */
--type-body-lg:  font-size: 16px; font-weight: 400; line-height: 1.75;
--type-body:     font-size: 14px; font-weight: 400; line-height: 1.7;
--type-caption:  font-size: 13px; font-weight: 400; line-height: 1.6;
--type-label:    font-size: 13px; font-weight: 600; line-height: 1.4;
--type-button:   font-size: 13px; font-weight: 600; line-height: 1;
--type-chip:     font-size: 11px; font-weight: 600; letter-spacing: 0.06em; /* en versalita */
--type-meta:     font-size: 12px; font-weight: 500; line-height: 1.5;
```

### Reglas tipográficas

- Máximo 58–62 caracteres por línea en cuerpo de lectura
- Nunca texto justificado
- Nunca mayúsculas sostenidas en párrafos — solo en chips de categoría (1–2 palabras máx.)
- Cormorant Garamond solo para títulos, nombres propios destacados y datos numéricos grandes
- Números en Montserrat con `font-variant-numeric: tabular-nums` para dashboards

---

## 5. Espaciado y radios

```
--radius-sm:   8px    /* chips, badges, botones chicos */
--radius-md:   12px   /* tarjetas de categoría */
--radius-lg:   14px   /* tarjetas de estadística */
--radius-xl:   16px   /* tarjeta principal de contenido */
--radius-full: 9999px /* pills y avatares */

--space-xs:  4px
--space-sm:  8px
--space-md:  12px
--space-lg:  16px
--space-xl:  22px
--space-2xl: 32px
```

---

## 6. Elevación y bordes

El sistema usa **bordes finos sobre fondo cálido**, no sombras pesadas. Las
sombras existen pero son sutiles — el look es editorial, no Material Design
puro.

```
--borde-default: 1px solid #EDE4D6      /* tarjetas sobre crema */
--borde-celeste: 1px solid #CFE4F8      /* tarjetas de categoría celeste */
--borde-strong:  1px solid #D6CAB8      /* énfasis, hover */

--sombra-sm: 0 1px 3px rgba(31,59,77,0.06), 0 1px 2px rgba(31,59,77,0.04);
--sombra-md: 0 2px 8px rgba(31,59,77,0.07);
--sombra-lg: 0 4px 14px rgba(93,173,226,0.12); /* sombra teñida de celeste */
```

---

## 7. Componentes clave

### Chip de categoría

```
background: var(--cat-{nombre}-bg)
border: 1px solid var(--cat-{nombre}-borde)
color: var(--cat-{nombre}-text)
font: Montserrat 600, 11px, letter-spacing 0.05em, VERSALITA
border-radius: var(--radius-full)
padding: 6px 14px
```

### Botón primario

⚠️ **ADR 0008:** el fondo es `--celeste-700` (#0978D0), no `--celeste-600`.
Blanco sobre #1E96F5 da 3.12:1 y no pasa WCAG AA para texto de 13–14px.

```
background: var(--celeste-600)   /* #1E96F5 */   ⚠️ --celeste-700 #0978D0
color: #FFFFFF
font: Montserrat 600, 14px
border-radius: var(--radius-sm)
padding: 11px 22px
box-shadow: 0 3px 10px rgba(30,150,245,0.35)
```

### Botón secundario / ghost

```
background: transparent
color: var(--celeste-text)
font: Montserrat 600, 14px
sin borde ni sombra
```

### Tarjeta de contenido

⚠️ **ADR 0008:** la franja celeste **no lleva texto blanco** (2.46:1). Si lleva
texto, va en `--texto-titulo` (4.77:1).

```
background: var(--blanco)
border: var(--borde-default)
border-radius: var(--radius-xl)
overflow: hidden

/* Franja superior */
height: 92px
background: var(--celeste-400)
/* Filete inferior de la franja */
border-bottom: 3px solid var(--dorado-filete)   /* #F2D488 */

/* Chip de categoría posicionado absolute, top: -15px, left: 22px */
```

### Tarjeta de liga / logro

```
background: var(--dorado-bg)     /* #FFF8E8 */
border: 1px solid var(--dorado-borde)
border-radius: var(--radius-lg)
/* NUNCA sobre superficie celeste */
```

### Marco de retrato (próceres, personajes históricos)

```
Forma: círculo
Borde exterior: 2px solid var(--celeste-400)
Anillo interior: 2px solid var(--dorado-filete), separado 4px del borde exterior
Puntado interior: stroke-dasharray 2 4, color var(--celeste-400), opacity 0.5
```

Unifica óleos del siglo XIX con fotos e ilustraciones modernas.

### Tarjeta de repaso

> En el vocabulario del proyecto se llama **tarjeta**, no *flashcard*
> (`CONTEXT.md`). El nombre de este componente en el código es `Tarjeta`.

```
/* Frente */
background: var(--blanco)
border: var(--borde-default)
border-radius: var(--radius-xl)
título: Cormorant Garamond 700

/* Dorso */
background: var(--celeste-900)    /* #0A3D66 */
border-radius: var(--radius-xl)
respuesta: Montserrat 600, color var(--dorado-filete)   /* #F2D488 sobre #0A3D66 */
```

> Excepción controlada: en el dorso de la tarjeta, el dorado claro (`#F2D488`)
> sobre el azul profundo (`#0A3D66`) es el único lugar donde conviven. El
> contraste es 7.77:1 —el documento original decía 8.2:1—, pasa WCAG AAA, y la
> naturaleza de "reverso" lo distingue del resto del sistema.

---

## 8. Texturas de marca

### Baldosa calcárea

Patrón geométrico inspirado en los pisos de las casas chorizo y zaguanes
porteños. Losange central en celeste, puntos de esquina en dorado claro.
Usar en: pantalla de bienvenida, fondo de certificados de logro, reverso de
tarjetas de repaso (alternativa).

### Filete de separación

```
height: 3px
background: var(--dorado-filete)   /* #F2D488 */
width: 60px (decorativo bajo título) o 100% (separador de sección)
border-radius: 2px
```

---

## 9. Íconos

Librería de referencia: **Tabler Icons** (outline, nunca filled).

⚠️ **ADR 0008:** no se instala la librería. Se copian al repositorio, como SVG
inline, únicamente los íconos que se usan. Tabler es MIT y lo permite.

```
Tamaño en tarjetas de categoría: 20px
Tamaño en navegación: 18px
Tamaño en botones: 16px
```

Asignación por categoría:

```
Próceres        → ti-flag
Monumentos      → ti-building-arch
Naturaleza      → ti-mountain
Comidas         → ti-tools-kitchen-2
Fechas patrias  → ti-calendar-star
Animales        → ti-paw
Eventos hist.   → ti-timeline-event
```

---

## 10. Guía de uso — lo que nunca debe pasar

| ❌ Prohibido | ✅ Correcto |
| --- | --- |
| Dorado sobre celeste | Dorado sobre blanco, crema o `--dorado-bg` |
| Fondo blanco puro como página | Fondo `--crema` (#FBF7F0) |
| Grises fríos en textos secundarios | Textos en marrón-arena (`#8A7B66`) |
| Cormorant Garamond en labels, botones o chips | Cormorant Garamond solo en títulos y datos grandes |
| Mayúsculas en nombres de próceres | Mayúsculas solo en chips de categoría |
| Más de dos colores juntos en una tarjeta | Un color de categoría por superficie |
| Colores de feedback (verde/rojo) como colores de categoría | Feedback reservado para estados de interacción |

---

## 11. Tokens CSS completos

> Esta es la declaración **de la marca**. La declaración **vigente en el
> producto** vive en el bloque `@theme` de la hoja de estilos, con las
> correcciones del ADR 0008 ya aplicadas. Ante una diferencia entre los dos,
> el ADR explica cuál y por qué.

```css
:root {
  /* Celeste — primario */
  --celeste-50:   #EAF4FE;
  --celeste-150:  #BFE0FC;
  --celeste-400:  #5DADE2;
  --celeste-600:  #1E96F5;
  --celeste-text: #0A5FA8;
  --celeste-900:  #0A3D66;

  /* Dorado — acento 1 */
  --dorado-bg:      #FFF8E8;
  --dorado-borde:   #F0DFB8;
  --dorado-filete:  #F2D488;
  --dorado-text:    #C98A00;

  /* Verde laurel — acento 2 */
  --laurel-bg:      #EAF0DF;
  --laurel-borde:   #D6E2C2;
  --laurel-text:    #4B6A2C;
  --laurel-dark:    #33471F;

  /* Categorías */
  --cat-proceres-bg:      #EAF0DF; --cat-proceres-borde:  #D6E2C2; --cat-proceres-text:  #4B6A2C;
  --cat-monumentos-bg:    #EAF4FE; --cat-monumentos-borde:#CFE4F8; --cat-monumentos-text:#0A5FA8;
  --cat-comidas-bg:       #FBECE4; --cat-comidas-borde:   #F2D6C7; --cat-comidas-text:   #A8492A;
  --cat-fechas-bg:        #FBE9EF; --cat-fechas-borde:    #F2CFDC; --cat-fechas-text:    #96324F;
  --cat-animales-bg:      #EFEAFB; --cat-animales-borde:  #DDD2F4; --cat-animales-text:  #5A45A0;
  --cat-naturaleza-bg:    #E4F4EF; --cat-naturaleza-borde:#C2E2D6; --cat-naturaleza-text:#1F7A5C;

  /* Ligas */
  --liga-cobre-bg:  #FBEDE4; --liga-cobre-text:  #8A4E1F;
  --liga-plata-bg:  #F1F3F5; --liga-plata-text:  #5B666F;
  --liga-oro-bg:    #F0E2C4; --liga-oro-text:    #83590A;
  --liga-litio-bg:  #EAF0DF; --liga-litio-text:  #4B6A2C;

  /* Neutrales cálidos */
  --crema:              #FBF7F0;
  --blanco:             #FFFFFF;
  --arena-borde:        #EDE4D6;
  --arena-borde-suave:  #F5EFE4;

  /* Textos */
  --texto-titulo:        #1F3B4D;
  --texto-cuerpo:        #4A4235;
  --texto-secundario:    #6B5D4A;
  --texto-terciario:     #8A7B66;
  --texto-sobre-celeste: #FFFFFF;

  /* Feedback */
  --ok:        #2E7D5B; --ok-bg:     #E9F5EF;
  --error:     #C94A4A; --error-bg:  #FBE9E9;
  --alerta:    #B26A00; --alerta-bg: #FBF0DA;

  /* Tipografía */
  --font-titulo:  'Cormorant Garamond', Georgia, serif;
  --font-cuerpo:  'Montserrat', system-ui, sans-serif;

  /* Espaciado */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  22px;
  --space-2xl: 32px;

  /* Radios */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   14px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Bordes */
  --borde-default: 1px solid #EDE4D6;
  --borde-strong:  1px solid #D6CAB8;

  /* Sombras */
  --sombra-sm: 0 1px 3px rgba(31,59,77,0.06), 0 1px 2px rgba(31,59,77,0.04);
  --sombra-md: 0 2px 8px rgba(31,59,77,0.07);
  --sombra-lg: 0 4px 14px rgba(93,173,226,0.12);
}
```

---

## 12. Dato de marca — número 47

El número atómico de la plata es **47**. Reservado como guiño para: logro oculto
al llegar a 47 aciertos seguidos, versión especial de la app, o mazo temático de
47 fichas. No aparece en la interfaz principal.

---

*Argentum Design System v1.0 — generado vía proceso de diseño colaborativo.*
