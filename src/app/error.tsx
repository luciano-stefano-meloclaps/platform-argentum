"use client";

import Link from "next/link";

/**
 * Lo que ve el lector cuando una página falla de forma inesperada (ticket
 * #211; ADR 0016, Reglas 4 y 8). Next exige que un límite de error sea Client
 * Component: por eso `"use client"`, y por eso es el componente más chico
 * posible, sin datos ni estado propio.
 *
 * Es el `error` raíz: envuelve todas las páginas pero no a `layout.tsx`, así
 * que el header sigue en pantalla y el lector no pierde la navegación. Un
 * fallo del propio layout raíz lo atraparía un `global-error.tsx`, que el
 * ticket no pide y que, sin él, resuelve la página de error de Next.
 *
 * Dice qué pasó y qué puede hacer el lector, sin tecnicismos: no muestra
 * `error.message` (en producción Next lo reemplaza por un texto genérico en
 * inglés) ni el `digest` (no hay a quién informárselo todavía). Y deja claro
 * que el fallo no es suyo: nada castiga.
 *
 * `retry` (estable desde Next 16.3) vuelve a pedir y a renderizar el segmento;
 * es la salida natural cuando el fallo fue pasajero. Si no alcanza, quedan el
 * inicio y el índice del catálogo.
 *
 * El título de la pestaña va con `<title>` de React 19, porque un Client
 * Component no puede exportar `metadata`.
 *
 * Contrastes sobre `bg-crema` (skill `identidad-argentum` §3): botón dorado
 * `accent-700` 4.58:1 y, al pasar el cursor, `accent-800` sobre `accent-300`
 * 6.81:1; enlaces `celeste-text` 6.12:1, que al pasar el cursor solo engrosan
 * el subrayado. Ningún estado baja de AA.
 */
export default function ErrorInesperado({
  retry,
}: Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>) {
  return (
    <main
      id="contenido"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-lg py-2xl text-center"
    >
      <title>Algo falló | Argentum</title>
      <h1 className="text-balance font-titulo text-h1 text-texto-titulo">Esta página no pudo mostrarse</h1>
      <p className="mt-sm max-w-md text-pretty font-cuerpo text-body-lg text-texto-secundario">
        Algo falló de nuestro lado mientras la preparábamos; no es nada que hayas hecho vos. Probá de nuevo: muchas
        veces alcanza. Si sigue sin aparecer, volvé al inicio y regresá en un rato.
      </p>
      <div className="mt-xl flex flex-wrap items-center justify-center gap-md">
        <button
          type="button"
          onClick={() => {
            retry();
          }}
          className="inline-flex min-h-objetivo-tactil cursor-pointer touch-manipulation items-center justify-center border border-accent-700 bg-transparent px-lg py-sm text-center font-cuerpo text-button text-accent-700 motion-safe:transition-colors motion-safe:duration-150 hover:bg-accent-300 hover:text-accent-800 active:bg-accent-300 active:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex min-h-objetivo-tactil touch-manipulation items-center justify-center px-sm font-cuerpo text-button text-celeste-text underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Volver al inicio
        </Link>
        <Link
          href="/catalogo"
          className="inline-flex min-h-objetivo-tactil touch-manipulation items-center justify-center px-sm font-cuerpo text-button text-celeste-text underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
        >
          Ir al índice del catálogo
        </Link>
      </div>
    </main>
  );
}
