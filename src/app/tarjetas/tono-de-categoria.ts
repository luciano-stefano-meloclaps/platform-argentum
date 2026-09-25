/**
 * Color de la etiqueta de una tarjeta según su categoría. La misma clase sirve
 * en el frente y en el dorso: es la etiqueta la que lleva el color, nunca el
 * marco ni la carta. Los pares y sus contrastes están medidos en la skill
 * `identidad-argentum` («Acento morado de repaso», subsección «Etiqueta de categoría, mismo color en las dos caras»).
 *
 * Las clases van completas y estáticas: Tailwind v4 no detecta nombres armados
 * por concatenación.
 */
const TONOS = {
  Próceres: "border-cat-proceres-text bg-cat-proceres-bg text-cat-proceres-text",
  Monumentos: "border-cat-monumentos-text bg-cat-monumentos-bg text-cat-monumentos-text",
  Comidas: "border-cat-comidas-text bg-cat-comidas-bg text-cat-comidas-text",
  "Fechas patrias": "border-cat-fechas-text bg-cat-fechas-bg text-cat-fechas-text",
  Animales: "border-cat-animales-text bg-cat-animales-bg text-cat-animales-text",
  Naturaleza: "border-cat-naturaleza-text bg-cat-naturaleza-bg text-cat-naturaleza-text",
} as const;

/** Neutro para una categoría que la marca todavía no conoce. */
export const TONO_NEUTRO = "border-texto-titulo bg-blanco text-texto-titulo";

export const CATEGORIAS_CONOCIDAS = Object.keys(TONOS);

export function tonoDeCategoria(categoria: string): string {
  return Object.hasOwn(TONOS, categoria) ? TONOS[categoria as keyof typeof TONOS] : TONO_NEUTRO;
}
