import type { EstadisticasDeMazo } from "./tarjetas-repaso.datos";

/**
 * La franja de datos y la nota de cierre de "Tarjetas": cuatro columnas
 * iguales, cada una con un color que ya tiene su significado en la
 * plataforma —verde = positivo, dorado plano = cifra neutra, morado =
 * categórico, texto = metadato temporal—, sin gradientes. Server Component:
 * no depende del estado de la carta, así que la isla de cliente
 * (`tarjetas-repaso.tsx`) la recibe como `children` (ADR 0016).
 *
 * `dt` va primero en el DOM (el término antes de su valor) y `flex-col-reverse`
 * deja el valor arriba; `justify-end` los pega arriba, así que los valores
 * quedan alineados aunque una etiqueta envuelva a dos líneas. En pantallas
 * angostas la franja se acomoda en 2 × 2.
 */
export function FranjaDeDatos({ stats, totalDeTarjetas }: { stats: EstadisticasDeMazo; totalDeTarjetas: number }) {
  return (
    <>
      <dl className="mt-[34px] grid grid-cols-2 border-y border-borde-default bg-blanco sm:grid-cols-4">
        <Dato etiqueta="Aciertos en este mazo" clasesValor="text-ok tabular-nums lining-nums">
          {stats.aciertos}/{totalDeTarjetas}
        </Dato>
        <Dato etiqueta="Racha actual" clasesValor="text-tarjetas-dorado-provisorio tabular-nums lining-nums">
          {stats.racha}
        </Dato>
        <Dato etiqueta="Dominio de esta ficha" clasesValor="text-acento-repaso-700">
          {stats.dominio}
        </Dato>
        <Dato etiqueta="Último repaso" clasesValor="text-texto-titulo">
          {stats.ultimoRepaso}
        </Dato>
      </dl>

      <p className="mt-[18px] text-center font-titulo text-[14px] italic text-texto-secundario">
        Cada respuesta queda como un evento; los puntos se calculan al leer.
      </p>
    </>
  );
}

function Dato({
  etiqueta,
  clasesValor,
  children,
}: {
  etiqueta: string;
  clasesValor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse justify-end border-l border-borde-default px-[10px] py-[18px] text-center nth-[n+3]:border-t sm:nth-[n+3]:border-t-0">
      <dt className="mt-xs font-cuerpo text-[9px] tracking-[0.14em] text-texto-secundario uppercase">{etiqueta}</dt>
      <dd className={`m-0 font-titulo text-[24px] leading-tight ${clasesValor}`}>{children}</dd>
    </div>
  );
}
