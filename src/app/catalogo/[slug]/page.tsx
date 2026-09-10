import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listarSlugs, obtenerPorSlug, type Entidad } from "../../../catalogo/catalogo.ts";
import { FichaProcer } from "./ficha-procer.tsx";

/**
 * La ficha de una entidad del catálogo (ticket #32).
 *
 * La dirección **no lleva el tipo**: el slug es único en toda la tabla
 * (ADR 0013), así que esta ruta vive en `/catalogo/<slug>` y recién adentro
 * se sabe de qué tipo es, con `obtenerPorSlug`.
 *
 * Server Component prerenderizado, sin ninguna API dinámica: `generateStaticParams`
 * recorre `listarSlugs()` —la única función del módulo `catalogo` (ADR 0002)
 * pensada exactamente para esto, ver su doc en `catalogo.ts`— así que el build
 * conoce de antemano el universo completo de fichas. Un slug fuera de ese
 * universo cae en `notFound()` (ver `./not-found.tsx`).
 *
 * El `switch` sobre `tipo` es a propósito y no un `if`: hoy el registro de
 * descriptores tiene un solo tipo y el `switch` es exhaustivo por eso, pero
 * cuando aparezca un segundo tipo, el compilador va a señalar la rama que
 * falta. La regla de ESLint que hace este chequeo mecánico para cualquier
 * `switch` sobre `tipo` (no solo este) todavía no existe —ticket #57—; hasta
 * que exista, la exhaustividad la sostiene el compilador de TypeScript solo,
 * vía `noImplicitReturns` (ADR 0007): sin un caso para cada tipo, esta
 * función deja una rama sin `return` y `pnpm typecheck` falla igual.
 */

export async function generateStaticParams() {
  const slugs = await listarSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/catalogo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entidad = await obtenerPorSlug(slug);

  if (entidad === undefined) {
    return { title: "No encontrado | Argentum" };
  }

  return {
    title: `${entidad.nombre} | Argentum`,
    description: entidad.datos.resumen,
  };
}

export default async function PaginaFicha({ params }: PageProps<"/catalogo/[slug]">) {
  const { slug } = await params;
  const entidad = await obtenerPorSlug(slug);

  if (entidad === undefined) notFound();

  return <main className="mx-auto max-w-3xl px-lg py-2xl">{renderizarFicha(entidad)}</main>;
}

/**
 * Elige el componente de ficha según el `tipo` de la entidad. Es el único
 * lugar de esta pantalla con un `switch` sobre `tipo`, y crece con un `case`
 * por cada tipo nuevo del registro de descriptores.
 */
function renderizarFicha(entidad: Entidad) {
  switch (entidad.tipo) {
    case "procer":
      return <FichaProcer procer={entidad} />;
  }
}
