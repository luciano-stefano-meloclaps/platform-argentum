"use client";

import { useRouter } from "next/navigation";

import type { LaminaDestacada } from "./laminas-destacadas.datos";

type Props = {
  laminas: LaminaDestacada[];
  /**
   * Quien compone esta grilla decide qué pasa al elegir una lámina — este
   * componente no lo decide por su cuenta. Si no se provee, cae al
   * comportamiento por defecto de más abajo (`RUTA_POR_ENTIDAD`), mismo
   * criterio que `onSelectSala` en `grilla-salas.tsx`.
   */
  onAbrirFicha?: (entidadId: string) => void;
};

/**
 * Las rutas reales de hoy, por `entidadId` — mismo patrón que
 * `RUTA_POR_TIPO` en `grilla-salas.tsx`, pero por entidad y no por tipo: del
 * catálogo real, hoy solo Manuel Belgrano tiene ficha conectada
 * (`/catalogo/manuel-belgrano`, fuera de esta vidriera) y José de San Martín
 * tiene una ficha mockeada en `/ficha`. Las otras cuatro entidades de esta
 * vidriera no tienen ruta: sin entrada acá, el click no navega ni rompe.
 * Crear contenido o rutas nuevas para esas cuatro es fuera de alcance de
 * este ticket (#89).
 */
const RUTA_POR_ENTIDAD: Partial<Record<string, string>> = {
  "jose-de-san-martin": "/ficha",
};

/**
 * La grilla de seis láminas destacadas, ya resueltas. Único fragmento de
 * cliente de la sección: necesita `onClick` en cada lámina y `useRouter`
 * para el comportamiento de navegación por defecto.
 *
 * Layout: `grid-cols-1` en mobile, 3×2 en desktop, con el `gap` de 44px
 * horizontal / 34px vertical que pide la spec — a propósito distinto del
 * `gap-px` de `GrillaSalas`, no hay línea divisoria entre láminas acá.
 *
 * Cada lámina es un único `<button>` clickeable completo: nunca un `<a>`
 * anidado adentro (ni al revés). El hover solo cambia el color de texto a
 * `--color-accent-800` — la imagen placeholder no reacciona al hover.
 */
export function GrillaLaminas({ laminas, onAbrirFicha }: Props) {
  const router = useRouter();

  function manejarClick(lamina: LaminaDestacada) {
    if (onAbrirFicha !== undefined) {
      onAbrirFicha(lamina.entidadId);
      return;
    }

    const ruta = RUTA_POR_ENTIDAD[lamina.entidadId];
    if (ruta !== undefined) {
      router.push(ruta);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-x-[44px] gap-y-[34px] sm:grid-cols-3">
      {laminas.map((lamina) => (
        <button
          key={lamina.entidadId}
          type="button"
          onClick={() => {
            manejarClick(lamina);
          }}
          className="group flex cursor-pointer touch-manipulation flex-col items-center border-0 bg-transparent p-0 text-center [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-celeste-700"
        >
          {/*
           * Placeholder rayado, mismo patrón visual que la "lámina" de
           * `ficha-entidad.tsx`: relleno diagonal con los dos arena-borde de
           * la marca y una etiqueta monoespaciada del material que falta.
           * Decorativo: la imagen no lleva `alt` propio, el texto accesible
           * del botón sale del nombre y el resumen más abajo, no de acá.
           */}
          <span
            aria-hidden="true"
            className="flex h-[230px] w-full items-end justify-center bg-[repeating-linear-gradient(135deg,var(--color-arena-borde)_0_7px,var(--color-arena-borde-suave)_7px_14px)] p-md outline outline-celeste-150"
          >
            <span className="border border-arena-borde-suave bg-crema px-sm py-xs font-mono text-[10px] leading-[1.6] text-texto-secundario">
              {lamina.slot}
            </span>
          </span>

          {/*
           * Kicker dorado: excepción deliberada de la marca (ver
           * `identidad-argentum`, regla de uso 4 y la nota del ticket #89) —
           * el único kicker dorado de la plataforma. No participa del hover
           * de texto de más abajo: cambiarlo a `--color-accent-800` en hover
           * borraría la excepción que lo hace reconocible.
           */}
          <span className="mt-lg font-cuerpo text-[11px] font-semibold tracking-[0.16em] text-accent-700 uppercase">
            {lamina.tipo}
          </span>

          <span className="mt-xs text-pretty font-titulo text-[26px] leading-[1.15] font-normal text-texto-titulo motion-safe:transition-colors motion-safe:duration-150 group-hover:text-accent-800">
            {lamina.nombre}
          </span>

          <span className="mt-xs font-titulo text-[14px] italic text-texto-secundario motion-safe:transition-colors motion-safe:duration-150 group-hover:text-accent-800">
            {lamina.meta}
          </span>

          <span className="mt-md max-w-[34ch] font-cuerpo text-[14px] leading-[1.7] text-texto-cuerpo motion-safe:transition-colors motion-safe:duration-150 group-hover:text-accent-800">
            {lamina.resumen}
          </span>
        </button>
      ))}
    </div>
  );
}
