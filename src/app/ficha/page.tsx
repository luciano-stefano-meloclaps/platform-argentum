import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { obtenerEntidadDeFicha } from "./ficha-entidad.datos.ts";
import { FichaEntidad } from "./ficha-entidad.tsx";

/**
 * La pantalla "Ficha" rediseñada, contra el mock de `ficha-entidad.datos.ts`.
 *
 * Vive en `/ficha` y **no** reemplaza todavía a `/catalogo/[slug]`, que es la
 * ficha conectada a datos reales (`catalogo/[slug]/ficha-procer.tsx`). El
 * motivo está escrito en `ficha-entidad.datos.ts`: el descriptor de `procer`
 * no tiene epíteto, número de orden, tabla de datos en pares, relacionadas
 * ni historial de propuestas, así que conectar este diseño a la entidad real
 * es un cambio de descriptor y de contenido —dos dueños distintos— y no de
 * esta pantalla. Cuando esos campos existan, este archivo desaparece y
 * `FichaEntidad` pasa a renderizarse desde `/catalogo/[slug]`.
 *
 * Server Component: solo lee el mock. Lo interactivo vive un nivel más abajo,
 * en `FichaEntidad`, y las tres acciones no se pasan a propósito — sus
 * pantallas de destino (Tarjetas, moderación, Propuestas) no existen.
 */

export const metadata: Metadata = {
  title: "José de San Martín | Argentum",
};

export default async function PaginaDeFicha() {
  const entidad = await obtenerEntidadDeFicha("jose-de-san-martin");

  if (entidad === undefined) notFound();

  return (
    <main id="contenido" className="py-2xl">
      <FichaEntidad entidad={entidad} />
    </main>
  );
}
