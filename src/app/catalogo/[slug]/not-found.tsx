import type { Metadata } from "next";
import Link from "next/link";

/**
 * Lo que ve un lector que entra a un slug que no existe (ticket #32, criterio
 * "un slug inexistente devuelve 404"). `notFound()`, en `./page.tsx`, la
 * renderiza en vez de la página genérica de Next.
 *
 * En lenguaje humano y sin tecnicismos: nadie que llegue acá sabe qué es un
 * "404", y decírselo no ayuda a nadie a encontrar lo que buscaba.
 *
 * Su propio `metadata`, y no el de `generateMetadata` en `./page.tsx`: cuando
 * `notFound()` dispara este límite, Next resuelve el título de la pestaña
 * desde este archivo, no desde la página que lo llamó (verificado
 * sirviendo `/catalogo/<slug-inexistente>` y leyendo el `<title>` de la
 * respuesta) — la rama "no encontrado" de `generateMetadata` queda como
 * guarda de tipos, no como la que se ve en pantalla.
 */
export const metadata: Metadata = {
  title: "Esta ficha no existe | Argentum",
};

export default function NoEncontrado() {
  return (
    <main
      id="contenido"
      className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-lg py-2xl text-center"
    >
      <h1 className="text-balance font-titulo text-h1 text-texto-titulo">Esta ficha no existe</h1>
      <p className="mt-sm max-w-md font-cuerpo text-body-lg text-texto-secundario">
        Puede que el nombre esté mal escrito, o que la ficha todavía no esté cargada en el catálogo.
      </p>
      <Link
        href="/catalogo"
        className="mt-xl inline-flex items-center rounded-sm bg-celeste-700 px-lg py-sm font-cuerpo text-button text-texto-sobre-celeste motion-safe:transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}
