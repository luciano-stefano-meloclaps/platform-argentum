import type { Metadata } from "next";
import Link from "next/link";

/**
 * El único 404 de la aplicación (ticket #211; ADR 0016, Regla 8).
 *
 * Lo ven dos lectores distintos con la misma pantalla:
 *
 * - el que escribe una dirección que no existe (`/lo-que-sea`): Next cae acá
 *   porque es el `not-found` raíz;
 * - el que entra a una ficha con un slug inexistente (`/catalogo/<slug>`):
 *   con `dynamicParams = false` la página ni siquiera se ejecuta y Next sirve
 *   este mismo archivo. Por eso no hay un `not-found` en el segmento
 *   `catalogo/[slug]`: sería código muerto en producción y, en desarrollo
 *   —donde el slug desconocido sí llega a `notFound()`—, un segundo 404
 *   distinto del que ve el lector real.
 *
 * Es un `not-found.tsx` raíz y no un `global-not-found.tsx`: este último es
 * experimental y sirve para apps con varios layouts raíz, que no es el caso.
 * Al renderizarse dentro de `layout.tsx`, hereda el header, las fuentes y
 * `globals.css` sin repetirlos.
 *
 * En lenguaje humano: nadie que llegue acá sabe qué es un "404", y decírselo
 * no lo ayuda a encontrar lo que buscaba. Dos salidas, al índice del catálogo
 * y al inicio.
 *
 * Contrastes (skill `identidad-argentum` §3), sobre el `bg-crema` del
 * `<body>`: el botón dorado lleva `accent-700` (4.58:1) y, al pasar el
 * cursor, `accent-800` sobre `accent-300` (6.81:1); el enlace secundario lleva
 * `celeste-text` (6.12:1) y no cambia de color al pasar el cursor, solo engrosa
 * el subrayado. Ningún estado baja de AA.
 */
export const metadata: Metadata = {
  title: "Página no encontrada | Argentum",
};

export default function NoEncontrado() {
  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-lg py-2xl text-center"
    >
      <h1 className="text-balance font-titulo text-h1 text-texto-titulo">Esta página no existe</h1>
      <p className="mt-sm max-w-md text-pretty font-cuerpo text-body-lg text-texto-secundario">
        La dirección no lleva a ninguna página de Argentum. Puede que esté mal escrita, o que la ficha que buscás
        todavía no forme parte del catálogo.
      </p>
      <div className="mt-xl flex flex-wrap items-center justify-center gap-md">
        <Link
          href="/catalogo"
          className="inline-flex min-h-objetivo-tactil touch-manipulation items-center justify-center border border-accent-700 px-lg py-sm text-center font-cuerpo text-button text-accent-700 motion-safe:transition-colors motion-safe:duration-150 hover:bg-accent-300 hover:text-accent-800 active:bg-accent-300 active:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Ir al índice del catálogo
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-objetivo-tactil touch-manipulation items-center justify-center px-sm font-cuerpo text-button text-celeste-text underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
