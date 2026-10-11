# 0030 — La prosa curada se escribe en comillas dobles concatenadas, no en template literals

- **Estado:** Aceptado — **supersede parcialmente** al
  [ADR 0009](0009-formato-del-contenido-curado.md) en dos puntos:
  - la última oración de la definición 1 de su «Decisión elegida»: «La prosa
    larga va en template literals»;
  - el disparador de «Revisar si» sobre la incomodidad de escribir prosa larga
    en template literals.

  El resto del 0009 sigue vigente sin cambios: un archivo TypeScript por
  entidad, la ubicación, las imágenes y los tipos borrables.
- **Fecha:** 2026-10-11
- **Decide:** el usuario delegó la decisión en los agentes involucrados (#159);
  **redacta:** el `super-architect`; **consultados:** el `narrative-specialist`
  y el `backend-specialist`

## Decisión

La prosa de un archivo de contenido curado se escribe como **tramos entre
comillas dobles concatenados con `+`**, de unas diez palabras por línea. Cada
tramo termina con **un espacio**, salvo el último del campo, y ningún tramo
empieza con espacio. Un cambio de párrafo es un `"\n\n"` explícito. La
importación no normaliza el texto: lo que está en el archivo es lo que llega a
la base.

## Contexto

El ADR 0009 eligió TypeScript como formato y agregó, de paso y sin
alternativas, que la prosa larga iría en template literals. La skill
`voz-narrativa` (§9), el archivo del `narrative-specialist` y el comentario del
campo `semblanza` en `src/catalogo/descriptores/procer.ts` repitieron esa
regla.

La única ficha que existe, `contenido/procer/manuel-belgrano.ts`, se escribió
de otra manera: unas cincuenta líneas de comillas dobles concatenadas, en
`resumen`, `contexto`, `semblanza`, el texto alternativo y el crédito.

Lo verificado en el árbol (#159):

- Ni la importación (`src/catalogo/importacion/`) ni el descriptor normalizan
  el texto: no hay `trim`, `replace` ni `transform`, y el string se guarda en
  el JSONB tal como sale del archivo.
- La web separa los párrafos en `parrafos()` de
  `src/app/catalogo/[slug]/ficha-procer.tsx`, con `split(/\n{2,}/)`.
- Ninguna prueba, regla de Zod ni de lint detecta palabras pegadas ni espacios
  dobles.
- La ficha de Belgrano está limpia: ningún tramo termina sin espacio ni empieza
  con espacio, y no hay espacios dobles en el texto evaluado.

## Problema

Las reglas dicen una cosa y la única ficha hace otra. El que escriba la segunda
ficha no sabe cuál seguir, y cualquiera de las dos tiene un modo de falla
silencioso que el compilador no ve.

## Alternativas consideradas

### A. Comillas dobles concatenadas con `+`
Lo que ya existe. El string es exactamente lo que se ve entre comillas.

### B. Template literal, un párrafo por línea
Sin saltos dentro del párrafo, así no entra sangría al string. No pide código.

### C. Template literal libre, con normalización en la importación
Se escribe con saltos y sangría, y la importación colapsa espacios y saltos
simples conservando `\n\n`.

## Trade-offs

| Alternativa | A favor | En contra | Costo de revertir |
| ----------- | ------- | --------- | ----------------- |
| A. Concatenación | Determinista: el string es lo escrito. El diff marca la frase que cambió. Cada línea se lee sola, lo que ayuda al conteo de ritmo de la voz. Las citas usan comillas latinas «», así que las dobles del código no chocan. Ya es lo que existe | Si falta el espacio final de un tramo, se pegan dos palabras sin aviso | Bajo |
| B. Párrafo por línea | No toca código | Líneas de mil caracteres o más: el diff marca el párrafo entero ante cualquier corrección. No protege de nada nuevo. Una comilla invertida o un `${` en el texto rompen el build | Bajo |
| C. Libre + normalización | Lo más cómodo para escribir | Código nuevo en la importación, con pruebas propias, para un problema que hoy no existe. Sin esa normalización, la sangría llega a la base, cuenta para el `max(280)` del resumen y una línea en blanco con espacios de sangría no corta párrafo. Agrega una regla de lectura entre el archivo y la base | Medio |

## Decisión elegida

**Alternativa A**, para todo campo de texto de un archivo de
`contenido/<tipo>/<slug>.ts`, con estas reglas:

1. Tramos entre comillas dobles, unidos con `+`, de unas diez palabras.
2. Todo tramo termina con un espacio, salvo el último del campo. Ninguno
   empieza con espacio.
3. Un cambio de párrafo es el tramo `"\n\n"`, solo en su propia línea. Es lo
   que `parrafos()` ya entiende.
4. Las citas van en comillas latinas «», como pide la voz. Una comilla doble
   recta dentro del texto no hace falta: si aparece, se reescribe.
5. La importación no normaliza. Si hace falta corregir el texto, se corrige el
   archivo.

## Motivo

Es lo que ya existe y lo que prefiere quien escribe: el `narrative-specialist`
trabaja frase por frase, y el diff por tramo le sirve para revisar y al usuario
para aprobar. Las otras dos alternativas cambian un modo de falla por otro. B
cambia el espacio olvidado por las líneas ilegibles en el diff. C cambia el
espacio olvidado por una normalización que hay que escribir y probar, y que
hace que el archivo y la base dejen de decir lo mismo.

El modo de falla de A, la palabra pegada, se puede detectar con una prueba
barata sobre el texto fuente de cada archivo de contenido. Esa prueba es la
mitigación, y no hace falta para adoptar la regla: la ficha que existe ya
cumple.

## Consecuencias

**Aceptamos:**
- Escribir prosa con ruido sintáctico: comillas y `+` en cada línea.
- Mientras no exista la prueba, la palabra pegada solo la detecta la lectura.

**Obtenemos:**
- Una sola regla, igual en el ADR, la skill, el agente y el código.
- La ficha de Belgrano no se reescribe por formato.
- Ningún cambio en la importación, el descriptor ni la web.

**Deuda técnica asumida:**
- La guarda de palabras pegadas queda para un ticket del `backend-specialist`:
  una prueba en `src/catalogo/importacion/contenido-curado.test.ts` que lea el
  fuente de cada `contenido/**/*.ts` y marque un tramo que termina en letra,
  cifra o puntuación seguido de uno que empieza en letra sin espacio entre
  ambos, más espacios dobles en el texto evaluado. La heurística exacta es suya.

**Revisar si:**
- Entra a redactar alguien sin perfil técnico. Ahí aplica el disparador del
  0009: Markdown con front-matter.
- La prosa empieza a necesitar varios párrafos por campo y los `"\n\n"`
  vuelven incómodo el archivo.
