---
name: voz-narrativa
description: Las reglas de lengua de la prosa épica del catálogo — registro alto, escenario dramático, ritmo amplio, metáfora madre sostenida, estructura y prohibiciones. Usala al redactar el contexto o la semblanza de una ficha, y al revisar cualquier prosa del catálogo. Es la fuente citable de la voz; el que decide es el narrative-specialist.
argument-hint: <archivo-de-contenido-o-párrafo>
allowed-tools: Read Glob Grep
---

# Voz narrativa del catálogo

Estas son las **reglas de lengua** de la prosa que se publica en una **ficha**.
Se citan, no se interpretan: cada regla está escrita para poder verificarse
contra un párrafo concreto y responder sí o no.

Las **muestras versionadas** están en [`muestras.md`](./muestras.md), en este
repositorio. Son de destino: **el texto que hay que escribir se parece a ellas.**
No se bajan de internet y no se trabaja de memoria: se abren.

> **La voz es épica y el registro es alto.** Escenario dramático, período
> amplio, léxico rico, metáfora sostenida. El lector tiene doce años o más, y
> **no** se le escribe para abajo. Ver *Audiencia*, y el **ADR 0012**, que es el
> que fijó esto.

---

## 1. Audiencia

El lector es **de doce años en adelante**: chicos grandes y adultos. Ese piso no
es un adorno; es lo que hace verificable todo lo que sigue, porque una regla no
puede medirse contra «cualquiera».

De dónde sale el número: las muestras exigen sostener una subordinación de tres
grados, entender vocabulario abstracto sin ilustración (*soberanía*,
*emancipación*, *proscripciones*) y traer del colegio un piso de referencias
históricas. Eso es lectura de secundaria, no de primaria.

Consecuencias directas, y las tres importan:

- **No se simplifica.** Una palabra difícil no se cambia por una fácil: se
  sostiene con el contexto de su oración.
- **No se explica de más.** El lector completa. Un texto que aclara todo le quita
  el trabajo, y con el trabajo se va el placer.
- **Tampoco se vuelve hermético.** Rico no es oscuro. Si una oración solo se
  entiende releyéndola dos veces, está mal escrita, y el registro alto no es una
  excusa.

**La versión para chicos existe y está pospuesta**, no cancelada: es otra lengua
y quizás otro diseño, y tiene su entrada en `docs/decisiones-pendientes.md`.
Mientras tanto, **no se escribe una prosa intermedia que le sirva a los dos.** Un
texto que intenta las dos audiencias no consigue ninguna.

---

## 2. Ritmo — se cuenta, no se estima

Los números salen de **contar las cuatro muestras**. Son conteos manuales y
pueden variar en una palabra según cómo se cuente un inciso con raya:

| Texto | Oraciones | Palabras | Media | Máximo |
| --- | ---: | ---: | ---: | ---: |
| Contexto de Brown | 4 | 162 | 40,5 | 53 |
| Semblanza de Brown | 5 | 155 | 31 | 37 |
| Contexto de César | 7 | 210 | 30 | 42 |
| Semblanza de César | 11 | 247 | 22,5 | 34 |

De ahí salen las reglas:

1. **La media de palabras por oración cae entre 22 y 42.** El piso es tan
   importante como el techo: un texto de media 15 puede ser correcto y no es esta
   voz. La amplitud del período **es** el registro.
2. **Ninguna oración pasa de 55 palabras.** El máximo observado es 53. Una
   oración más larga que eso deja de ser un período y pasa a ser un descuido: se
   parte o se poda.
3. **Cadencia: al menos una oración de 20 palabras o menos cada cinco.** Es la
   respiración que hace que el período largo se lea en vez de aplastar.
4. **Los párrafos dicen una sola cosa.** El contexto puede ser un párrafo único;
   la semblanza rara vez pasa de tres.

**Acá las dos muestras no coinciden, y hay que decirlo.** La semblanza de César
cumple la cadencia con holgura —tiene oraciones de 13, 16 y 19 palabras entre los
períodos largos— y la de Brown no tiene ninguna por debajo de 27. La regla está
escrita del lado de César, porque esa alternancia es lo que separa un período
amplio de un muro. Si la preferencia del proyecto fuera la otra, la regla cambia
y este párrafo se reescribe.

Extensión:

| Campo | Extensión | Función |
| --- | --- | --- |
| `resumen` | hasta 280 caracteres (lo impone el descriptor) | Vidriera: qué fue y por qué importa. Sin metáfora y sin suspenso. |
| `contexto` | 160 a 220 palabras | El escenario: el mundo en tensión del que emerge el personaje. |
| `semblanza` | 150 a 300 palabras | El retrato: quién era, probado con hechos. |

Contar es parte del trabajo. Si no contaste, no verificaste.

---

## 3. Léxico

**El léxico elevado es el material, no el adorno.** *Anquilosado*, *efervescencia*,
*crisol*, *pugnas*, *endémica*, *antaño*, *albor*, *clave de bóveda*: esas
palabras están en las muestras y están bien. **No se reemplazan por sinónimos
llanos.**

Lo que sí se controla:

- **Se sostiene por el contexto, no por el diccionario.** Una palabra rara está
  bien puesta cuando la oración deja adivinar qué significa aunque no se sepa.
  «El anquilosado orden colonial» funciona: *orden colonial* ancla, *anquilosado*
  agrega. Una palabra rara sobre un sujeto también raro no se sostiene, y sale.
- **El término técnico o extranjero se glosa en su misma oración**, por
  aposición o por inciso. Es lo que hacen las muestras: «una aristocracia
  senatorial obscenamente opulenta, los *optimates*»; «la *dignitas* —el
  prestigio y la posición de un hombre—». Un término técnico suelto sin glosa es
  el único defecto de léxico que este registro no perdona. En las muestras hay
  uno: *viri militares*, que pasa sin explicación.
- **Los términos en otra lengua van en cursiva** —*optimates*, *dignitas*— salvo
  que ya sean castellanos de uso.
- **Un adjetivo por sustantivo, dos como excepción.** La acumulación no es
  riqueza: es ruido. Las muestras casi nunca apilan tres.
- **Nada de fórmulas de época.** *Cabe destacar*, *sin lugar a dudas*, *no es
  menos cierto que*: son relleno con aspecto de solemnidad.

**Español literario neutro.** Sin marcas regionales fuertes y sin voseo: el
narrador cuenta, no le habla al lector. Sin españolismos (*coger*, *ordenador*,
*vosotros*).

**Ortografía completa.** Tildes todas, incluidas las de mayúscula. Apertura de
interrogación y exclamación (`¿`, `¡`). Comillas latinas «» o rectas `"`. **Raya
de inciso —así—**, que en este registro es un signo de trabajo: las dos muestras
la usan para incrustar la glosa sin romper el período.

**Prohibido sin excepción:** emoji, negritas o cursivas de énfasis dentro de la
prosa (la cursiva es para extranjerismos y títulos), mayúsculas de énfasis,
signos de exclamación.

---

## 4. La metáfora madre

Es el rasgo más característico de la voz y el que más fácil se hace mal.

**Una por ficha, y una sola.** Sale del oficio o del mundo del personaje: marina
en un marino —faro, brújula, corrientes, lobo de mar, puntas de lanza contra
flotas—; forja y mármol en un romano —aleación, martillar, los cimientos del
Capitolio—.

- **Se sostiene**: aparece al menos tres veces a lo largo del texto y las tres
  pertenecen a la misma familia. Una imagen suelta no es una metáfora madre, es
  un adorno.
- **No se mezcla.** Un personaje no puede ser a la vez un faro, una aleación y
  una semilla. Dos familias de imágenes en el mismo texto se anulan.
- **Se cobra al final.** Los dos contextos cierran con una imagen de la misma
  familia que abrió —«la clave de bóveda», «el mármol del Capitolio»—. Abrir una
  metáfora y no volver a ella es dejar la deuda impaga.
- **No se reutiliza entre fichas.** *«En su interior ardía un fuego
  estratégico»* aparece en las dos muestras, aplicado a un marino irlandés y a un
  patricio romano. Una frase que sirve para los dos **no describe a ninguno**. Es
  el único defecto que las muestras comparten, y no se hereda.

**La prueba del traslado:** copiá la frase a la ficha de otro personaje. Si sigue
funcionando igual, no dice nada y se reescribe. Es el control más rápido que hay
contra la épica genérica, que es el modo de fallar de este registro: suena
grandiosa y no dice nada de nadie.

---

## 5. Estructura de cada item

### `contexto` — el escenario

- Describe **el mundo**, no la persona. Es una escena, no una introducción.
- **Abre con una tensión, no con una fecha.** «La República Romana del siglo I
  a.C. era una superpotencia en agonía»: la fecha entra, pero montada sobre la
  imagen.
- **No nombra al personaje** hasta la última oración, y ahí lo insinúa sin
  nombrarlo: «un patricio con un linaje divino y una deuda colosal se preparó
  para apostarlo todo».
- **Cierra abriendo, y con puntos suspensivos.** Las dos muestras lo hacen y es
  la convención del proyecto: el contexto no concluye, entrega.
- Da **fuerzas en pugna**, no lista de acontecimientos. Un contexto que enumera
  hechos en orden es una cronología disfrazada de escenario.

### `semblanza` — el retrato

- **No narra la cronología.** Retrata el carácter y lo **prueba con un hecho
  concreto**: los piratas del Egeo valen más que diez adjetivos.
- **Abre con una tesis sobre la persona**, no con su nacimiento. «Gayo Julio
  César no fue simplemente un producto de su tiempo; fue la fuerza catalizadora
  que aceleró su transformación».
- **Cero adjetivos de carácter sin escena que los sostenga.** Si un adjetivo no
  tiene su hecho al lado, se borra el adjetivo o se agrega el hecho. Es la regla
  que separa esta voz del panegírico.
- **Al menos una anécdota concreta**, ubicada o fechada, por semblanza.
- **Cierra con una imagen o con una frase de destino**, nunca con una enseñanza:
  «grabar su nombre en la eternidad».

### `resumen` — la vidriera

Una o dos frases, factuales, sin metáfora y sin suspenso. Es lo que se lee en el
listado y en una **tarjeta**: tiene que funcionar arrancado de la ficha. **Es el
único campo donde el registro baja**, y es a propósito: no es narración, es una
etiqueta.

---

## 6. Prohibiciones de contenido

Estas no son de estilo: son de producto, y una sola de ellas alcanza para
rechazar un texto.

- **No se inventa un hecho, una fecha, una cifra, una cita ni una anécdota.**
  Todo dato viene del material que entregó el usuario. Ante la duda, el dato no
  se escribe: se pregunta. **Esta prohibición se vuelve más importante con el
  registro alto, no menos**: la prosa épica es exactamente la que hace que un
  hecho falso suene verdadero, y nadie lo nota porque suena bien.
- **No se moraliza hacia el lector.** Nada de «nos enseña que», «su ejemplo nos
  recuerda», «gracias a él hoy podemos».
- **No se le habla al lector.** Tercera persona y pretérito. Sin preguntas
  retóricas y sin segunda persona.
- **Las sombras se cuentan, con dureza si corresponde.** Este registro sí juzga
  al individuo, y las muestras lo hacen: «crueldad pragmática», «su brutalidad
  contra los galos rebeldes», «obscenamente opulenta». Lo que no se hace es
  **santificar**. Un prócer sin sombras es propaganda, no historia.
- **No se juzga a pueblos ni a naciones.** Juzgar los actos de una persona es
  retrato; adjetivar a un pueblo entero no es historia.
- **Nada de anacronismos**, ni de lenguaje ni de ideas.
- **La crueldad se nombra, no se recrea.** Se puede contar que César crucificó a
  los piratas; no se describe la crucifixión.

---

## 7. Marcas de cita y procedencia

**En la prosa no van marcas de cita.** Las muestras traen `[2], [3]`: vienen de
la herramienta con la que se generaron, apuntan a una bibliografía que este
repositorio no tiene, y cortan el período justo donde el ritmo importa. **Se
eliminan.**

La procedencia sí importa, y va donde ya vive la atribución en este proyecto:
**versionada, junto al contenido, invisible para el lector**. Se escribe como
comentario TSDoc arriba del objeto de la ficha, en
`contenido/<tipo>/<slug>.ts`:

```ts
/**
 * Fuentes de los hechos de esta ficha:
 * - <obra o página, autor, año> — para <qué hecho concreto sostiene>.
 */
```

Es el mismo criterio que el ADR 0009 aplica a las imágenes con `credito` y
`licencia`: la atribución es estructural y explícita, no un número entre
corchetes. Mostrarle las fuentes al lector sería un campo nuevo y una decisión de
producto; con la audiencia adulta es más razonable que antes, pero hoy no hace
falta.

---

## 8. El archivo es TypeScript

La prosa vive en un *template literal* dentro de `contenido/<tipo>/<slug>.ts`
(ADR 0009). Dos caracteres rompen el build sin decir nada útil:

- una **comilla invertida** (`` ` ``) dentro del texto,
- la secuencia **`${`**.

Ninguno de los dos hace falta en prosa castellana. Si aparecen, se reescribe la
frase. Después de tocar un archivo de contenido se corre `pnpm typecheck`: un
texto que no compila no es un texto entregado.

---

## 9. Pasada final

Diez controles. Cada uno se responde con sí o no sobre el texto que tenés
adelante, no sobre la intención.

1. ¿Conté las oraciones? Media entre 22 y 42, ninguna sobre 55, una corta cada
   cinco.
2. ¿La extensión de cada campo cae en su rango?
3. ¿Hay **una** metáfora madre, sostenida tres veces, de la misma familia, que
   se cobra al final?
4. ¿Pasa la prueba del traslado — ninguna frase serviría igual en otra ficha?
5. ¿El contexto abre con una tensión, no nombra al personaje hasta el final y
   cierra con puntos suspensivos?
6. ¿La semblanza abre con una tesis, prueba con un hecho concreto y no lista una
   cronología?
7. ¿Cada adjetivo de carácter tiene su escena al lado?
8. ¿Todo término técnico o extranjero está glosado en su oración, en cursiva?
9. ¿Todo hecho viene del material del usuario, sin una sola invención?
10. ¿Cero moraleja, cero segunda persona, cero santificación, sin marcas de
    cita, y sin `` ` `` ni `${` en la prosa?

Un texto que falla uno de los diez no está terminado.

---

## Precedencia

Estas reglas son la fuente de la voz, pero **no son autoridad sobre el resto del
proyecto**. Si alguna contradice un ADR de `docs/adr/` o el vocabulario de
`CONTEXT.md`, **gana el ADR**. Ver la sección *Skills* de `CLAUDE.md`.

En particular: los términos del dominio no se cambian por una razón de estilo.
Una **ficha** es la página de una entidad y una **tarjeta** es una unidad de
repaso, también dentro de la prosa.

El ADR que fija la audiencia y el registro es el **0012**. Si alguna vez el
proyecto vuelve al registro llano, se escribe un ADR que lo supersede y esta
skill se reescribe con él; no se afloja una regla suelta para que pase un texto.
