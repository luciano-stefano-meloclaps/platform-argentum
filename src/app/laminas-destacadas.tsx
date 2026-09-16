import Link from "next/link";

import { GrillaLaminas } from "./grilla-laminas.tsx";
import { LAMINAS_DESTACADAS } from "./laminas-destacadas.datos.ts";

type Props = {
  /**
   * El total de fichas publicadas, para el link "Ver las N fichas" — nunca
   * hardcodeado acá. Lo resuelve quien compone esta sección (`page.tsx`),
   * hoy contra `obtenerEstadisticasCatalogo()` (mismo total que "Fichas
   * publicadas" del hero, ticket #65): las dos cifras cuentan el mismo
   * universo de entidades y tienen que coincidir.
   */
  totalFichas: number;
};

/**
 * "Láminas destacadas": una vidriera de seis láminas curadas, una por sala,
 * debajo de "Las salas del catálogo" en la pantalla Explorar/Home (ticket
 * #89). A diferencia de esa sección —el índice completo de las seis
 * categorías—, acá se muestra contenido individual: una entidad concreta
 * por sala, con su imagen, su resumen y un click que intenta abrir su
 * Ficha.
 *
 * Sobre fondo hueso (`--color-crema`, heredado del `<body>` en
 * `layout.tsx`): a propósito no lleva `bg-celeste-*`, para distinguirse de
 * la banda celeste del Hero.
 *
 * Server Component: solo arma el encabezado y pasa el mock a `GrillaLaminas`
 * — la interactividad (el `onClick` de cada lámina) vive ahí, la única isla
 * de cliente de esta sección, mismo criterio que `SalasDelCatalogo` +
 * `GrillaSalas`.
 */
export function LaminasDestacadas({ totalFichas }: Props) {
  return (
    <section className="mx-auto max-w-5xl px-lg pb-2xl">
      {/*
       * Encabezado de sección: a propósito distinto del de "Las salas del
       * catálogo" (kicker centrado, sin link) — acá es un `h2` a la
       * izquierda y un link "Ver las N fichas" a la derecha, alineados por
       * baseline, con un borde inferior compartido en negro cálido
       * (`--color-texto-cuerpo`, el neutro cálido más oscuro de la escala de
       * textos — no hay un token literal `--color-text`; confirmado con el
       * `brand-specialist`). Es deliberadamente distinto del celeste/dorado
       * que usan los demás encabezados de sección de esta pantalla.
       */}
      <div className="mt-2xl mb-[26px] flex items-baseline justify-between gap-lg border-b border-texto-cuerpo pb-md">
        <h2 className="m-0 font-titulo text-[15px] font-semibold tracking-[0.2em] text-texto-titulo uppercase">
          Láminas destacadas
        </h2>
        <Link
          href="/catalogo"
          className="shrink-0 font-cuerpo text-[12px] font-semibold tracking-[0.1em] text-texto-cuerpo uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
        >
          Ver las {totalFichas} fichas
        </Link>
      </div>

      <GrillaLaminas laminas={LAMINAS_DESTACADAS} />
    </section>
  );
}
