import { EstadisticasCatalogo } from "./estadisticas-catalogo.tsx";

/**
 * El hero de la home (ticket #65): lo primero que ve quien entra a la
 * aplicación. Eyebrow, título, un divisor decorativo, la bajada, y debajo
 * la barra de estadísticas del catálogo.
 *
 * Contenedor `mx-auto max-w-5xl px-lg` — mismo patrón que
 * `src/app/catalogo/page.tsx` — para que el ancho de línea del título y la
 * bajada no dependa del ancho de la ventana.
 *
 * Server Component: no hay estado ni interacción acá. La única isla de
 * cliente de esta pantalla vive dos niveles más abajo, en
 * `contador-estadistica.tsx`.
 *
 * Fuera de alcance de este ticket: el header/nav completo (wordmark, franja
 * de marca, ítems de navegación) — apunta a pantallas que todavía no
 * existen.
 */
export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-lg py-2xl">
      {/*
       * Eyebrow = "kicker de sección" (identidad-argentum, tabla de
       * tipografía): Cormorant Garamond, peso 600 — `font-titulo` en vez de
       * `font-cuerpo`. `text-label` ya trae ese peso, así que no hace falta
       * un token nuevo.
       */}
      <p className="font-titulo text-label uppercase tracking-wide text-celeste-text">Catálogo argentino</p>

      <h1 className="mt-xs text-balance font-titulo text-h1 text-texto-titulo sm:text-display">
        Conocé la Argentina, ficha por ficha
      </h1>

      {/* Divisor decorativo — arena-borde-suave es el token de la marca para divisores finos. */}
      <div aria-hidden="true" className="my-lg h-px w-16 bg-arena-borde-suave" />

      <p className="max-w-2xl font-cuerpo text-body-lg text-texto-secundario">
        Próceres, monumentos, animales, comidas y fechas patrias: cada ficha
        cuenta su historia con la voz de una gesta. Explorá el catálogo,
        repasá con tarjetas y ponete a prueba en el quiz.
      </p>

      <EstadisticasCatalogo />
    </section>
  );
}
