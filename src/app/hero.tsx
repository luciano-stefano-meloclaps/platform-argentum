import { EstadisticasCatalogo } from "./estadisticas-catalogo.tsx";

/**
 * El hero de la home (ticket #65): lo primero que ve quien entra a la
 * aplicación. Eyebrow, título, un divisor decorativo, la bajada, y debajo
 * la barra de estadísticas del catálogo.
 *
 * Franja `bg-celeste-50` de borde a borde: es el token que la marca
 * documenta explícitamente para "fondos de página, cabeceras suaves"
 * (`identidad-argentum`, tabla de celeste — `docs/marca/sistema-de-diseno.md`
 * §3), así que usarlo acá es consumir un token ya aprobado, no agregar uno
 * nuevo. Adentro, un contenedor `mx-auto max-w-5xl px-lg` — mismo patrón que
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
    <section className="bg-celeste-50">
      <div className="mx-auto max-w-5xl px-lg py-2xl">
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

        {/*
         * Divisor decorativo. La referencia visual del ticket lo muestra con
         * un filete dorado y un rombo central (patrón "Rombo separador" de
         * `identidad-argentum`, v2/ADR 0015) — pero ese patrón depende de
         * `--color-accent-700` y del gradiente `.au`, que todavía no están
         * en el bloque `@theme` de `globals.css` (ni Lora reemplazó a
         * Montserrat ahí, pese al ADR 0015). No lo repliqué con un color a
         * mano: se queda con `arena-borde-suave`, el token de v1 para
         * divisores finos, hasta que el `brand-specialist` incorpore los
         * tokens de v2 al tema — ver resumen de la revisión.
         */}
        <div aria-hidden="true" className="my-lg h-px w-16 bg-arena-borde-suave" />

        <p className="max-w-2xl font-cuerpo text-body-lg text-texto-secundario">
          Próceres, monumentos, animales, comidas y fechas patrias: cada ficha
          cuenta su historia con la voz de una gesta. Explorá el catálogo,
          repasá con tarjetas y ponete a prueba en el quiz.
        </p>

        <EstadisticasCatalogo />
      </div>
    </section>
  );
}
