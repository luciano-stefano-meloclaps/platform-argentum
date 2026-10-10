# 0028 — El dorado brillante es ornamento, su brillo dura una sola pasada, y las cifras se leen en un dorado AA

- **Estado:** Aceptado — **supersede parcialmente** al
  [ADR 0015](0015-identidad-visual-argentum-v2.md) en dos puntos:
  - la fila «Gradiente `.au`, stop 50%» de la tabla de correcciones de su §3;
  - el alcance y la duración del brillo animado. Según
    `docs/marca/sistema-de-diseno-v2.md` §5, `.shiny` estaba «reservado para
    cifras destacadas del hero» y era infinito.

  El resto del 0015 sigue vigente sin cambios.
- **Fecha:** 2026-10-04
- **Decide:** el usuario; **redacta:** el `super-architect`; **revisaron:** el
  `brand-specialist` y el `ui-reviewer`

## Decisión

1. **Dónde va el dorado brillante.** El gradiente `--dorado-brillante-stops`
   (centro `#FFD250`) y su banda de brillo van **solo donde no hay texto que
   deba cumplir contraste**. Eso es:
   - el logotipo, exento por WCAG 1.4.3;
   - los numerales que cumplen las dos condiciones del rol (ver abajo);
   - los dos filetes vigentes: el del header y el divisor del hero.
2. **Qué pasa con lo que se lee.** Toda cifra o texto que transmite
   información se pinta en un dorado de al menos 4.5:1 contra su fondo real,
   sin banda de brillo. En particular, las cifras del hero dejan de usar
   `.shiny`.
3. **Cuánto dura el brillo.** Es **finito**: una sola pasada, que termina antes
   de los cinco segundos.

## Contexto

El ADR 0015 adoptó la identidad v2 y corrigió el centro del gradiente `.au`
para su uso declarado, que era el texto de las cifras del hero: de `#C79331`
(2.57:1) a `#8B6722` (4.85:1 sobre `--color-crema`, el fondo de página).

Después de ese ADR el código cambió en tres pasos, todos por pedido explícito
del usuario, que registra el historial de `src/app/globals.css`:

1. `.au`, `.shiny` y `.filete-dorado` pasaron a compartir una sola paleta,
   `--dorado-brillante-stops`
   (`#623F04 0%, #C98810 20%, #FFD250 50%, #C98810 80%, #623F04 100%`).
2. Los tres pasaron a compartir la animación `shinySweep`: 3.4 s, infinita, con
   `animation: none` bajo `prefers-reduced-motion: reduce`.
3. El centro quedó en `#FFD250`, más claro que el valor que el 0015 había
   rechazado.

Resultado: el 0015 dice `#8B6722` y el código pinta `#FFD250`. Con la fórmula
de luminancia relativa de WCAG, `#FFD250` da **≈1.35:1 sobre `--color-crema`**
y **≈1.44:1 sobre `--color-blanco`**. El comentario de `globals.css` (línea
265) mide 1.37:1 sobre `--color-tarjetas-carta-provisorio`. Como texto que hay
que leer no pasa ni el piso de 3:1 del texto grande.

Usos del dorado en el árbol, citados por archivo y selector:

| Dónde | Qué es | ¿Se lee? |
| ----- | ------ | -------- |
| `header.tsx`, `.au` del logotipo | Logotipo «ARGENTUM» | Es texto, pero exento por 1.4.3 (logotipo) |
| `header.tsx`, `.filete-dorado` bajo la cinta | Filete | No es texto |
| `hero.tsx`, los dos `.filete-dorado` del divisor | Filete | No es texto |
| `grilla-salas.tsx`, `.au` del numeral de sala (`aria-hidden`) | Numeral | Decorativo **si** cumple las dos condiciones del rol (ver abajo) |
| `tarjetas-repaso.tsx`, `.au` de los numerales de esquina (`aria-hidden`) | Numeral | Decorativo: el orden ya lo dice «Tarjeta N de M», en texto visible y AA |
| `estadisticas-catalogo.tsx`, `.shiny` del `<dd>` | **Cifras del hero** | **Sí. Es el único texto que se lee y hoy usa el dorado brillante** |
| `tarjetas-repaso.tsx`, `<h1>` «Tarjeta N» | Título | Sí. Ya cumple AA: `--color-tarjetas-dorado-provisorio` `#8A5E12`, 5.33:1 crema / 5.69:1 blanco, sin brillo |
| `tarjetas/franja-de-datos.tsx`, valor «Racha actual» | Cifra | Sí. Ya cumple AA, con el mismo token y sin brillo |

El resto del dorado legible del sistema ya cumple AA: `--color-accent-700` y
`-800`, `--dorado-text`, `--color-tarjetas-dorado-provisorio` y `.au-dark`
sobre panel invertido.

## Problema

Una sola paleta sirve hoy a dos usos con requisitos opuestos. El ornamento
quiere el dorado más luminoso posible. El texto informativo necesita
contraste. El 0015 resolvió el conflicto oscureciendo el gradiente para todos;
el pedido estético posterior lo aclaró para todos. Ninguna de las dos cosas
sirve a los dos usos a la vez, y mientras compartan paleta, cada ajuste de uno
rompe al otro. Eso ya pasó una vez.

Hay un segundo problema. La animación infinita del logotipo y del filete corre
en el header de **todas** las páginas. Eso entra de lleno en el criterio WCAG
2.2.2 *Pause, Stop, Hide* (nivel A), que pide un mecanismo de pausa para todo
movimiento que:

- empieza solo;
- **dura más de cinco segundos**;
- se presenta junto a otro contenido.

Un brillo decorativo no es esencial, así que no aplica la excepción.
`prefers-reduced-motion` no alcanza: el documento *Understanding SC 2.2.2* del
W3C no lo cuenta entre sus técnicas suficientes, y solo protege a quien activó
esa preferencia en su sistema. Fuente:
<https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>.

## Alternativas consideradas

**Sobre el color:**

### A. Volver al 0015: oscurecer la paleta compartida
El centro vuelve a `#8B6722` o a otro valor que pase AA. Todo, incluido el
logotipo, pierde el brillo que pidió el usuario.

### B. Mantener `#FFD250` en todo y aceptar el incumplimiento
Las cifras del hero quedan en ≈1.4:1.

### C. Separar por rol
El dorado brillante va solo en el ornamento. Lo informativo va en un dorado AA
sin banda de brillo.

**Sobre la animación:**

### D. Mantenerla infinita y aceptar el riesgo de 2.2.2

### E. Animación finita, que termina antes de los cinco segundos

### F. Sin animación, con el gradiente estático

### G. Un control de pausa

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A | Un solo dorado, y cumple AA en todo | Deshace un pedido estético explícito; el logotipo no necesita contraste y paga igual | Bajo |
| B | Cero trabajo | Las cifras del hero no se leen bien: incumple un requisito vigente (ADR 0016, Regla 10) | Bajo |
| **C** | Cada uso recibe lo que necesita; el ornamento se puede ajustar sin romper la lectura | Dos dorados que hay que distinguir por rol | Bajo |
| D | Conserva el efecto tal cual | Incumplimiento de nivel A en todas las páginas | Bajo |
| **E** | Conserva el brillo al cargar y queda fuera del criterio por su propio texto normativo | El brillo deja de verse después de la primera pasada | Bajo |
| F | Cumple sin condiciones | Pierde el efecto que pidió el usuario | Bajo |
| G | Cumple con el efecto infinito | Un control en el header para un brillo decorativo es desproporcionado | Medio |

## Decisión elegida

**C para el color y E para la animación**, la segunda elegida explícitamente
por el usuario.

### 1. Los roles del dorado brillante

`--dorado-brillante-stops` y la banda de brillo se usan **solo** en estos tres
roles:

1. **El logotipo.** Es texto, pero está exento de 1.4.3.
2. **Numerales que cumplen las dos condiciones a la vez:**
   - la información que transmiten ya está presente en texto visible que
     cumple AA (como «Tarjeta N de M» para el numeral de esquina de la carta);
   - están marcados con `aria-hidden="true"`.

   `aria-hidden` solo no vuelve decorativo un numeral: lo esconde de un lector
   de pantalla, pero quien ve lo sigue leyendo.
3. **Los filetes vigentes:** el de 3 px bajo la cinta del header y el divisor
   del hero (`.filete-dorado`).

**Estos tres roles son un techo, no una autorización.** Un uso nuevo, además
de caer en uno de ellos, tiene que estar cubierto por la identidad v2 y por
las reglas de uso de la skill `identidad-argentum`. En particular, un filete
nuevo fuera de los dos vigentes no se justifica con este ADR.

Para estos roles, el centro del gradiente no tiene requisito de contraste. Su
valor vigente es el del código (`#FFD250`), no el de la tabla del 0015.

### 2. Lo informativo

Toda cifra o texto que se lee usa un dorado de **al menos 4.5:1 contra el
fondo real donde se pinta**. Si es un gradiente, el umbral vale para el peor
punto. Lo informativo **no lleva banda de brillo**: la banda se mezcla en
`overlay`, aclara el dorado mientras pasa y le baja el contraste en ese
momento.

**El umbral es más estricto que WCAG, a propósito.** Las cifras del hero miden
38 px con peso 400, así que para WCAG son texto grande y el piso sería 3:1. Se
exige 4.5:1 igual, por dos razones:

- la cifra está en Cormorant Garamond, de trazos muy finos, y el documento
  *Understanding SC 1.4.3* advierte que los trazos finos rinden menos contraste
  efectivo que el que da la medición del color;
- el ADR 0008 declaró como contexto real del producto las pantallas de bajo
  brillo.

Nadie baja este umbral a 3:1 alegando que es texto grande. Es el mismo umbral
y el mismo método del 0008 y el 0015.

**Qué dorado exacto** usan las cifras —sólido o gradiente estático— lo elige
el `brand-specialist` con ese criterio, y lo registra en la skill
`identidad-argentum`. `--color-accent-700` (`#94691A`, 4.89:1 sobre
`--color-blanco`, el fondo del `<dl>` del hero) ya está medido y cumple. No
hace falta un ADR para elegirlo.

### 3. `.shiny`

Se queda sin consumidor: es la misma regla que `.au` con otro nombre. Se
retira de `globals.css`, **incluido su selector en el bloque de
`prefers-reduced-motion`**.

### 4. La animación: una sola pasada

Condiciones que tiene que cumplir el brillo animado:

1. **`animation-iteration-count: 1`.** Hoy es `infinite`.
2. **El retardo más la duración suman menos de cinco segundos.** Hoy son 3.4 s
   sin retardo, y cumple.
3. **Todos los consumidores arrancan a la vez.** Nada encadenado ni escalonado:
   una secuencia de pasadas que en total supere los cinco segundos vuelve a
   caer en 2.2.2.
4. **No hay reinicio automático.** Ningún script ni temporizador vuelve a
   disparar la animación.
5. **El estado final no salta.** La banda termina fuera de cuadro, a la
   derecha (el `100%` de `@keyframes shinySweep` en `globals.css`), y el
   elemento queda en su gradiente estático, sin cambio visible al terminar.
6. **`prefers-reduced-motion: reduce` sigue en `animation: none`**, con la
   banda inmovilizada fuera de cuadro, como hoy.

**Qué criterios WCAG quedan cubiertos:**

- **2.2.2.** Por su propio texto normativo, el criterio alcanza al movimiento
  que **dura más** de cinco segundos. Las técnicas suficientes G11 y G152 se
  apoyan en ese mismo límite.
- **2.3.3** *Animation from Interactions* (nivel AAA). Puede aplicar si la
  animación se repite por una interacción del usuario. Por ejemplo, el numeral
  de esquina de `tarjetas-repaso.tsx` se vuelve a montar al pasar de tarjeta y
  repite su pasada. Lo cubre el bloque de `prefers-reduced-motion`, que es la
  técnica reconocida para ese criterio.
- **2.3.1** (destellos) no aplica: un barrido de 3.4 s no es un destello.

## Motivo

El conflicto no estaba en el valor del dorado sino en que **un mismo token
servía a dos roles**. Separarlos por rol lo resuelve de raíz. El ornamento se
puede volver a ajustar por pedido estético sin que nadie tenga que medir de
nuevo una cifra. Y lo informativo queda atado a un umbral que no depende de
cómo luzca el logotipo.

Las exenciones que hacen válida la separación son del propio WCAG:

- **1.4.3** excluye los logotipos y el texto puramente decorativo. Un numeral
  cuenta como decorativo solo si su información ya está en otro lado: por eso
  el rol exige las dos condiciones.
- Los filetes no son texto. Tampoco son componentes de interfaz ni gráficos
  necesarios para entender el contenido, así que 1.4.11 no les aplica.

La pasada única conserva lo que el usuario pidió, que la marca brille al
llegar, y elimina el único movimiento continuo que el sitio mostraba en todas
las páginas.

## Consecuencias

**Aceptamos:**
- **Dos dorados con roles distintos.** Quien pinta algo dorado tiene que
  preguntarse primero si se lee.
- Las cifras del hero pierden el brillo. El logotipo y los filetes brillan una
  vez, al cargar, y después quedan quietos.
- **`docs/marca/sistema-de-diseno-v2.md` se aleja más de lo vigente.** Su §3
  sigue diciendo `#8B6722`, y su §5 sigue reservando `.shiny` para el hero y
  la describe como infinita. No se editan (`decisiones-menores.md` §5): donde
  chocan, gana este ADR.

**Obtenemos:**
- Las cifras del hero se leen con AA, medido y no supuesto, con margen sobre
  el piso de WCAG.
- La paleta del ornamento queda libre para ajustes estéticos sin costo de
  accesibilidad.
- El riesgo de 2.2.2 queda cerrado.
- El desvío entre el 0015 y el código queda registrado y resuelto.

**Deuda técnica asumida:**
- **Comentarios desactualizados.** Siguen describiendo la paleta compartida,
  `.shiny` como receta de las cifras o la animación infinita:
  - `globals.css`;
  - `header.tsx`;
  - `estadisticas-catalogo.tsx`;
  - `hero.tsx`, líneas 94-96;
  - `ficha/ficha-entidad.tsx`, línea 183.

  Se corrigen en el mismo ticket que cambia las cifras y la animación.
- **`forced-colors` no está verificado.** `.au` usa
  `-webkit-text-fill-color: transparent` sobre `background-clip: text`. En
  modo de colores forzados, el navegador puede quitar la imagen de fondo y
  dejar el texto transparente, o sea el logotipo invisible. No se decide acá:
  lo verifica el `ui-reviewer` con una prueba real. Si se confirma, la
  corrección de menor costo es un bloque `@media (forced-colors: active)` que
  devuelva el color del texto.

**Ejecución** (la corta el `delivery-specialist`):
- El `brand-specialist` elige el dorado AA de las cifras y actualiza
  `identidad-argentum`: roles, pasada única y umbral.
- El `frontend-specialist` hace los cambios de código:
  - cambia las cifras del hero;
  - pasa `shinySweep` a una sola iteración en sus consumidores;
  - retira `.shiny`;
  - corrige los comentarios de la deuda.

**Revisar si:**
- Alguien quiere pintar con brillo otro texto informativo: se responde con
  este ADR, no se reabre.
- Se pide que el brillo se repita (al pasar el cursor, cada cierto tiempo):
  vuelve a entrar en juego 2.2.2, o 2.3.3 si lo dispara una interacción, y se
  decide en un ADR nuevo.
- Se confirma el problema de `forced-colors` descrito en la deuda.
