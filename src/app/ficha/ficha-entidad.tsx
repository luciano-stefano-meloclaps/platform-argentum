"use client";

import Link from "next/link";

import type { EntidadDeFicha } from "./ficha-entidad.datos.ts";

type Props = {
  entidad: EntidadDeFicha;
  /**
   * Las tres acciones de la pantalla. Son opcionales porque ninguna de las
   * pantallas de destino existe todavía —Tarjetas, el flujo de moderación y
   * Propuestas no están construidas—, así que el único consumidor de hoy
   * (`page.tsx`) no las provee y el click no hace nada. Mismo criterio que
   * `onSelectSala` en `grilla-salas.tsx`: la pantalla no decide por su cuenta
   * qué pasa al apretar, lo decide quien la compone.
   */
  onRepasar?: () => void;
  onProponerCambio?: () => void;
  onVerHistorial?: () => void;
};

/** El número de orden dentro de la sala, con cero a la izquierda. */
function numeroDeFicha(numero: number): string {
  return String(numero).padStart(2, "0");
}

/**
 * La pantalla "Ficha": la vista de detalle de una entidad del catálogo, y la
 * vista más densa de contenido de toda la plataforma. Tres bloques
 * verticales: breadcrumb, banda celeste de cabecera, y el cuerpo en dos
 * columnas (imagen y acciones a la izquierda, lectura y datos a la derecha).
 *
 * Client Component, y es la excepción a la regla de esta base de código
 * —donde el patrón es sección de servidor + isla de cliente chica, como
 * `salas-del-catalogo.tsx` con `grilla-salas.tsx`—. El motivo: acá lo
 * interactivo no es un rincón sino las tres acciones que atraviesan la
 * pantalla de arriba abajo (dos botones en la columna izquierda, un link
 * dentro del párrafo de historial al final de la derecha), y partirlas en
 * tres islas para dejar de servidor un texto que igual no cambia costaría
 * tres archivos y un contrato por isla. Cuando las tres pantallas de destino
 * existan y las acciones pasen a ser navegación real (`<Link>`), esta
 * pantalla vuelve a ser Server Component y el `"use client"` se va.
 *
 * Varias métricas de esta pantalla (60px de H1, 300px de columna, 52px de
 * gap, 380px de imagen, 74px de capital) no tienen token equivalente en
 * `identidad-argentum` y están fijadas a nivel de píxel a propósito, así que
 * van como valores arbitrarios de Tailwind — mismo criterio que `hero.tsx` y
 * `grilla-salas.tsx`. Las familias y los colores, en cambio, siempre por
 * token: `font-titulo`, `font-cuerpo`, `text-celeste-text`, `bg-celeste-50`,
 * `border-celeste-150`, `bg-accent`, `text-accent-700`.
 */
export function FichaEntidad({ entidad, onRepasar, onProponerCambio, onVerHistorial }: Props) {
  const [primerParrafo, ...restoDeParrafos] = entidad.parrafos;

  return (
    <article>
      {/*
       * Breadcrumb. El separador entre tramos es un em dash con espacios,
       * literal y no un ícono de chevron: es tipografía de cédula de museo,
       * no un control de navegación. Se marca como `<nav>` con nombre para
       * que un lector de pantalla pueda saltarlo, y el tramo actual —el
       * nombre de esta ficha— no es link: es `aria-current="page"`.
       */}
      <nav aria-label="Migas de pan" className="px-lg text-center">
        <ol className="m-0 flex list-none flex-wrap items-center justify-center gap-x-[6px] p-0 font-cuerpo text-[10px] tracking-[0.16em] text-texto-terciario uppercase">
          <li>
            <Link href="/" className="text-texto-terciario underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700">
              Catálogo
            </Link>
          </li>
          <li aria-hidden="true">—</li>
          <li>
            <Link href={entidad.salaHref} className="text-texto-terciario underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700">
              {entidad.sala}
            </Link>
          </li>
          <li aria-hidden="true">—</li>
          <li aria-current="page" className="tabular-nums">
            Ficha n.º {numeroDeFicha(entidad.numeroFicha)}
          </li>
        </ol>
      </nav>

      {/*
       * Banda celeste de cabecera, de borde a borde de la página igual que la
       * del hero — pero sin kicker arriba: acá el breadcrumb ya cumple la
       * función de contexto, así que empieza directo por el H1.
       */}
      <header className="mt-[22px] border-y border-celeste-150 bg-celeste-50 px-[30px] py-[38px] text-center">
        {/*
         * `font-normal` explícito: 400 incluso en el H1 más grande de todo el
         * sistema. La jerarquía de esta pantalla es puramente de tamaño, no
         * de peso — 60px, más que los 52px del hero.
         */}
        <h1 className="m-0 text-balance font-titulo text-[38px] leading-[1.05] font-normal text-texto-titulo sm:text-[60px]">
          {entidad.nombre}
        </h1>

        <p className="mt-[10px] font-titulo text-[18px] italic text-celeste-text sm:text-[21px]">
          {entidad.epiteto}
        </p>

        {/*
         * Rombo separador de `identidad-argentum` (v2/ADR 0015): líneas
         * doradas (`bg-accent`) flanqueando un rombo celeste. Más ancho que
         * el del hero —90px por lado contra 70px— porque acompaña un H1 de
         * 60px, no de 52px.
         */}
        <div aria-hidden="true" className="mt-[24px] flex items-center justify-center gap-[12px]">
          <span className="h-px w-[90px] bg-accent" />
          <span className="h-[5px] w-[5px] rotate-45 bg-celeste-400" />
          <span className="h-px w-[90px] bg-accent" />
        </div>
      </header>

      {/*
       * Cuerpo. La columna izquierda es 300px **fijos**, no una fracción: el
       * ancho de la imagen no respira con el viewport en desktop. Debajo de
       * 720px pasa a una sola columna, con la imagen arriba y el texto abajo
       * — el orden del marcado es el orden de lectura, no se invierte.
       */}
      <div className="mx-auto mt-[46px] grid max-w-5xl grid-cols-1 items-start gap-[52px] px-lg pb-2xl min-[720px]:grid-cols-[300px_1fr]">
        {/* ── Columna izquierda ─────────────────────────────────────────── */}
        <div>
          <figure className="m-0">
            {/*
             * La "lámina": arco arriba y esquina recta abajo, la forma de
             * medallón que la plataforma repite para los retratos. Mientras
             * no haya archivo real, el relleno es el rayado diagonal con una
             * etiqueta monoespaciada que dice qué imagen falta y qué tamaño
             * ocupa el slot — el `×` es el signo de multiplicación unicode,
             * no la letra x.
             */}
            <div
              role="img"
              aria-label={entidad.imagenAlt}
              className="flex h-[380px] items-end justify-center rounded-t-[150px] rounded-b-[2px] bg-[repeating-linear-gradient(135deg,var(--color-arena-borde)_0_7px,var(--color-arena-borde-suave)_7px_14px)] p-[18px] outline outline-celeste-150"
            >
              <span className="border border-arena-borde-suave bg-crema px-sm py-xs text-center font-mono text-[10px] leading-[1.6] text-texto-secundario">
                {entidad.imagenNota}
                <br />
                300 × 380
              </span>
            </div>

            <figcaption className="mt-[12px] text-center font-titulo text-[13px] italic text-texto-terciario">
              {entidad.imagenCaption}
            </figcaption>
          </figure>

          {/*
           * Acciones, en columna y a ancho completo de los 300px. "Repasar
           * esta ficha" es SIEMPRE el primero y SIEMPRE el primario (contorno
           * dorado): es la conversión de retención de esta pantalla. Proponer
           * un cambio es secundario por definición — entra al flujo de
           * moderación, que no es la acción principal de un lector.
           */}
          <div className="mt-[26px] flex flex-col gap-[10px]">
            <button
              type="button"
              onClick={onRepasar}
              className="w-full cursor-pointer touch-manipulation rounded-sm border border-accent-600 bg-dorado-bg px-lg py-[14px] font-cuerpo text-[11px] font-semibold tracking-[0.14em] text-accent-800 uppercase motion-safe:transition-colors motion-safe:duration-150 hover:bg-accent-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
            >
              Repasar esta ficha
            </button>
            <button
              type="button"
              onClick={onProponerCambio}
              className="w-full cursor-pointer touch-manipulation rounded-sm border border-borde-strong bg-blanco px-lg py-[14px] font-cuerpo text-[11px] font-semibold tracking-[0.14em] text-texto-cuerpo uppercase motion-safe:transition-colors motion-safe:duration-150 hover:bg-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
            >
              Proponer un cambio
            </button>
          </div>
        </div>

        {/* ── Columna derecha ───────────────────────────────────────────── */}
        <div className="min-w-0">
          {/*
           * Único bloque de texto justificado de la plataforma, con
           * `hyphens-auto` para que la justificación no abra ríos de espacio.
           * La letra capital va solo en el primer párrafo, en dorado oscuro
           * (`text-accent-700`, el único dorado que la marca habilita como
           * texto): el gradiente `.au` se reserva para el logotipo y las
           * cifras, no para lectura larga.
           */}
          {primerParrafo !== undefined && (
            <p className="m-0 font-cuerpo text-[16px] leading-[1.85] text-justify text-texto-cuerpo hyphens-auto">
              <span
                aria-hidden="true"
                className="float-left pt-[6px] pr-[12px] font-titulo text-[74px] leading-[0.78] text-accent-700"
              >
                {primerParrafo.slice(0, 1)}
              </span>
              {primerParrafo.slice(1)}
            </p>
          )}

          {restoDeParrafos.map((parrafo, indice) => (
            <p
              key={indice}
              className="mt-[18px] mb-0 font-cuerpo text-[16px] leading-[1.85] text-justify text-texto-cuerpo hyphens-auto"
            >
              {parrafo}
            </p>
          ))}

          <SeparadorDeSubseccion>Datos de la ficha</SeparadorDeSubseccion>

          {/*
           * Tabla de ficha técnica en formato diccionario: cuatro columnas
           * (clave-valor-clave-valor), dos pares por fila. No es una tabla
           * con `<thead>` de columnas ni una lista de tarjetas — las claves
           * son encabezados de fila, y por eso van con `scope="row"`.
           * `tabular-nums` en todos los valores: las fechas y cifras tienen
           * que alinearse en columna.
           */}
          <table className="w-full border-collapse font-cuerpo text-[14px] leading-[1.7]">
            <tbody>
              {entidad.datos.map((fila, indice) => (
                <tr key={indice} className="border-b border-arena-borde-suave">
                  <th
                    scope="row"
                    className="w-[120px] py-[10px] pr-md text-left align-top font-cuerpo text-[10px] font-semibold tracking-[0.14em] text-texto-terciario uppercase"
                  >
                    {fila.k1}
                  </th>
                  <td className="w-[30%] py-[10px] pr-lg align-top text-texto-cuerpo tabular-nums">{fila.v1}</td>
                  <th
                    scope="row"
                    className="w-[120px] py-[10px] pr-md text-left align-top font-cuerpo text-[10px] font-semibold tracking-[0.14em] text-texto-terciario uppercase"
                  >
                    {fila.k2}
                  </th>
                  <td className="py-[10px] align-top text-texto-cuerpo tabular-nums">{fila.v2}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SeparadorDeSubseccion>Véase también</SeparadorDeSubseccion>

          <ul className="m-0 grid list-none grid-cols-1 gap-x-[34px] gap-y-[2px] p-0 sm:grid-cols-2">
            {entidad.relacionadas.map((relacionada) => (
              <li key={relacionada.nombre} className="min-w-0">
                <Relacionada relacionada={relacionada} />
              </li>
            ))}
          </ul>

          {/*
           * Nota de historial: el cierre de la ficha, siempre al final de
           * esta columna y nunca arriba del texto de lectura. Usa el trío
           * celeste de las notas informativas de toda la plataforma
           * —`celeste-50` de fondo, `celeste-150` de borde, `celeste-400` en
           * el borde izquierdo más grueso—, sin inventar un cuarto tono.
           */}
          <aside className="mt-[34px] border border-celeste-150 border-l-2 border-l-celeste-400 px-[24px] py-[20px] bg-celeste-50">
            <p className="m-0 font-cuerpo text-[10px] font-semibold tracking-[0.16em] text-celeste-text uppercase">
              Historial
            </p>
            <p className="mt-sm mb-0 font-cuerpo text-[14px] leading-[1.8] text-texto-cuerpo">
              {entidad.historialResumen}{" "}
              <button
                type="button"
                onClick={onVerHistorial}
                className="cursor-pointer border-0 bg-transparent p-0 font-cuerpo text-[14px] text-celeste-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
              >
                Ver el historial
              </button>
            </p>
          </aside>
        </div>
      </div>
    </article>
  );
}

/**
 * El separador de subsección de la columna derecha: una etiqueta en
 * versalitas y una línea que rellena el ancho que sobra. Se repite igual
 * para cada subsección (datos, relacionadas) — no hay una segunda variante.
 * La línea es decorativa: el `<h2>` ya es el encabezado real de la
 * subsección para un lector de pantalla.
 */
function SeparadorDeSubseccion({ children }: { children: string }) {
  return (
    <div className="mt-[34px] mb-lg flex items-center gap-[14px]">
      <h2 className="m-0 font-cuerpo text-[10px] font-semibold tracking-[0.18em] text-texto-terciario uppercase">
        {children}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-arena-borde-suave" />
    </div>
  );
}

/**
 * Una entrada de "Véase también". La línea punteada entre el nombre y el
 * tipo es deliberada: imita el punteado de un índice de libro entre el
 * título y el número de página, y acá el "número de página" es el tipo de
 * entidad. Es decorativa y va oculta a lectores de pantalla.
 *
 * Cuando la ficha relacionada todavía no tiene ruta propia, la entrada se
 * renderiza como texto y no como link: es preferible a un link que va a
 * ningún lado.
 */
function Relacionada({ relacionada }: { relacionada: { nombre: string; tipo: string; href?: string } }) {
  const contenido = (
    <>
      <span className="min-w-0 font-titulo text-[17px] text-texto-titulo [overflow-wrap:anywhere]">
        {relacionada.nombre}
      </span>
      <span
        aria-hidden="true"
        className="-translate-y-[3px] flex-1 border-b border-dotted border-borde-strong"
      />
      <span className="flex-none font-cuerpo text-[10px] tracking-[0.14em] text-texto-terciario uppercase">
        {relacionada.tipo}
      </span>
    </>
  );

  const clases = "flex min-w-0 items-baseline gap-[10px] border-b border-arena-borde-suave py-[9px]";

  if (relacionada.href === undefined) {
    return <span className={clases}>{contenido}</span>;
  }

  return (
    <Link
      href={relacionada.href}
      className={`${clases} no-underline motion-safe:transition-colors motion-safe:duration-150 hover:bg-dorado-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700`}
    >
      {contenido}
    </Link>
  );
}
