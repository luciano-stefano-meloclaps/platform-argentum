import * as z from "zod";

import type { Descriptor } from "./descriptor";

/**
 * Las licencias con las que una imagen puede entrar al catálogo.
 *
 * Conjunto **cerrado** y no texto libre, y es una decisión con motivo: el
 * ADR 0009 declaró los derechos de uso de las imágenes como uno de los riesgos
 * del proyecto y puso la licencia como campo obligatorio para convertirlo en
 * algo que el compilador y la **importación** hacen cumplir. Con
 * `z.string().min(1)` entran `"TODO"` y `"creo que es libre"`, y el riesgo
 * vuelve a ser una buena intención. Con un conjunto cerrado, agregar una
 * licencia es una decisión visible en el diff.
 *
 * `z.enum` de Zod es un valor, no un `enum` de TypeScript: no lo toca la
 * prohibición de `erasableSyntaxOnly` (ADR 0007).
 */
const licencia = z.enum([
  "dominio-publico",
  "cc0",
  "cc-by",
  "cc-by-sa",
  "propia",
]);

/**
 * La imagen de la ficha, con los tres campos que el ADR 0009 declara
 * obligatorios.
 *
 * **No lleva la ruta del archivo**, a propósito: se deriva del tipo y del slug
 * (`public/contenido/<tipo>/<slug>.webp`). Un campo con la ruta escrita a mano
 * es un campo que puede apuntar a un archivo que no existe.
 *
 * Vive acá y no en un archivo compartido porque hoy hay un solo descriptor. El
 * día que exista el segundo, se saca de este archivo en vez de copiarse: la
 * regla es del contenido curado, no de los próceres.
 */
const imagen = z.object({
  /** Sin esto la ficha es inaccesible; por eso es obligatorio (ADR 0009). */
  textoAlternativo: z.string().min(1),
  /** De dónde salió la imagen y a quién se le atribuye. */
  credito: z.string().min(1),
  licencia,
});

/**
 * El descriptor del tipo `procer`.
 *
 * Es la **única** definición de los campos de un prócer: no hay una segunda
 * lista escrita a mano en ningún lado. De acá salen el tipo de los **datos**,
 * lo que se puede escribir en `contenido/procer/<slug>.ts` y lo que valida el
 * módulo `catalogo`.
 *
 * Lo que **no** está acá porque son columnas de la tabla `entidad` y no
 * **datos**: `slug` (vive en el nombre del archivo de contenido, ADR 0009) y
 * `nombre` (el nombre con el que se muestra: "Manuel Belgrano").
 * `nombreCompleto` sí está, y no duplica a `nombre`: son dos hechos distintos
 * —"Manuel José Joaquín del Corazón de Jesús Belgrano" no es lo que va en un
 * listado ni en un título—.
 */
export const procer = z.object({
  nombreCompleto: z.string().min(1),

  /**
   * Los años, con rango. Los `.min`/`.max` no son adorno: atrapan la errata de
   * tipeo real (`17788`) en el momento de escribir la ficha, que es de lo que
   * se trata el ADR 0009.
   */
  anioDeNacimiento: z.int().min(1500).max(2100),
  /**
   * Opcional: hay próceres cuya fecha de muerte no se conoce con certeza.
   * Sigue la convención del ADR 0007 sobre propiedades opcionales.
   */
  anioDeMuerte: z.int().min(1500).max(2100).optional(),

  /** Una o dos frases, para el listado y para la tarjeta de repaso. */
  resumen: z.string().min(1).max(280),
  /** La prosa de la ficha. En el archivo de contenido va en un template literal. */
  semblanza: z.string().min(1),

  imagen,
}) satisfies Descriptor;
