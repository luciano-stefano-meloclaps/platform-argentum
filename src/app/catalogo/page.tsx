import type { Metadata } from "next";
import Link from "next/link";

import { listarPorTipo } from "../../catalogo/catalogo.ts";

/**
 * La puerta de entrada al catálogo (ticket #33): lista las entidades de tipo
 * `procer` y enlaza cada una a su ficha en `/catalogo/<slug>` (ticket #32, en
 * paralelo — sin el tipo en la URL, ADR 0013).
 *
 * Server Component, sin ninguna API dinámica (sin `cookies`, `headers`,
 * `searchParams`): Next la prerenderiza en build. `listarPorTipo` es la única
 * llamada del módulo `catalogo` que esta pantalla necesita (ADR 0002) — la
 * capa web no toca la tabla `entidad`.
 *
 * Sin búsqueda, sin filtros y sin paginación: fuera del alcance de esta
 * rebanada.
 */
export const metadata: Metadata = {
  title: "Próceres | Argentum",
  description: "El catálogo de próceres de Argentum, con acceso a la ficha de cada uno.",
};

export default async function PaginaCatalogo() {
  const proceres = await listarPorTipo("procer");

  return (
    <main id="contenido" className="mx-auto max-w-5xl px-lg py-2xl">
      <h1 className="font-titulo text-h1 text-texto-titulo">Próceres</h1>
      <p className="mt-sm max-w-2xl font-cuerpo text-body-lg text-texto-secundario">
        Las fichas de próceres cargadas en el catálogo, una por una.
      </p>

      {proceres.length === 0 ? (
        <p className="mt-2xl rounded-lg border border-borde-default bg-blanco p-lg font-cuerpo text-body text-texto-secundario">
          Todavía no hay próceres cargados en el catálogo. Volvé a pasar más
          adelante.
        </p>
      ) : (
        <ul className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
          {proceres.map((procer) => (
            <li key={procer.slug}>
              <Link
                href={`/catalogo/${procer.slug}`}
                className="group block overflow-hidden rounded-xl border border-borde-default bg-blanco shadow-sombra-sm motion-safe:transition-shadow hover:shadow-sombra-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
              >
                <div className="relative h-[92px] border-b-[3px] border-dorado-filete bg-celeste-400">
                  <span className="absolute -top-[15px] left-xl inline-flex items-center rounded-sm bg-cat-proceres-bg px-sm py-xs text-chip uppercase text-cat-proceres-text">
                    Prócer
                  </span>
                </div>
                <div className="p-lg">
                  <h2 className="font-titulo text-h3 text-texto-titulo">{procer.nombre}</h2>
                  <p className="mt-xs line-clamp-3 font-cuerpo text-body text-texto-cuerpo">{procer.datos.resumen}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
