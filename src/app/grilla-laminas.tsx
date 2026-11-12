import Link from "next/link";

import type { LaminaDestacada } from "./laminas-destacadas.datos";

type Props = {
  laminas: LaminaDestacada[];
};

/**
 * Las rutas reales de hoy, por `entidadId` — mismo patrón que
 * `RUTA_POR_TIPO` en `grilla-salas.tsx`, pero por entidad y no por tipo: del
 * catálogo real, hoy solo Manuel Belgrano tiene ficha conectada
 * (`/catalogo/manuel-belgrano`, fuera de esta vidriera) y José de San Martín
 * tiene una ficha mockeada en `/ficha`. Las otras cuatro entidades de esta
 * vidriera no tienen ruta: sin entrada acá, la lámina se muestra como texto
 * (no como control), igual que «Véase también» en la ficha (ticket #224).
 * Crear contenido o rutas nuevas para esas cuatro es fuera de alcance de
 * este ticket (#89).
 */
const RUTA_POR_ENTIDAD: Partial<Record<string, string>> = {
  "jose-de-san-martin": "/ficha",
};

/**
 * La grilla de seis láminas destacadas, ya resueltas. Server Component: no
 * hay estado ni handlers; la navegación es la de un `<a>` real.
 *
 * Layout: `grid-cols-1` en mobile, 3×2 en desktop, con el `gap` de 44px
 * horizontal / 34px vertical que pide la spec — a propósito distinto del
 * `gap-px` de `GrillaSalas`, no hay línea divisoria entre láminas acá.
 *
 * Enlace real vs. texto (ticket #224): la lámina con ficha es un `<Link>`
 * —Cmd/Ctrl+clic y clic central la abren en otra pestaña, y el lector de
 * pantalla la anuncia como enlace—, mismo criterio que la celda con ruta de
 * `grilla-salas.tsx`. La lámina sin ficha es un `<div>`: sin foco, sin
 * cursor de mano y sin hover, para no parecer un control que no hace nada,
 * como «Véase también» de la ficha. Nunca un `<a>` anidado adentro de otro.
 * El hover de una lámina con ficha solo cambia el color de texto a
 * `--color-accent-800` — la imagen placeholder no reacciona al hover.
 */
const LAMINA_BASE = "flex flex-col items-center text-center";
const LAMINA_ENLACE =
  "group cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco";
const TEXTO_HOVER = "motion-safe:transition-colors motion-safe:duration-150 group-hover:text-accent-800";

export function GrillaLaminas({ laminas }: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-[44px] gap-y-[34px] sm:grid-cols-3">
      {laminas.map((lamina) => {
        const ruta = RUTA_POR_ENTIDAD[lamina.entidadId];
        const conEnlace = ruta !== undefined;
        const hover = conEnlace ? TEXTO_HOVER : "";

        const contenido = (
          <>
            {/*
             * Placeholder rayado, mismo patrón visual que la "lámina" de
             * `ficha-entidad.tsx`: relleno diagonal con los dos arena-borde
             * de la marca y una etiqueta monoespaciada del material que
             * falta. Decorativo: la imagen no lleva `alt` propio, el texto
             * accesible sale del nombre y el resumen más abajo, no de acá.
             */}
            <span
              aria-hidden="true"
              className="flex h-[230px] w-full items-end justify-center bg-[repeating-linear-gradient(135deg,var(--color-arena-borde)_0_7px,var(--color-arena-borde-suave)_7px_14px)] p-md outline outline-celeste-150"
            >
              <span className="border border-arena-borde-suave bg-crema px-sm py-xs font-mono text-chip font-normal tracking-normal leading-[1.6] text-texto-secundario">
                {lamina.slot}
              </span>
            </span>

            {/*
             * Kicker dorado: excepción deliberada de la marca (ver
             * `identidad-argentum`, regla de uso 4 y la nota del ticket #89)
             * — el único kicker dorado de la plataforma. No participa del
             * hover de texto de más abajo: cambiarlo a `--color-accent-800`
             * en hover borraría la excepción que lo hace reconocible.
             */}
            <span className="mt-lg font-cuerpo text-chip leading-normal tracking-[0.16em] text-accent-700 uppercase">
              {lamina.tipo}
            </span>

            <span
              className={`mt-xs text-pretty font-titulo text-[26px] leading-[1.15] font-normal text-texto-titulo ${hover}`}
            >
              {lamina.nombre}
            </span>

            <span className={`mt-xs font-titulo text-[14px] italic text-texto-secundario ${hover}`}>
              {lamina.meta}
            </span>

            <span
              className={`mt-md max-w-[34ch] font-cuerpo text-[14px] leading-[1.7] text-texto-cuerpo ${hover}`}
            >
              {lamina.resumen}
            </span>
          </>
        );

        if (conEnlace) {
          return (
            <Link key={lamina.entidadId} href={ruta} className={`${LAMINA_BASE} ${LAMINA_ENLACE}`}>
              {contenido}
            </Link>
          );
        }

        return (
          <div key={lamina.entidadId} className={LAMINA_BASE}>
            {contenido}
          </div>
        );
      })}
    </div>
  );
}
