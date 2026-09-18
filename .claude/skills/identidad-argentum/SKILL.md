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
| `--celeste-50` | `#EAF4FE` | v1 | Fondo de bandas/notas. También hover de celda tabular (grilla de salas, ticket #88) |
| `--celeste-150` | `#BFE0FC` | v1 | Borde sobre fondo celeste |
| `--celeste-400` | `#5DADE2` | v1 | **Superficie, nunca fondo de texto** |
| `--celeste-600` | `#1E96F5` | v1 | Superficie/borde sin texto — no botón |
| `--celeste-700` | `#0978D0` | v1, nuevo en ADR 0008 | Único fondo de botón relleno con texto blanco (4.56:1) |
| `--celeste-text` | `#0A5FA8` | v1 | Kicker, etiquetas, links |
| `--celeste-900` | `#0A3D66` | v1 | También es el fondo de panel invertido (v2) |
| `--celeste-cinta` | `#4FA8DE` | v2 | Exclusivo de la cinta bandera del header, decorativo |

**Token descartado: `--celeste-25` (`#F5FAFF`).** Se había derivado para el
ticket #88 como fondo de reposo de la celda tabular de la grilla de salas, un
escalón más pálido que `--celeste-50` (L≈98% contra L≈95.7%). El
`brand-specialist` lo revisó al auditar el criterio de aceptación del mismo
ticket (que exigía que todo token nuevo constara en el documento fuente
correspondiente) y decidió **no** llevarlo a `docs/marca/sistema-de-diseno.md`
ni sostenerlo como extensión formal de la rampa: la diferencia con
`--celeste-50` es demasiado sutil para justificar un escalón nuevo — no se
había probado antes que los tokens existentes no alcanzaran, como pide la
sección 3 de las instrucciones del `brand-specialist`. `--blanco` (reposo) +
`--celeste-50` (hover, ya en uso) resuelven la misma necesidad de dos estados
distinguibles sin derivar nada: `--blanco` es además el fondo estándar de
tarjeta en v1 ("Tarjeta de contenido", §7), así que la celda de la grilla
queda consistente con ese patrón en vez de inaugurar uno propio. Reemplazo
pendiente de aplicar en `src/app/globals.css` (borrar la declaración de
`--color-celeste-25`) y `src/app/grilla-salas.tsx` (`bg-celeste-25` →
`bg-white`, o el token de utilidad que Tailwind genere para `--blanco`) —
ninguno de los dos es del `brand-specialist`.

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

**Gradiente `.au`** (texto/filete dorado, cifras destacadas del hero) — la
base pasó por **seis** versiones de stops, en tres vaivenes distintos, y la
vigente es la sexta (un oscurecimiento proporcional de la cuarta):

1. Handoff v2 original (**descartado**): `#6B4710…#C79331`, punto medio
   `#C79331` fallaba 2.57:1.
2. ADR 0015 (**superado**): 7 stops simétricos (0/16/34/50/66/84/100),
   centro `#8B6722`, 4.85:1 sobre `--color-bg`.
3. Pedido explícito del usuario, dos conversaciones atrás (**superado por
   el punto 4, después repuesto por el punto 5 — ver abajo**): copiar tal
   cual los 5 stops del filete dorado de 3px del header
   (`--gradiente-filete`, ver `globals.css`), con el ángulo `100deg` de
   `.au` (no el `90deg` horizontal del filete). Son **5 paradas, no 7**.
   Centro `#FFF3D0` — un dorado casi blanco, pensado para una línea
   decorativa de 3px, no para texto grande. Medía 1.04:1 sobre
   `--color-bg`. El usuario reportó que se veía "plano".
4. Pedido explícito del usuario, en la conversación siguiente: "un poco más
   oscuro" que el punto 3 (**superado por el punto 5, y ya tampoco
   vigente**). Se mantuvo la estructura de 5 stops (0/20/50/80/100) y el
   ángulo `100deg`; solo se subió el centro de `#FFF3D0` a `#D4A94A`, un
   punto intermedio entre ese extremo casi blanco y el `#8B6722` del punto
   2. Medía 2.05:1 sobre `--color-bg` — mejor que el punto 3, pero el
   usuario **volvió a reportar "plano"**, esta vez no por falta de
   contraste contra el fondo sino por falta de **salto de luminosidad
   interno** del propio degradado: de `#8A5E12` (extremo oscuro) al
   centro, el salto bajó de 5.14:1 (con `#FFF3D0`) a 2.59:1 (con
   `#D4A94A`) — a escala de texto, un salto tan chico no se percibe como
   brillo.
5. Pedido explícito del usuario, en la conversación siguiente: "vistoso y
   brilloso, como la línea dorada debajo de la bandera" (**superado por el
   punto 6**). El objetivo pasó a ser maximizar el salto de luminosidad
   interno (oscuro → casi blanco), no el contraste contra el fondo — que
   quedó como deuda aceptada de todos modos. Se repuso el centro
   `#FFF3D0` del punto 3, idéntico al de `--gradiente-filete`, con la
   misma estructura de 5 stops (0/20/50/80/100) y el mismo ángulo
   `100deg`. El punto 4 (`#D4A94A`) quedó descartado: demostró en la
   práctica que un centro intermedio sacrifica el brillo sin ganar nada
   perceptible en contraste (2.05:1 sigue fallando AA-large igual que
   1.04:1). Salto interno: 5.14:1. Contraste contra `--color-bg`: 1.04:1.
6. **Vigente**, pedido explícito del usuario en la conversación siguiente:
   "un poco más oscuro en general", pero esta vez con instrucción
   explícita de que los **5 stops bajen de luminosidad de forma
   proporcional**, no que se toque solo el centro — exactamente el error
   del punto 4. Método: los tres colores distintos del punto 5
   (`#8A5E12`, `#E0AC4C`, `#FFF3D0`) se convirtieron a HSL y se multiplicó
   la luminosidad (L) de cada uno por **0.85** (−15%), manteniendo matiz y
   saturación sin cambios:

   | Original (punto 5) | HSL original | Nuevo (vigente) |
   | --- | --- | --- |
   | `#8A5E12` | H 38.0° S 76.9% L 30.6% → L 26.0% | `#75500F` |
   | `#E0AC4C` | H 38.9° S 70.5% L 58.8% → L 50.0% | `#D99A26` |
   | `#FFF3D0` | H 44.7° S 100% L 90.8% → L 77.2% | `#FFE18B` |

   (`#D99A26` coincide con el token ya existente `--color-accent-600` —
   no es intencional, es la misma familia de dorado escalada al mismo
   punto.) Al oscurecer el centro en vez de dejarlo casi blanco, el
   contraste contra el fondo **sube** a 1.20:1 (mejor que el 1.04:1 del
   punto 5) **sin aplanar** el salto interno: extremo `#75500F` → centro
   `#FFE18B` da **5.64:1**, igual o mejor que el 5.14:1 del punto 5,
   porque escalar los tres puntos por el mismo factor preserva su
   proporción relativa — a diferencia del punto 4, que tocó un solo stop
   y rompió esa proporción.
7. **Vigente**, pedido explícito del usuario en la conversación siguiente:
   "oscurecer un poco más los dos extremos" del punto 6, con instrucción
   explícita de **no** tocar el centro (`#FFE18B`) ni el stop intermedio
   (`#D99A26`) — solo los dos extremos (`0%`/`100%`). Mismo método que el
   punto 6 (escalar L en HSL manteniendo H y S), aplicado solo al
   extremo, con un factor más suave: `#75500F` (H 38.0° S 76.9% L 26.0%)
   → **L × 0.90** → L 23.4% → **`#6A480E`**. El salto de luminosidad
   interno (extremo → centro) **sube** de 5.64:1 a **6.44:1** — se
   verificó que el matiz sigue leyéndose como bronce/dorado oscuro (H 38°
   S 76.9% intactos) y no como negro ni marrón sin saturación, que
   requeriría bajar S, no solo L. El centro y el stop intermedio no se
   tocaron, así que el contraste del centro contra `--color-bg` (1.20:1)
   y contra `--celeste-50` (1.15:1) **no cambia** respecto al punto 6 —
   sigue siendo la misma deuda aceptada de la regla de uso 16.
   `--gradiente-filete` **sigue sin tocarse**, con su extremo original
   `#8A5E12` (más claro que el `#6A480E` vigente acá), por instrucción
   explícita del usuario.
8. **Unificación de variable, primer paso** (mismo pedido, segunda parte):
   `.au` y `.shiny` repetían el mismo `linear-gradient(100deg, ...)` de 5
   stops escrito a mano dos veces. Se extrajo a una sola variable CSS,
   `--gradiente-au` (definida en `:root`, junto a `--gradiente-filete`), y
   las dos reglas la consumen con `var(...)`. En ese momento **no** se
   unificó con `--gradiente-filete`: esa variable tenía un ángulo distinto
   (`90deg` contra `100deg`) y, desde el punto 7, también valores de
   extremo distintos (`#8A5E12` en el filete contra `#6A480E` en
   `.au`/`.shiny`), con instrucción explícita del usuario de no mover el
   extremo del filete en esa tarea puntual.

9. **Unificación completa**, pedido explícito del usuario en la
   conversación siguiente: esa decisión de no unificar era para esa tarea,
   no un principio permanente, y el usuario pidió que el filete, `.au` y
   `.shiny` compartan la **misma variable de stops de color**, cada uno
   aplicando su propio ángulo. Técnica: una custom property que contiene
   **solo** la lista de stops —sin la palabra `linear-gradient()` ni el
   ángulo—, y cada consumidor arma su propio `linear-gradient(<ángulo>,
   var(...))`. La variable es `--dorado-brillante-stops`, con los valores
   vigentes de `--gradiente-au` del punto 6 (los más oscuros, no los del
   filete viejo `#8A5E12`/`#FFF3D0`, que quedan descartados):

```css
:root {
  --dorado-brillante-stops: #734A05 0%, #ECA013 20%, #FFE18B 50%, #ECA013 80%, #734A05 100%;

  --gradiente-filete: linear-gradient(90deg, var(--dorado-brillante-stops));
  --gradiente-au: linear-gradient(100deg, var(--dorado-brillante-stops));
}

.au {
  background: var(--gradiente-au);
  background-clip: text;
  -webkit-background-clip: text;
  color: var(--color-accent-700); /* fallback sólido */
}
```

   Consecuencia esperada y aceptada: el filete de 3px del header se ve un
   poco más oscuro en los bordes que antes, porque pasa de su extremo
   propio `#8A5E12` al `#6A480E` compartido — es la convergencia hacia el
   "un poco más oscuro" que en el punto 6 no se le había aplicado al
   filete por decisión explícita de esa tarea puntual, y ahora sí alcanza
   por la unificación. `--dorado-brillante-stops` es, desde esta tarea,
   **la única fuente de verdad del "dorado brillante" del sistema**:
   cualquier cambio futuro a estos colores se hace ahí una sola vez, y el
   filete, `.au` y `.shiny` heredan el cambio los tres juntos, sin
   posibilidad de que se desincronicen entre sí.

10. **Unificación de la animación, no solo del color** (esta tarea, pedido
    explícito del usuario). Compartir `--dorado-brillante-stops` (paso 8)
    igualaba el *color* del filete, `.au` y `.shiny`, pero solo `.shiny`
    tenía la segunda capa de gradiente —la banda blanca semitransparente
    que se desliza con `@keyframes shinySweep`, 3.4s ease-in-out
    infinite—: el filete y `.au` seguían siendo gradientes **estáticos**.
    Por eso, a pesar de compartir color, se percibían distintos: uno se
    veía "vivo" y los otros dos "apagados". Se extrajo la banda —antes
    escrita a mano una sola vez dentro de `.shiny`— a una variable nueva,
    `--brillo-banda` (`:root` de `globals.css`, junto a
    `--dorado-brillante-stops`), con los mismos valores que ya tenía
    `.shiny`: `linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.75)
    50%, transparent 80%)` (stops 20/50/80, opacidad de pico 0.75 — **sin
    remedir**, ver regla 15 ampliada más abajo). `.au` y `.shiny` quedaron
    **exactamente idénticas** (mismas dos capas, mismo `background-size`,
    mismo `background-blend-mode: normal, overlay`, misma animación) y se
    agruparon en un selector compuesto `.au, .shiny { ... }` en vez de
    mantener dos bloques copiados. Se agregó una tercera clase,
    `.filete-dorado`, que consume `var(--gradiente-filete)` +
    `var(--brillo-banda)` con la misma mecánica pero **sin**
    `background-clip: text` ni el `color` de fallback —esa parte es
    exclusiva de texto recortado, y el filete de 3px del header es un
    `<div aria-hidden>` de fondo, no texto (confirmado contra
    `header.tsx`)—, y `header.tsx` pasó a usarla en vez del `style={{
    background: "var(--gradiente-filete)" }}` inline que tenía antes.
    `--gradiente-filete` (base estática, sin cambios de valor) sigue
    existiendo para quien la necesite sola. Un solo `@keyframes
    shinySweep` y un solo bloque `prefers-reduced-motion` cubren los tres
    selectores (`.au, .shiny, .filete-dorado`), así que quedan
    sincronizados por construcción — no hay tres copias del keyframe para
    que se desincronicen.

    **Esto revierte una nota anterior de esta misma skill**, que decía
    "`.au` no tiene esta segunda capa: la banda de brillo es exclusiva de
    `.shiny`" (ver la fila de `.shiny` en la tabla de "Componentes y
    patrones nuevos" más abajo, corregida). Esa nota era correcta hasta
    esta tarea y queda **superada, no borrada**: el usuario pidió
    explícitamente que las tres piezas —filete, `.au`, `.shiny`— compartan
    "una sola receta de efecto shiny", color y animación.

    **Contraste: no cambia el que ya estaba medido.** Los colores base
    (`--dorado-brillante-stops`, centro `#FFE18B`) no se tocaron en esta
    tarea, así que los números de reposo de la regla 16 (1.20:1 contra
    `--color-bg`, 1.15:1 contra `--celeste-50`) siguen vigentes sin
    remedición. Lo que sí cambia es el **alcance de la deuda de la regla
    15** (el pico de brillo animado, nunca remedido contra la base
    vigente): antes esa deuda era exclusiva de `.shiny` (cifras
    decorativas del hero); desde esta tarea, `.au` —el logotipo real del
    header, texto de interfaz, no decorativo— **también** la hereda. Es
    una diferencia de peso, no solo de alcance: `.shiny` viste cifras
    grandes de titular; `.au` es el nombre de la marca en el header de
    cada pantalla. Ver la regla 15 ampliada y la fila de contraste nueva
    en la sección 3. `.filete-dorado` hereda la misma mecánica de pico,
    pero **no tiene texto encima** en el markup actual (`header.tsx`, el
    filete es un `<div>` de fondo aislado) — no hay par de contraste que
    medir ahí hasta que algún día lleve texto superpuesto, lo cual hoy no
    ocurre en ninguna pantalla.

11. **Más saturación, no más luminosidad** (esta tarea, pedido explícito
    del usuario). El pedido fue distinto de todos los anteriores: no "más
    claro" ni "más oscuro" (ese eje ya se ajustó en los pasos 6-7, arriba,
    con L en HSL), sino **más "fuerte" como color** — más saturado — por
    percibir la banda de brillo animada (`--brillo-banda`) como un lavado
    hacia blanco sobre una base "poco intensa". Método: los tres colores
    distintos de los stops (extremo, stop intermedio, centro) se
    convirtieron a HSL y se subió la **S** de cada uno **+15 puntos
    porcentuales absolutos**, dejando **H y L intactos**:

    | Stop | HSL original | HSL nuevo | Hex nuevo |
    | --- | --- | --- | --- |
    | Extremo (0%/100%) | H 37.8° S 76.7% L 23.5% | S 91.7% | `#734A05` |
    | Intermedio (20%/80%) | H 38.9° S 70.2% L 50.0% | S 85.2% | `#ECA013` |
    | Centro (50%) | H 44.5° S 100% L 77.3% | **sin cambio posible** | `#FFE18B` |

    El centro **no se movió**: con el canal rojo ya en 255 (máximo), la
    S=100% de HSL está en el límite del gamut RGB para esa L — no existe
    un dorado más saturado que `#FFE18B` a esa luminosidad. Esto confirma,
    con números, la percepción del usuario: a la luminosidad que tiene hoy
    el centro, ya está en el tope de intensidad posible: si se quiere más
    "cuerpo" ahí, el único camino es bajar la L, un eje que esta tarea
    tenía instrucción explícita de no tocar.

    El matiz (H) no se movió en ninguno de los tres stops, así que el
    dorado no deriva hacia un naranja de advertencia — gana densidad de
    color, no cambia de familia.

    **Medido de nuevo, no asumido:** subir S sí mueve la luminancia
    relativa WCAG (que no es lineal con la L de HSL). El salto de
    luminosidad interno del gradiente (extremo `#734A05` → centro
    `#FFE18B`) **baja** de 6.44:1 a **6.05:1** — el extremo más saturado
    resulta, contra lo esperable, con una luminancia relativa levemente
    más alta (0.0856 contra 0.0773 antes), no más baja. El contraste del
    centro contra `--color-bg` (1.20:1) y contra `--celeste-50` (1.15:1)
    **no cambia**, porque el centro es el único stop que no se tocó — la
    deuda de la regla 16 sigue siendo exactamente la misma, con el mismo
    número.

    Variable de esa iteración (**superada por el punto 12, ver abajo**):

    ```css
    --dorado-brillante-stops: #734A05 0%, #ECA013 20%, #FFE18B 50%, #ECA013 80%, #734A05 100%;
    ```

12. **Oscurecer el rango completo, esta vez incluido el centro** (esta
    tarea, corrección de rumbo explícita del usuario). El pedido del punto
    11 había sido "más fuerte" leído como más saturación (S), no más
    oscuro; el usuario aclaró que **no** quería más saturación —eso ya
    quedó bien resuelto— sino que el **color general fuera más oscuro**,
    un dorado oscuro, un poco más que el vigente. A diferencia de los
    puntos 6-7 (que oscurecieron solo los extremos, dejando el centro
    fijo), esta vez la instrucción fue explícita: bajar la **L** de los
    **tres** colores distintos de los stops —extremo, stop intermedio y
    también el centro—, manteniendo H y S intactos. Método: cada uno se
    convirtió a HSL y se multiplicó su L por **0.85** (−15%), el mismo
    orden de magnitud que los pasos anteriores de este ajuste:

    | Stop (punto 11) | HSL | Nuevo (vigente) |
    | --- | --- | --- |
    | Extremo (0%/100%) | H 37.6° S 91.7% L 23.5% → L 20.0% | `#623F04` |
    | Intermedio (20%/80%) | H 39.0° S 85.1% L 50.0% → L 42.5% | `#C98810` |
    | Centro (50%) | H 44.5° S 100% L 77.3% → L 65.7% | `#FFD250` |

    H y S se preservan en los tres (con la variación de redondeo propia
    de cuantizar a 8 bits por canal); el dorado sigue siendo el mismo
    matiz, ahora más oscuro en todo el rango, no solo en los bordes —a
    diferencia de los puntos 6-7, que dejaban el centro sin tocar, y del
    punto 4 (ya descartado), que tocaba solo el centro y aplanaba el
    salto interno.

    **Medido de nuevo, no asumido:**
    - Salto de luminosidad interno (extremo `#623F04` → centro `#FFD250`):
      **sube** de 6.05:1 a **6.53:1** — se mantiene estable en el mismo
      orden que antes, como correspondía a escalar los tres stops por el
      mismo factor proporcional.
    - Contraste del centro contra `--color-bg` `#FBF7F0`: **mejora** de
      1.20:1 a **1.35:1** — sigue sin alcanzar AA-large (3:1), pero es la
      primera vez que este número mejora por el propio centro
      oscureciéndose, no por casualidad de qué stop se tocó.
    - Contraste del centro contra `--celeste-50` `#EAF4FE`: **mejora** de
      1.15:1 a **1.29:1**, mismo motivo.

    Variable final vigente:

    ```css
    --dorado-brillante-stops: #623F04 0%, #C98810 20%, #FFD250 50%, #C98810 80%, #623F04 100%;
    ```

`.shiny` comparte esta misma base, incluido el centro `#FFD250` vigente
(ver `globals.css`); antes del punto 9 era la única con la segunda capa
de brillo animado — desde el punto 9, `.au` y `.filete-dorado` la
comparten también.

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

### Acento morado de repaso (ticket #91, formalizado por el `brand-specialist`)

**No es una categoría de contenido.** Es un acento puntual para "dominio/
temática de la tarjeta" en la pantalla de repaso (tag del frente, badge
"Respuesta revelada" del dorso) — el ticket #91 pedía explícitamente no usar
dorado ni celeste ahí, porque esos dos ya tienen significado propio.

| Token | Valor | Fuente |
| --- | --- | --- |
| `--color-acento-repaso-100` | `#EDE4F5` | Ticket #91, formalizado en `globals.css` |
| `--color-acento-repaso-700` | `#6B3FA0` | Ticket #91, formalizado en `globals.css` |

**⚠️ Riesgo documentado, no bloqueante:** el matiz queda muy cerca del de la
categoría "Animales" (`#5A45A0`/`#EFEAFB`, tabla de arriba) — no es el mismo
token, pero en una tarjeta de "Próceres" o "Comidas" puede leerse de reojo
como si fuera el color de "Animales". No se resolvió corriendo el matiz por
iniciativa propia (un octavo tono no es claramente mejor que la colisión que
evita); queda para que `frontend-specialist` evalúe si conviene, a futuro,
repasar con el color real de la categoría (`--color-cat-*`) en vez de un
acento fijo único.

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
| Kickers de sección | Cormorant Garamond, peso 600 | Sin cambios de v1. **Excepción puntual documentada:** el kicker del hero de home (`src/app/hero.tsx`, "Catálogo general · Edición 2026") usa Lora (`font-cuerpo`, peso `medium`) en lugar de Cormorant Garamond, por decisión explícita del usuario — no un cambio de la regla general. Tamaño, tracking y color (`--celeste-text`) no cambiaron, así que el contraste ya medido en esta skill sigue vigente sin remedición. No repliques esta excepción a otros kickers sin que se pida explícitamente. |
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
| Filete dorado bajo la cinta | 3px, clase `.filete-dorado` (`globals.css`) — **dos capas de `background-image`**: `var(--gradiente-filete)` (arma `linear-gradient(90deg, var(--dorado-brillante-stops))`, la misma variable de stops que `.au`/`.shiny`, con su propio ángulo `90deg`) + `var(--brillo-banda)`, la misma banda de brillo animada que `.au`/`.shiny`, con `@keyframes shinySweep` compartido. **Sin** `background-clip: text` ni color de fallback — es un fondo (`<div aria-hidden>`), no texto recortado. Antes de esta tarea era un gradiente estático inline en `header.tsx` (`style={{ background: "var(--gradiente-filete)" }}`); ahora `header.tsx` usa la clase. `--gradiente-filete` sigue existiendo, sin cambios de valor, para quien la necesite sola (sin brillo animado) | v2 + ADR 0015 (color), unificación de animación a pedido explícito del usuario en esta tarea |
| `.au`, `.shiny` | **Selector compuesto, idénticas desde esta tarea** (antes dos bloques separados y `.au` sin animación). Doble `background-image`: `var(--gradiente-au)` + `var(--brillo-banda)`, `background-blend-mode: normal, overlay`, `background-clip: text` + `color` de fallback + `@keyframes shinySweep` 3.4s — **obligatorio** detenerlo con `prefers-reduced-motion: reduce` (bloque único que cubre las dos más `.filete-dorado`). Banda de brillo en stops `20%/50%/80%` (60% de ancho), opacidad de pico `0.75` — ese cálculo de pico se hizo contra la base de 7 stops del ADR 0015 (centro `#8B6722`) y quedó **desactualizado** en cada base que pasó por acá desde entonces (`#FFF3D0`, `#D4A94A`, de nuevo `#FFF3D0`, y ahora el centro vigente `#FFE18B`); sigue sin remedirse, ver regla de uso 15 (ampliada en esta tarea) y la nota de contraste en sección 3. **Nota histórica superada:** hasta esta tarea, `.au` no tenía la segunda capa de brillo — era exclusiva de `.shiny` —; el usuario pidió unificar también la animación, no solo el color, y ahora las dos reglas son la misma | v2 + extensión, unificado a pedido explícito del usuario en esta tarea |
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
5. Los stops del gradiente dorado brillante son los **vigentes desde esta
   tarea**: `#623F04 0% · #C98810 20% · #FFD250 50% · #C98810 80% ·
   #623F04 100%`, expuestos como la variable CSS única
   `--dorado-brillante-stops` (`:root` de `globals.css`, solo la lista de
   stops, sin `linear-gradient()` ni ángulo) — un oscurecimiento
   proporcional de **los tres** colores distintos (extremo, intermedio y,
   a diferencia de rondas anteriores, también el centro), L×0.85 en HSL
   sobre la iteración anterior, manteniendo H y S intactos. Ni el punto
   medio `#6B4710…#C79331` del handoff v2 original, ni los 7 stops
   simétricos que había fijado el ADR 0015 (centro `#8B6722`), ni el
   centro intermedio `#D4A94A` de una iteración anterior, ni las bases
   previas con extremo `#8A5E12`, `#75500F`, `#6A480E` o `#734A05` (esta
   última con el intermedio `#ECA013` y el centro `#FFE18B`, la
   iteración inmediatamente anterior, más saturada pero no más oscura) —
   todas superadas. Desde el punto 8 (sección 1), `--gradiente-filete`
   (`90deg`), `--gradiente-au` (`100deg`, consumida por `.au`) y `.shiny`
   (misma base que `.au`) arman cada uno su propio
   `linear-gradient(<ángulo>, var(--dorado-brillante-stops))`: **una sola
   fuente de verdad** para los tres. Ver el historial completo en la
   sección 1 (puntos 6-12).
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
15. El pico de la banda de brillo (`--brillo-banda`) **sigue sin remedirse
    contra la base vigente** (regla 16), y desde esta tarea la deuda **ya
    no es exclusiva de `.shiny`**: `.au` la comparte, porque el usuario
    pidió unificar también la animación, no solo el color (ver sección 1,
    paso 10 del historial de `.au`). El último número medido —**1.81:1**
    con la opacidad vigente 0.75— se calculó contra la base de 7 stops del
    ADR 0015 (centro `#8B6722`) y quedó desactualizado en cada una de las
    bases que pasaron por acá desde entonces (`#FFF3D0`, `#D4A94A`, de
    nuevo `#FFF3D0`, y ahora `#FFE18B`, vigente). La relación
    opacidad/contraste es monótona en contra en todas: pedir más brillo
    siempre baja el número, porque el pico se acerca al blanco y
    `--color-bg` también es casi blanco. No se replica este criterio a
    texto estático ni a ningún otro componente sin la misma combinación de
    condiciones — es específico de este efecto, y remedir el pico contra
    `#FFE18B` queda como trabajo pendiente si se vuelve a tocar `.shiny`
    **o `.au`**.

    **Por qué `.au` pesa más que `.shiny` en esta deuda:** `.shiny` viste
    cifras destacadas del hero — decorativas, de titular, no texto de
    lectura. `.au` es el logotipo "ARGENTUM" del header, sitewide, en
    todas las pantallas — más cerca de texto de interfaz real que de un
    adorno puntual. La misma mitigación que ya se aceptaba para `.shiny`
    (elemento decorativo/de titular, no de lectura corrida) se estira más
    para `.au`; sigue siendo una decisión ya tomada por el usuario al
    pedir la unificación, no algo que esta skill decida por su cuenta,
    pero si se juzga que la deuda cruza la línea de necesitar remedición
    prioritaria o un ADR, es una decisión del `super-architect`, no de
    esta skill.

    **`.filete-dorado` no hereda esta preocupación de contraste**: la
    misma banda de brillo pasa por su fondo, pero en el markup actual
    (`header.tsx`) es un `<div aria-hidden>` sin texto encima — no hay par
    de contraste texto/fondo que medir ahí. Si algún día el filete lleva
    texto superpuesto, esa combinación necesita su propia medición antes
    de aprobarse; hoy no ocurre en ninguna pantalla.
16. La base del gradiente `.au`/`.shiny` (regla 5) **no pasa AA en
    reposo**, sin brillo, con ninguno de los centros que se probaron. La
    conversación pasó por varios vaivenes sobre el mismo valor: primero el
    centro `#FFF3D0` copiado del filete (**1.04:1** sobre
    `--color-bg`/`--color-crema`, **~1.01:1** sobre `--celeste-50` — muy
    por debajo incluso de AA-large), el usuario pidió "un poco más
    oscuro" y se subió a `#D4A94A` (**2.05:1** sobre `--color-bg`, **1.97:1**
    sobre `--celeste-50` — mejor pero seguía sin llegar a AA-large), después
    el usuario pidió explícitamente volver al efecto brilloso del filete
    (centro de nuevo `#FFF3D0`, **1.04:1**/`~1.01:1`, mismo número que la
    primera ronda), y en esta tarea el usuario volvió a pedir "un poco más
    oscuro en general" — esta vez con la instrucción explícita de escalar
    los **5 stops proporcionalmente** en vez de tocar solo el centro,
    justamente para no repetir el aplanamiento del intento con `#D4A94A`.
    El centro **vigente es `#FFD250`** (extremo `#623F04`, ver sección 1
    punto 12): **1.35:1 sobre `--color-bg`/`--color-crema`** y **1.29:1
    sobre `--celeste-50`** (ver sección 3) — sigue sin pasar AA-large,
    pero mejora sobre el 1.20:1/1.15:1 de la iteración anterior (centro
    `#FFE18B`), porque el punto 12 fue la primera vez que el centro
    también se oscureció en lugar de quedar fijo mientras se ajustaban
    los extremos. El salto de luminosidad interno tampoco se aplanó: subió
    de 6.05:1 a **6.53:1**, porque escalar los tres puntos por el mismo
    factor conserva su proporción relativa en vez de comprimirla — el
    mismo principio que ya había probado su valor en el punto 6.
    Se acepta como **deuda aceptada explícitamente por el usuario**, con
    la misma lógica de mitigación de la regla 15: `.au` y `.shiny` visten
    un logotipo institucional y cifras destacadas grandes —elementos
    decorativos/de titular, no texto de lectura corrida—, así que el
    criterio de contraste de texto de cuerpo no aplica con la misma
    severidad. A diferencia de la regla 15 (deuda transitoria, ligada a un
    efecto de brillo puntual), esta es una **deuda permanente mientras la
    base tenga este centro**: no hay componente de movimiento que la
    esconda. Si esto se juzga que cruza la línea de necesitar un ADR nuevo
    en vez de una nota acá, es una decisión del `super-architect`, no de
    esta skill. **Nota para la próxima persona que lea esta skill:** el
    valor pasó por `#FFF3D0` → `#D4A94A` → `#FFF3D0` → `#FFE18B` (este
    último derivado del `#FFF3D0` por escalado proporcional, no un cuarto
    valor independiente); antes de tocarlo de nuevo, confirmá con el
    usuario si prioriza brillo interno, contraste contra el fondo, o un
    oscurecimiento general — son ejes que pueden tensionar entre sí, y el
    método de escalado proporcional en HSL es el que mejor los concilia
    de los probados hasta ahora con esta paleta de extremos
    (`#75500F`/`#D99A26`, antes `#8A5E12`/`#E0AC4C`).

    **Actualización (punto 7 de la sección 1):** el usuario pidió después
    oscurecer *solo* el extremo (`#75500F` → `#6A480E`), dejando el centro
    intacto. Como esta regla mide el par centro-contra-fondo, **los dos
    números de esta regla no cambian**: siguen siendo 1.20:1 y 1.15:1. El
    extremo no es el término de ninguno de esos dos pares — es el término
    del salto de luminosidad interno de la regla 5, que sí subió (a
    6.44:1). No confundir ambas mediciones: "contraste del centro contra
    el fondo" (esta regla, deuda de AA) y "salto interno extremo→centro"
    (regla 5, criterio de percepción de brillo, no de AA) son ejes
    independientes.

    **Actualización (punto 11 de la sección 1):** el usuario pidió después
    subir la **saturación** del extremo y del stop intermedio (+15pp de S
    en HSL, `#6A480E`→`#734A05`, `#D99A26`→`#ECA013`), sin tocar el centro
    `#FFE18B` — no había margen para subirle S sin bajar su L (ya está en
    el límite del gamut RGB). Como el centro sigue sin tocarse, **los dos
    números de esta regla tampoco cambian con este ajuste**: siguen siendo
    1.20:1 y 1.15:1. Lo que sí cambió fue el salto interno de la regla 5,
    que esta vez **bajó** (de 6.44:1 a 6.05:1) — subir S en el extremo
    resultó, contra lo esperable, en una luminancia relativa WCAG
    levemente más alta, no más baja.

    **Actualización (punto 12 de la sección 1, esta tarea):** el usuario
    corrigió el rumbo del punto 11 — no quería más saturación (eso ya
    había quedado bien), quería el color general **más oscuro**. Esta vez
    bajó la L de los **tres** stops (extremo, intermedio y centro),
    L×0.85 en HSL, manteniendo H y S. Como el centro **sí** se tocó por
    primera vez desde el punto 6, **los dos números de esta regla
    cambian**: pasan de 1.20:1/1.15:1 a **1.35:1/1.29:1** (mejoran, sin
    llegar a AA-large todavía). El salto interno de la regla 5 también
    subió, de 6.05:1 a 6.53:1, consistente con escalar los tres puntos
    proporcionalmente en vez de tocar uno solo.

---

## 3. Contraste verificado (todos los pares medidos)

| Par | Contraste | Fuente |
| --- | ---: | --- |
| `--celeste-text` `#0A5FA8` / `--celeste-50` `#EAF4FE` | 5.87:1 | ADR 0015 |
| `--celeste-text` `#0A5FA8` / `--crema` `#FBF7F0` | 6.12:1 | `brand-specialist`, ticket header (#0A5FA8 sitewide en header/nav) |
| `--texto-titulo` `#1F3B4D` / `--blanco` `#FFFFFF` (reposo de celda) | 11.72:1 | `brand-specialist`, ticket #88 — reemplaza la medición contra `--celeste-25` (descartado) |
| `--texto-secundario` `#6B5D4A` / `--blanco` `#FFFFFF` (reposo de celda) | 6.38:1 | `brand-specialist`, ticket #88 — reemplaza la medición contra `--celeste-25` (descartado) |
| `--texto-terciario` `#7E705D` / `--celeste-50` `#EAF4FE` (hover de celda) | **4.33:1 — falla AA**, texto de 10px | `brand-specialist`, ticket #88. No usar `--texto-terciario` sobre `--celeste-50`; usar `--texto-secundario` (5.73:1 sobre `--celeste-50`, 6.38:1 sobre `--blanco`), que pasa en los dos estados. El componente real (`grilla-salas.tsx`) ya usa `--texto-secundario` en el caption, no `--texto-terciario` — este hallazgo es preventivo, no un bug encontrado en código |
| `--celeste-700` `#0978D0` (foco) / `--blanco` `#FFFFFF` (reposo de celda) | 4.56:1 (no-texto, piso 3:1) | `brand-specialist`, ticket #88 — reemplaza la medición contra `--celeste-25` (descartado). Contra `--celeste-50` (hover) sigue siendo 4.34:1, sin cambios |
| `--color-acento-repaso-700` `#6B3FA0` / `--color-acento-repaso-100` `#EDE4F5` | 5.98:1 | `brand-specialist`, ticket #91 (pill de dominio, frente y dorso) |
| `--color-acento-repaso-700` `#6B3FA0` / `--color-blanco` `#FFFFFF` | 7.38:1 | `brand-specialist`, ticket #91 (stat "Dominio de esta ficha") |
| Blanco / `--color-error` `#C23A3A` (botón "Falso", texto 14px) | 5.30:1 | `brand-specialist`, ticket #91 |
| Blanco / `--color-ok` `#2E7C5A` (botón "Verdadero", texto 14px) | 5.07:1 | `brand-specialist`, ticket #91 |
| `--texto-titulo` `#1F3B4D` / `--celeste-50` `#EAF4FE` | 10.54:1 | `brand-specialist`, ticket #65 |
| `--texto-secundario` `#6B5D4A` / `--celeste-50` `#EAF4FE` | 5.74:1 | `brand-specialist`, ticket #65 |
| Blanco / `--celeste-700` `#0978D0` | 4.56:1 | ADR 0008 |
| `--dorado-text` `#9A6900` / `--dorado-bg` `#FFF8E8` | 4.52:1 | ADR 0008 |
| `--dorado-text` `#9A6900` / Blanco `#FFFFFF` | 4.78:1 | `brand-specialist`, ticket #65 (ya medido en `globals.css:117-126`, no estaba en esta tabla) |
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
| `.au`/`.shiny` centro `#8B6722` (ADR 0015, **superado**) / hueso | 4.85:1 — pasaba AA | ADR 0015, ya no vigente |
| `.au`/`.shiny` centro `#FFD250` (**vigente**, L×0.85 de `#FFE18B`, esta vez incluido el centro) / `--color-bg` `#FBF7F0` | **1.35:1 — falla, sigue por debajo de AA-large (3:1)**, pero mejora sobre el 1.20:1 anterior — deuda aceptada explícitamente, ver regla de uso 16 | `brand-specialist`, corrección de rumbo explícita del usuario ("no más saturación, más oscuro en general", proporcional a los tres stops) |
| `.au`/`.shiny` centro `#FFD250` (vigente) / `--celeste-50` `#EAF4FE` | **1.29:1 — falla**, mejora sobre el 1.15:1 anterior (banda que hoy no lo usa: `.au` va sobre `--color-crema`, `.shiny` sobre `--color-blanco`; se mide igual por si se aplicara ahí) | `brand-specialist`, corrección de rumbo explícita del usuario |
| `.au`/`.shiny` centro `#FFE18B` (**superado**, iteración inmediatamente anterior, más saturada, no más oscura) / `--color-bg` `#FBF7F0` | 1.20:1 — falla | `brand-specialist`, superado en esta misma conversación |
| `.au`/`.shiny` centro `#FFE18B` (superado) / `--celeste-50` `#EAF4FE` | 1.15:1 — falla | `brand-specialist`, superado |
| `.au`/`.shiny` centro `#FFF3D0` (**superado**, iteración inmediatamente anterior) / `--color-bg` `#FBF7F0` | 1.04:1 — falla, muy por debajo incluso de AA-large (3:1) | `brand-specialist`, superado en esta misma conversación |
| `.au`/`.shiny` centro `#FFF3D0` (superado) / `--celeste-50` `#EAF4FE` | ~1.01:1 — falla | `brand-specialist`, superado |
| `.au`/`.shiny` centro `#D4A94A` (**superado, intento intermedio, no proporcional**) / `--color-bg` `#FBF7F0` | 2.05:1 — falla, sigue por debajo de AA-large (3:1); salto de luminosidad interno del degradado bajó a 2.59:1 (contra 5.14:1 con `#FFF3D0`), lo que el usuario percibió como "plano" en la práctica | `brand-specialist`, intento superado en una conversación anterior |
| `.au`/`.shiny` centro `#D4A94A` (superado) / `--celeste-50` `#EAF4FE` | 1.97:1 — falla | `brand-specialist`, intento superado |
| Salto de luminosidad interno de `.au`/`.shiny` (**vigente**): `#623F04` (extremo, `--gradiente-au` 0%/100%, L×0.85 sobre `#734A05`) → centro vigente `#FFD250` | **6.53:1** — sube respecto al 6.05:1 de la iteración anterior: escalar los tres stops (extremo, intermedio y centro) por el mismo factor de L conserva su proporción relativa en vez de comprimirla, el mismo principio que ya se había probado en el punto 6. Matiz verificado: H 37.6° S 91.7% intactos, se sigue leyendo dorado/bronce oscuro | `brand-specialist`, corrección de rumbo explícita del usuario ("un poco más oscuro en general", proporcional a los tres stops) |
| Salto de luminosidad interno de la iteración anterior (**superado**): `#734A05` (extremo, S+15pp sobre `#6A480E`) → centro `#FFE18B` | 6.05:1 — bajaba respecto al 6.44:1 previo: subir la saturación del extremo (H y L intactos) resultaba, contra lo esperable, en una luminancia relativa WCAG levemente más alta (0.0856 contra 0.0773), no más baja | `brand-specialist`, superado |
| Salto de luminosidad interno de la iteración anterior (**superado**): `#6A480E` (extremo, `--gradiente-au` 0%/100%) → centro vigente `#FFE18B` | 6.44:1 — sube respecto al 5.64:1 del extremo anterior (`#75500F`) porque oscurecer solo el extremo, sin tocar el centro, agranda la distancia entre los dos. Matiz verificado: H 38° S 76.9% intactos, se sigue leyendo dorado/bronce oscuro, no negro ni marrón sin saturación | `brand-specialist`, pedido explícito del usuario ("oscurecer un poco más los dos extremos"), superado en la tarea siguiente |
| Salto de luminosidad interno del extremo anterior (**superado**): `#75500F` → centro `#FFE18B` | 5.64:1 — igual o mejor que el 5.14:1 de la base previa (`#8A5E12`→`#FFF3D0`), porque el escalado proporcional en HSL (L×0.85, mismo H y S en los tres stops) conserva la relación de luminosidad entre extremo y centro en vez de comprimirla | `brand-specialist`, superado |
| Salto de luminosidad interno de la base previa: `#8A5E12` (extremo) → centro `#FFF3D0` (**superado**) | 5.14:1 — era el máximo que permitía la paleta propia que tenía `--gradiente-filete` **antes** de la unificación completa de esta tarea. Esa paleta (`#8A5E12`/`#E0AC4C`/`#FFF3D0`) queda descartada: el filete ahora arma su gradiente desde `--dorado-brillante-stops`, la misma variable que `.au`/`.shiny`, así que su salto interno vigente es el de la primera fila de arriba (6.05:1), no este | `brand-specialist`, referencia histórica |
| Filete dorado del header (**vigente**): extremo `#623F04` (`--dorado-brillante-stops`) / `--celeste-900` `#0A3D66` | **1.19:1 — muy por debajo de AA**, baja respecto al 1.45:1 de la iteración anterior (`#734A05`): el extremo se oscureció, así que su distancia a un fondo también oscuro (`--celeste-900`) se achica. El filete es decorativo (`aria-hidden`, sin texto encima) y en el header real corre sobre `--color-crema`, no sobre `--celeste-900` — esta medición es de referencia, por si el filete se usara alguna vez sobre un panel invertido, no una aprobación de uso real | `brand-specialist`, medido para esta tarea |
| Filete dorado del header (vigente): centro `#FFD250` (`--dorado-brillante-stops`) / `--celeste-900` `#0A3D66` | **7.79:1 — pasa AA con margen amplio**, baja respecto al 8.76:1 anterior (el centro se oscureció), misma salvedad que la fila de arriba: es una medición de referencia sobre un fondo que el filete no usa hoy, no una aprobación de uso real | `brand-specialist`, medido para esta tarea |
| Pico de la banda de brillo (blanco 0.75 opacidad, overlay sobre el centro de la base) ≈ `rgb(226,180,60)` (medido contra la base de 7 stops del ADR 0015, centro `#8B6722`) / hueso | **1.81:1 — falla** (desactualizado desde entonces; tampoco remedido contra el centro `#FFD250` vigente de esta tarea). Hasta el paso 9 era una medición exclusiva de `.shiny`; desde la unificación de la animación (sección 1, paso 9 de `.au`), el mismo pico —sin remedir— corre también sobre `.au` (logotipo real del header) y sobre `.filete-dorado` (sin texto encima, no aplica par de contraste) | `brand-specialist`, pedido de más brillo, ver regla de uso 15 |
| `--color-accent-700` `#94691A` / hueso `#FBF7F0` | 4.58:1 | ADR 0015 |
| `--color-accent-800` `#604411` / hueso `#FBF7F0` | 8.43:1 | ADR 0015 |
| `--color-accent-800` `#604411` / `--color-accent-300` `#F7DE9B` (hover) | 6.81:1 | ADR 0015 |
| `.au-dark` extremo `#E8BE63` / `--celeste-900` `#0A3D66` | 6.40:1 | ADR 0015 |
| Blanco / `--celeste-900` `#0A3D66` | 11.22:1 | ADR 0015 |
| Categorías (las 6) | 4.63:1 a 6.38:1 | ADR 0008 |
| Ligas (las 4) | 4.82:1 a 5.75:1 | ADR 0008 |
| Textos principales sobre crema | 5.98:1 a 10.98:1 | ADR 0008 |

**Nota de unificación (reemplaza dos duplicaciones anteriores):** el filete
del header, `.au` y `.shiny` ya no tienen cada uno su propia copia de
stops de color — los tres arman su `linear-gradient(<ángulo>, ...)` a
partir de una sola variable, `--dorado-brillante-stops` (`:root` de
`globals.css`, solo la lista de stops, sin `linear-gradient()` ni ángulo).
`--gradiente-filete` la consume con `90deg`, `--gradiente-au` (que a su vez
consumen `.au` y `.shiny`) con `100deg`. **No la bifurques de nuevo**: si
necesitás tocar el dorado brillante del sistema, cambiá
`--dorado-brillante-stops` una sola vez y los tres consumidores heredan el
cambio. Esta es, desde esta tarea, **la única fuente de verdad** de este
color — antes de esta unificación el filete tenía su propia paleta más
clara (`#8A5E12`/`#E0AC4C`/`#FFF3D0`), y esa paleta queda descartada, no
en paralelo.

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
