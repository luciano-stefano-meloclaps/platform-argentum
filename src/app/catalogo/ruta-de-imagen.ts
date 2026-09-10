/**
 * La ruta pública de la imagen de una entidad, derivada de su `tipo` y su
 * `slug`.
 *
 * La convención —`public/contenido/<tipo>/<slug>.webp`— la documenta el
 * descriptor de cada tipo (ver el comentario sobre `imagen` en
 * `src/catalogo/descriptores/procer.ts`) y la aplica también la
 * **importación** (`rutaDeImagen` en `src/catalogo/importacion/contenido.mts`,
 * que valida que el archivo exista en el build). Esta función hace la misma
 * cuenta pero para el navegador: una ruta de `public/` que arranca en `/`, no
 * una ruta de filesystem — por eso no se reutiliza la de la importación, que
 * depende de `node:path` y de dónde vive `public/` en disco.
 *
 * Es una concatenación pura a partir de dos campos que el módulo `catalogo`
 * ya devuelve en toda `Entidad` (`tipo` y `slug`): no consulta la base ni abre
 * un archivo, así que no cruza el límite del ADR 0002.
 *
 * **Nota de arquitectura, no una decisión tomada:** el ticket #59 deja
 * constancia de que el ADR 0015 —la arquitectura de la capa web, todavía en
 * estado "Propuesto" y sin ADR publicado en `docs/adr/`— se contradice sobre
 * si esta derivación vive del lado del módulo (un campo ya resuelto dentro de
 * `Entidad`) o de la capa web, como acá. Mientras esa costura no se cierre,
 * esta función queda como el único lugar de la capa web que conoce la
 * convención, para que mover la responsabilidad al módulo el día de mañana
 * sea borrar este archivo y nada más.
 */
export function rutaDeImagen(tipo: string, slug: string): string {
  return `/contenido/${tipo}/${slug}.webp`;
}
