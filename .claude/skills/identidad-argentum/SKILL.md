---
name: identidad-argentum
description: Los tokens y reglas vigentes de la identidad visual Argentum — paleta (v1 + v2 fusionadas), tipografía, contraste verificado y reglas de uso. Usala al escribir o revisar código de interfaz, para no tener que convocar al brand-specialist por un lookup. Es la fuente citable de la marca; el que decide es el brand-specialist.
argument-hint: <archivo-o-token>
allowed-tools: Read Glob Grep
---

# Identidad Argentum — tokens y reglas vigentes

Esto es un **lookup**, no un criterio. Cada valor de acá ya está derivado y
medido — se cita, no se reinterpreta. Si necesitás un token que no está en
esta tabla, un componente que ningún documento cubre, o aprobar un contraste
no medido, **no lo resuelvas acá**: convocá al `brand-specialist` (ver
sección final).

La fuente completa, con el razonamiento de cada corrección, está en
[`docs/marca/sistema-de-diseno.md`](../../../docs/marca/sistema-de-diseno.md)
(v1.0), [`docs/marca/sistema-de-diseno-v2.md`](../../../docs/marca/sistema-de-diseno-v2.md)
(v2, giro museístico) y los ADR [0008](../../../docs/adr/0008-identidad-visual-argentum.md)
y [0015](../../../docs/adr/0015-identidad-visual-argentum-v2.md). Esta skill
**consolida**, no reemplaza esos cuatro archivos: donde haya una diferencia,
ganan ellos.

---

## 1. Tokens vigentes

### Celeste

| Token | Valor | Fuente | Nota |
| --- | --- | --- | --- |
| `--celeste-50` | `#EAF4FE` | v1 | Fondo de bandas/notas |
| `--celeste-150` | `#BFE0FC` | v1 | Borde sobre fondo celeste |
| `--celeste-400` | `#5DADE2` | v1 | **Superficie, nunca fondo de texto** |
| `--celeste-600` | `#1E96F5` | v1 | Superficie/borde sin texto — no botón |
| `--celeste-700` | `#0978D0` | v1, nuevo en ADR 0008 | Único fondo de botón relleno con texto blanco (4.56:1) |
| `--celeste-text` | `#0A5FA8` | v1 | Kicker, etiquetas, links |
| `--celeste-900` | `#0A3D66` | v1 | También es el fondo de panel invertido (v2) |
| `--celeste-cinta` | `#4FA8DE` | v2 | Exclusivo de la cinta bandera del header, decorativo |

### Dorado — v1 (logros, ligas)

| Token | Valor | Fuente | Nota |
| --- | --- | --- | --- |
| `--dorado-bg` | `#FFF8E8` | v1 | Fondo de tarjeta de liga, nunca sobre celeste |
| `--dorado-borde` | `#F0DFB8` | v1 | — |
| `--dorado-filete` | `#F2D488` | v1 | Único uso de dorado sobre celeste: dorso de tarjeta de repaso |
| `--dorado-text` | `#9A6900` | v1, corregido ADR 0008 (era `#C98A00`) | 4.52:1 sobre `--dorado-bg` |

### Dorado — v2 (sistema institucional)

| Token | Valor | Fuente | Nota |
| --- | --- | --- | --- |
| `--color-accent` | `#E0AC4C` | v2 | Decorativo — filete, superficie, ícono. **Nunca texto**: 1.93:1 sobre hueso |
| `--color-accent-300` | `#F7DE9B` | v2 | Fondo de hover del botón primario |
| `--color-accent-400` | `#EDC873` | v2 | — |
| `--color-accent-600` | `#D99A26` | ADR 0015 | Decorativo/borde, **nunca texto** |
| `--color-accent-700` | `#94691A` | ADR 0015 | Texto/borde de `.btn-primary`, tope de texto dorado (4.58:1 sobre hueso) |
| `--color-accent-800` | `#604411` | ADR 0015 | Texto chico / estado hover-activo (8.43:1 sobre hueso) |

**Gradiente `.au`** (texto/filete dorado, cifras destacadas del hero) —
stops recalculados por el ADR 0015. **Nunca usar los stops del documento de
handoff original** (`#6B4710…#C79331`): el punto medio fallaba 2.57:1.

```css
.au {
  background: linear-gradient(100deg,
    #2A1C06 0%, #473109 16%, #4F3600 34%,
    #8B6722 50%, #4F3600 66%, #473109 84%, #2A1C06 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: var(--color-accent-700); /* fallback sólido */
}
```

**Gradiente `.au-dark`** — sin cambios, stops originales de v2. Mínimo
6.40:1 contra el panel invertido:

```css
.au-dark {
  background: linear-gradient(100deg,
    #E8BE63 0%, #F2D488 18%, #F7DE9B 36%,
    #FFF3D0 50%, #F7DE9B 64%, #F2D488 82%, #E8BE63 100%);
  background-clip: text;
  -webkit-background-clip: text;
}
```

### Verde laurel (v1 — sin tocar, v2 no lo menciona)

| Token | Valor |
| --- | --- |
| `--laurel-bg` | `#EAF0DF` |
| `--laurel-borde` | `#D6E2C2` |
| `--laurel-text` | `#4B6A2C` |
| `--laurel-dark` | `#33471F` |

### Categorías de contenido (6, v1 — vigentes sin cambios, confirmado por el usuario)

| Categoría | Fondo | Borde | Texto |
| --- | --- | --- | --- |
| Próceres | `#EAF0DF` | `#D6E2C2` | `#4B6A2C` |
| Monumentos | `#EAF4FE` | `#CFE4F8` | `#0A5FA8` |
| Comidas | `#FBECE4` | `#F2D6C7` | `#A8492A` |
| Fechas patrias | `#FBE9EF` | `#F2CFDC` | `#96324F` |
| Animales | `#EFEAFB` | `#DDD2F4` | `#5A45A0` |
| Naturaleza | `#E4F4EF` | `#C2E2D6` | `#1F7A5C` |

### Ligas (4, v1 — vigentes sin cambios)

Nombres fijados por el ADR 0008 §6 y el vocabulario de `CONTEXT.md`. **No se
suben ni se bajan**: son una función pura del total de puntos.

| Liga | Puntos | Fondo | Texto |
| --- | --- | --- | --- |
| Cobre | 0–500 | `#FBEDE4` | `#8A4E1F` |
| Plata | 501–1500 | `#F1F3F5` | `#5B666F` |
| Oro | 1501–3000 | `#F0E2C4` | `#83590A` |
| Litio | 3001+ | `#EAF0DF` | `#4B6A2C` |

### Neutrales cálidos

| Token | Valor | Fuente |
| --- | --- | --- |
| `--crema` / `--color-bg` | `#FBF7F0` | v1; alias confirmado por ADR 0015 |
| `--blanco` | `#FFFFFF` | v1 |
| `--arena-borde` | `#EDE4D6` | v1 |
| `--arena-borde-suave` | `#F5EFE4` | v1 |

### Textos

| Token | Valor | Fuente |
| --- | --- | --- |
| `--texto-titulo` | `#1F3B4D` | v1 |
| `--texto-cuerpo` | `#4A4235` | v1 |
| `--texto-secundario` | `#6B5D4A` | v1 |
| `--texto-terciario` | `#7E705D` | v1, corregido ADR 0008 (era `#8A7B66`) |
| `--texto-sobre-celeste` | `#FFFFFF` | v1 — **solo sobre `--celeste-700`/`--celeste-900`**, nunca sobre `--celeste-400` |

### Feedback

| Token | Valor | Fuente | Nota |
| --- | --- | --- | --- |
| `--ok` | `#2E7C5A` | v1, corregido ADR 0008 | **Falla 2.21:1 contra panel invertido** — no usar ahí, deuda abierta |
| `--ok-bg` | `#E9F5EF` | v1 | — |
| `--error` | `#C23A3A` | v1, corregido ADR 0008 | Fondos claros únicamente |
| `--error-bg` | `#FBE9E9` | v1 | — |
| `--error-invertido` | `#DE9191` | ADR 0015 | **Exclusivo** de paneles invertidos (4.58:1). Nunca sobre crema/blanco |
| `--alerta` | `#9F5F00` | v1, corregido ADR 0008 | — |
| `--alerta-bg` | `#FBF0DA` | v1 | — |

### Tipografía

| Rol | Familia | Nota |
| --- | --- | --- |
| Títulos grandes, logotipo, cifras del hero | Cormorant Garamond, peso **400** (ADR 0015; antes 700/900) | **900 prohibido siempre** — no existe, produce negrita sintética |
| Kickers de sección | Cormorant Garamond, peso 600 | Sin cambios de v1 |
| `--type-h3` | Cormorant Garamond, peso 600 (asumido) | Interpretación no confirmada — ver ADR 0015 |
| Todo lo demás: cuerpo de ficha, labels, botones, chips, nav, meta, cifras de dashboard | **Lora** (ADR 0015 — reemplaza a Montserrat en todo el sistema) | Ver tabla de riesgo abajo |
| Carga | `next/font/google` para las dos, nunca `@import` | ADR 0008 §5 |

**Riesgo de Lora en interfaz, documentado y no resuelto por adelantado**
(sin evidencia de que Lora tenga los features OpenType `smcp`/`tnum`):

| Uso | Riesgo |
| --- | --- |
| Labels, botones (13–14px) | Medio-alto: contraste de trazo de serif caligráfica a tamaño chico en pantalla de baja calidad |
| Chips en versalita (11px) | Alto — usar `text-transform: uppercase`, **no** `font-variant-caps: small-caps` |
| Nav, kickers (11px, tracking amplio) | Alto |
| `tabular-nums` en columnas de cifras apiladas | Alto, probable no-op — verificar con render real antes de construir una tabla de progreso/ranking |
| Cuerpo de ficha (16px) | Ninguno — uso nativo de la fuente |
| Cifras aisladas del hero | Bajo — no necesita alinear con nada |

**Contingencia, solo si el riesgo se confirma en la práctica:** fallback
`ui-monospace` acotado al bloque de dígitos afectado, nunca una segunda
familia de marca completa.

### Componentes y patrones nuevos (v2)

| Elemento | Valor | Fuente |
| --- | --- | --- |
| Panel invertido | Fondo `--celeste-900`, texto blanco o `.au-dark` | v2 |
| Cinta bandera (header) | `linear-gradient(180deg,#4FA8DE 0 33.3%,#FFF 33.3% 66.6%,#4FA8DE 66.6% 100%)`, 40px, borde inferior `--color-accent` | v2 |
| Filete dorado bajo la cinta | 3px, gradiente metálico horizontal (stops de `.au`) | v2 + ADR 0015 |
| `.shiny` | Doble gradiente + `@keyframes shinySweep` 3.4s — **obligatorio** detenerlo con `prefers-reduced-motion: reduce` | v2 + extensión |
| Rombo separador | 5–6px, `rotate(45deg)`, decorativo, `aria-hidden` | v2 |
| Botón primario | Outline, texto/borde `--color-accent-700`; hover/activo relleno `--color-accent-300` + texto `--color-accent-800`; foco `outline: 2px solid --color-accent-700` | v2 + ADR 0015 |
| Plate / medallón (retratos) | `.plate` + `border-radius: 150px 150px 2px 2px`. **Reemplaza al marco circular de v1** para el mismo uso | ADR 0015 |
| Números romanos (índice/salas) | Decorativos, `aria-hidden`; el identificador accesible es el nombre en texto | v2 + extensión |

---

## 2. Reglas de uso (no son un valor — no se resuelven cambiando un token)

1. `--celeste-400` es superficie, **nunca** fondo de texto. Con texto encima:
   `--texto-titulo` o `--celeste-900`, nunca blanco.
2. `--celeste-600` es superficie/borde sin texto. `--celeste-700` es el único
   fondo válido para un botón relleno con texto blanco.
3. Dorado nunca convive con celeste en la misma superficie, salvo el dorso de
   la tarjeta de repaso (`--dorado-filete` sobre `--celeste-900`) — esa es la
   única excepción de v1, no un precedente.
4. `--color-accent` (dorado base v2) es decorativo — filete, ícono,
   superficie — **nunca texto**. Todo texto dorado usa `--color-accent-700` o
   `--color-accent-800`.
5. Los stops del gradiente `.au` son los recalculados por el ADR 0015, nunca
   los del documento de handoff v2 original.
6. `--error-invertido` solo existe dentro de un panel invertido. Fuera de un
   panel invertido se usa `--error`.
7. `--ok` **no se usa dentro de un panel invertido** hasta que exista
   `--ok-invertido` (deuda abierta).
8. El ornamento de v2 (cinta, `.shiny`, medallón, rombo, números romanos,
   gradientes metálicos) aplica **solo** donde v2 lo cubre explícitamente. No
   se extiende por estética a un componente que v1 ya resuelve de otra forma.
9. `.shiny`, y cualquier animación continua, respeta `prefers-reduced-motion`
   sin excepción.
10. Texto justificado (`hyphens: auto`) **solo** en el cuerpo de ficha en
    Lora. No se extiende a labels, botones ni ningún texto de interfaz.
11. Ningún ícono se instala como dependencia. Se copian SVG inline de Tabler
    Icons, con atribución, hasta veinte — más de veinte es la señal para
    reconsiderar (ADR 0003 + 0008).
12. No hay modo oscuro. Se decide con un ADR nuevo, nunca con un token
    suelto (ADR 0008, deuda técnica).
13. Cormorant Garamond nunca en peso 900. Lora nunca con
    `font-variant-caps: small-caps` sin confirmar que la fuente tiene `smcp`
    — usar `text-transform: uppercase`.
14. Donde compitan un componente de v1 y otro de v2 para el mismo caso de
    uso (pasó con el marco de retrato), **gana v2**: no son dos reglas
    vigentes en paralelo.

---

## 3. Contraste verificado (todos los pares medidos)

| Par | Contraste | Fuente |
| --- | ---: | --- |
| `--celeste-text` `#0A5FA8` / `--celeste-50` `#EAF4FE` | 5.87:1 | ADR 0015 |
| Blanco / `--celeste-700` `#0978D0` | 4.56:1 | ADR 0008 |
| `--dorado-text` `#9A6900` / `--dorado-bg` `#FFF8E8` | 4.52:1 | ADR 0008 |
| `--texto-terciario` `#7E705D` / `--crema` `#FBF7F0` | 4.51:1 | ADR 0008 |
| `--ok` `#2E7C5A` / `--ok-bg` `#E9F5EF` | 4.53:1 | ADR 0008 |
| `--ok` `#2E7C5A` / `--celeste-900` `#0A3D66` | **2.21:1 — falla** | Hallazgo ADR 0015, deuda abierta |
| `--error` `#C23A3A` / `--error-bg` `#FBE9E9` | 4.53:1 | ADR 0008 |
| `--error` `#C23A3A` / `--crema` `#FBF7F0` | 4.97:1 | ADR 0015 |
| `--error` `#C23A3A` / `--celeste-900` `#0A3D66` | **2.11:1 — falla, no usar ahí** | ADR 0015 |
| `--error-invertido` `#DE9191` / `--celeste-900` `#0A3D66` | 4.58:1 | ADR 0015 |
| `--alerta` `#9F5F00` / `--alerta-bg` `#FBF0DA` | 4.52:1 | ADR 0008 |
| `--dorado-filete` `#F2D488` / `--celeste-900` `#0A3D66` | 7.77:1 (única excepción dorado/celeste) | v1, corregido por ADR 0008 (decía 8.2:1) |
| `--texto-titulo` `#1F3B4D` / `--celeste-400` `#5DADE2` | 4.77:1 | ADR 0008 |
| `--celeste-900` `#0A3D66` (como texto) / `--celeste-400` `#5DADE2` | 4.56:1 | ADR 0008 |
| Blanco / `--celeste-600` `#1E96F5` (14px) | **3.12:1 — falla, no usar con texto** | ADR 0008 |
| Blanco / `--celeste-400` `#5DADE2` | **2.46:1 — falla, nunca** | ADR 0008 |
| `--color-accent` `#E0AC4C` / hueso `#FBF7F0` | **1.93:1 — falla, nunca texto** | ADR 0015 |
| `.au` centro `#8B6722` (vigente) / hueso | 4.85:1 | ADR 0015 |
| `--color-accent-700` `#94691A` / hueso `#FBF7F0` | 4.58:1 | ADR 0015 |
| `--color-accent-800` `#604411` / hueso `#FBF7F0` | 8.43:1 | ADR 0015 |
| `--color-accent-800` `#604411` / `--color-accent-300` `#F7DE9B` (hover) | 6.81:1 | ADR 0015 |
| `.au-dark` extremo `#E8BE63` / `--celeste-900` `#0A3D66` | 6.40:1 | ADR 0015 |
| Blanco / `--celeste-900` `#0A3D66` | 11.22:1 | ADR 0015 |
| Categorías (las 6) | 4.63:1 a 6.38:1 | ADR 0008 |
| Ligas (las 4) | 4.82:1 a 5.75:1 | ADR 0008 |
| Textos principales sobre crema | 5.98:1 a 10.98:1 | ADR 0008 |

---

## 4. Lo que esta skill NO resuelve — convocá al `brand-specialist`

- Derivar cualquier token nuevo (color, tamaño, espaciado) que no esté en la
  tabla de arriba.
- Resolver un componente que ningún documento cubre — el "caso trece" que la
  marca no previó.
- Aprobar el contraste de cualquier par **no medido todavía**, aunque
  combine dos tokens que sí están acá por separado. Esta tabla es un piso,
  no una licencia para combinar sin medir.
- Resolver un conflicto entre v1 y v2 sobre el mismo componente que la regla
  14 de arriba no alcance a cubrir.
- Extender el ornamento de v2 a un componente que v2 no cubrió
  explícitamente.
- Modo oscuro, alto contraste, o cualquier cambio real de paleta o
  tipografía — siempre un ADR nuevo, nunca esta skill ni el agente solo.

---

## Precedencia

Esta skill **consolida** los documentos de marca y los ADR; no tiene
autoridad propia. Si algo de acá contradice `sistema-de-diseno.md`,
`sistema-de-diseno-v2.md`, el ADR 0008 o el ADR 0015, **ganan ellos** — y se
corrige esta skill, no al revés. Dueño: `brand-specialist`.
