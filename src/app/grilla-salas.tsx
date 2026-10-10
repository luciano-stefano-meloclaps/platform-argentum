"use client";

import Link from "next/link";

import type { SalaTipo } from "./salas-del-catalogo.datos";

/**
 * Una sala ya con su cantidad resuelta — lo que `SalasDelCatalogo`
 * (`salas-del-catalogo.tsx`) le pasa a este componente después de pedirle el
 * conteo a `contarEntidadesPorTipo`. Tipo local a esta pantalla, igual que
 * `SalaTipo`: ver el porqué en `salas-del-catalogo.datos.ts`.
 */
export type Sala = {
  numero: string;
  tipo: SalaTipo;
  nombre: string;
  cantidad: number;
};

type Props = {
  salas: Sala[];
  /**
   * Quien compone esta grilla decide qué pasa al elegir una sala — este
   * componente no lo decide por su cuenta. Si no se provee, cae al
   * comportamiento por defecto de más abajo (`RUTA_POR_TIPO`), pensado para
   * el único consumidor real hoy (`salas-del-catalogo.tsx` en la home), pero
   * sin que la grilla dependa de conocerlo.
   */
  onSelectSala?: (sala: Sala) => void;
};

/**
 * Las rutas reales de hoy, una por tipo. Solo Próceres tiene listado propio
 * (`/catalogo`, ticket #33) — los otros cinco tipos no tienen descriptor ni
 * contenido todavía (fuera de alcance de esta sección), así que no hay
 * adónde navegar: el click no hace nada, no es un link roto ni un 404.
 * Deliberadamente **no** se distingue visualmente esa sala inerte de las
 * demás (a diferencia de la versión anterior de este componente, que
 * marcaba "Próximamente"): el pedido explícito de este rediseño es que las
 * seis celdas se vean y se comporten igual, sin variantes por categoría.
 */
const RUTA_POR_TIPO: Partial<Record<SalaTipo, string>> = {
  procer: "/catalogo",
};

/**
 * La grilla de seis salas del catálogo, ya con el conteo resuelto. Único
 * fragmento de cliente de la sección: necesita `onClick` cuando el
 * consumidor pide una acción propia vía `onSelectSala`.
 *
 * Layout: `grid-cols-2` en mobile, `sm:grid-cols-3` — nunca una columna,
 * nunca scroll horizontal, siempre 3×2 en desktop (ADR de diseño de esta
 * sección: seis celdas fijas, ni paginadas ni infinitas). El `gap-px` sobre
 * `bg-celeste-150` es lo que dibuja las líneas divisorias entre celdas — no
 * son bordes por celda, es el hueco del grid mostrando el fondo de atrás; no
 * reemplazar por `border` en cada `<button>`.
 *
 * Foco y objetivo táctil: el anillo de foco es el de la marca,
 * `outline-foco` (`--color-foco`, ticket #212; antes era un celeste, de
 * cuando ese token no existía). Sobre los dos fondos reales de la celda
 * (`--blanco` y `--celeste-50`) supera el piso de 3:1 de WCAG 1.4.11 para
 * indicadores no textuales. No hace falta un `min-h`/`min-w` explícito de
 * objetivo táctil: el contenido de la celda (padding + numeral + separador
 * + título + caption) ya da un alto muy por encima de 44px en cualquier
 * viewport.
 *
 * `px-[26px] py-[30px]` de la celda y `h-px w-[26px]` del separador
 * decorativo quedan como excepciones revisadas (`brand-specialist`, ticket
 * #88): son valores sin precedente exacto en otra pantalla hoy. El caption
 * va en `text-chip` (11px, el piso de la marca; ticket #212) con su propio
 * `tracking-[0.14em]` y peso regular.
 *
 * Navegación real vs. callback (hallazgo del `ui-reviewer`, corregido en esta
 * misma pasada): la celda con ruta real (hoy, solo Próceres) se renderiza
 * como `<Link>`, no como un `<button onClick={() => router.push(...)}>` —
 * eso rompía Cmd/Ctrl+click, click central y la vista previa de URL al pasar
 * el mouse, que sí funcionan con un `<a>` real. Cuando `onSelectSala` está
 * presente, el consumidor pidió una acción propia (por ejemplo, una
 * selección en memoria, no una navegación de página), así que ahí se
 * mantiene `<button onClick>` para las seis celdas. Las celdas sin ruta y
 * sin `onSelectSala` quedan como `<button>` inerte, sin `onClick` — mismo
 * marcado y misma clase que las demás, para no romper la uniformidad visual
 * que pide el ticket; que ese click sin efecto no dé ninguna señal es una
 * observación de producto que dejó el `ui-reviewer`, no un incumplimiento de
 * `revision-de-ui`.
 */
const CELDA_CLASE =
  "block cursor-pointer touch-manipulation border-0 bg-blanco px-[26px] py-[30px] text-center font-cuerpo text-texto-cuerpo [-webkit-tap-highlight-color:transparent] motion-safe:transition-colors motion-safe:duration-150 hover:bg-celeste-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

export function GrillaSalas({ salas, onSelectSala }: Props) {
  return (
    <div className="grid grid-cols-2 gap-px border border-celeste-150 bg-celeste-150 sm:grid-cols-3">
      {salas.map((sala) => {
        const contenido = (
          <>
            {/*
             * Numeral decorativo: el orden de la sala ya lo transmite su
             * posición en la grilla, así que se oculta a lectores de
             * pantalla en vez de anunciarse letra por letra ("II" como "i,
             * i"). El identificador accesible del botón/link es el nombre en
             * texto, más abajo. `lining-nums`: pedido explícito de la spec —
             * sobre un numeral romano (no dígitos arábigos) es probablemente
             * un no-op, pero no rompe nada y respeta la especificación tal
             * como se dio.
             */}
            <span aria-hidden="true" className="au block font-titulo text-[22px] tracking-[0.12em] lining-nums">
              {sala.numero}
            </span>
            <span aria-hidden="true" className="mx-auto my-md block h-px w-[26px] bg-celeste-150" />
            <span className="block text-pretty font-titulo text-tile-title not-italic text-texto-titulo">
              {sala.nombre}
            </span>
            <span className="mt-[10px] block font-cuerpo text-chip font-normal leading-normal tracking-[0.14em] text-texto-secundario uppercase tabular-nums">
              {sala.cantidad} entidades
            </span>
          </>
        );

        if (onSelectSala === undefined) {
          const ruta = RUTA_POR_TIPO[sala.tipo];
          if (ruta !== undefined) {
            return (
              <Link key={sala.tipo} href={ruta} className={CELDA_CLASE}>
                {contenido}
              </Link>
            );
          }

          return (
            <button key={sala.tipo} type="button" className={CELDA_CLASE}>
              {contenido}
            </button>
          );
        }

        return (
          <button
            key={sala.tipo}
            type="button"
            onClick={() => {
              onSelectSala(sala);
            }}
            className={CELDA_CLASE}
          >
            {contenido}
          </button>
        );
      })}
    </div>
  );
}
