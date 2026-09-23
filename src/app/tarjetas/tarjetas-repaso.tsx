"use client";

import { useState } from "react";
import Link from "next/link";

import type { TarjetaDeRepaso, EstadisticasDeMazo } from "./tarjetas-repaso.datos.ts";

type Props = {
  mazoNombre: string;
  tarjetas: TarjetaDeRepaso[];
  stats: EstadisticasDeMazo;
  /**
   * Sin efecto real todavía: el enchufe a datos reales es de la nota de
   * revisión #92, fuera de alcance de esta rebanada. Si no se provee, cae a
   * un registro en consola — mismo criterio que `onRepasar` en
   * `ficha-entidad.tsx` y `onAbrirFicha` en `grilla-laminas.tsx`. El registro
   * ocurre siempre ANTES de avanzar a la siguiente tarjeta: es un requisito
   * de orden del ticket, pensado para cuando esto tenga un backend real
   * detrás.
   */
  onResponder?: (esVerdadero: boolean) => void;
  onAbrirFicha?: (entidadId: string) => void;
};

/**
 * Tag de color puntual para esta pantalla: morado, para "categoría/temática"
 * y "dominio" — nunca dorado ni celeste (regla del ticket #91). No es la
 * paleta de las 6 categorías de contenido (`--color-cat-*`, `identidad-argentum`
 * §1): esos hex son distintos, y "dominio de una tarjeta" no es lo mismo que
 * "tipo de entidad" — mezclarlos ahí haría que dos conceptos usen exactamente
 * el mismo color y dejaran de distinguirse. Cerca del morado de "Animales"
 * sin ser el mismo token — aprobado así explícitamente por el usuario.
 * Tokens creados por el `brand-specialist` para este uso puntual.
 */
const morado = {
  bg: "bg-acento-repaso-100",
  text: "text-acento-repaso-700",
};

/**
 * "Tarjeta N de M": la pantalla de repaso tipo flashcard, tal como pide el
 * ticket #91. Presentación pura sobre el mock de `tarjetas-repaso.datos.ts`.
 *
 * Client Component: hay estado (qué tarjeta, frente o dorso) e interacción de
 * teclado/click — no hace falta partir esto en una isla más chica, es
 * exactamente la interactividad de toda la pantalla.
 *
 * Estado: `mostrandoDorso` (frente/dorso de la carta actual) y
 * `tarjetaActual` (índice dentro del mazo); `pasos` (el arreglo de la barra
 * de progreso) es derivado de `tarjetas.length`, no estado propio.
 */
export function TarjetasRepaso({ mazoNombre, tarjetas, stats, onResponder, onAbrirFicha }: Props) {
  const [tarjetaActual, setTarjetaActual] = useState(0);
  const [mostrandoDorso, setMostrandoDorso] = useState(false);

  const tarjeta = tarjetas[tarjetaActual];

  function alternarDorso() {
    setMostrandoDorso((valor) => !valor);
  }

  function manejarTeclaDeCarta(evento: React.KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alternarDorso();
    }
  }

  function manejarRespuesta(esVerdadero: boolean) {
    // El registro del evento va SIEMPRE antes de avanzar el estado: es un
    // requisito del ticket, para que el orden ya esté bien cuando esto se
    // conecte a un backend real.
    if (onResponder !== undefined) {
      onResponder(esVerdadero);
    } else {
      console.log("[tarjetas] respuesta registrada:", esVerdadero, "para", tarjeta?.entidadId);
    }

    setMostrandoDorso(false);
    setTarjetaActual((indice) => (indice + 1) % tarjetas.length);
  }

  if (tarjeta === undefined) {
    // Mazo vacío: no debería pasar con el mock, pero un mazo real algún día
    // puede llegar sin tarjetas — nunca una pantalla en blanco sin
    // explicación.
    return (
      <main id="contenido" className="mx-auto max-w-[760px] px-lg py-2xl text-center">
        <p className="font-cuerpo text-texto-secundario">Este mazo todavía no tiene tarjetas para repasar.</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto max-w-[760px] px-lg py-2xl">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header className="text-center">
        <p className="font-cuerpo text-[10px] font-semibold tracking-[0.18em] text-celeste-text uppercase">
          Repaso · mazo de {mazoNombre.toLowerCase()}
        </p>

        <p className="mt-sm font-titulo text-[40px] leading-none font-normal text-texto-titulo">
          {/*
           * N en dorado oscuro PLANO, a propósito sin `.au` ni `.shiny`: es
           * la única cifra destacada de la plataforma en color sólido — el
           * resto usa el gradiente metálico de la marca (ver ticket #91).
           * Mismo token que "Racha actual" en la franja de estadísticas,
           * para que las dos cifras doradas de la pantalla usen el mismo
           * color.
           */}
          <span className="tabular-nums text-accent-700">{tarjetaActual + 1}</span>
          <span className="text-texto-secundario"> de {tarjetas.length}</span>
        </p>

        {/*
         * Barra de progreso: un segmento por tarjeta del mazo. `role="progressbar"`
         * con los tres `aria-value*` es el estado real para un lector de
         * pantalla; los segmentos individuales son decorativos
         * (`aria-hidden`) porque el color no es el único portador de
         * significado — el número "N de M" de arriba ya lo dice en texto.
         */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={tarjetas.length}
          aria-valuenow={tarjetaActual + 1}
          aria-valuetext={`Tarjeta ${tarjetaActual + 1} de ${tarjetas.length}`}
          className="mt-lg flex justify-center gap-xs"
        >
          {tarjetas.map((unaTarjeta, indice) => (
            <span
              key={unaTarjeta.entidadId + String(indice)}
              aria-hidden="true"
              className={`h-[3px] w-[20px] rounded-full ${
                indice < tarjetaActual ? "bg-ok" : indice === tarjetaActual ? "bg-celeste-text" : "bg-arena-borde"
              }`}
            />
          ))}
        </div>
      </header>

      {/* ── La carta ───────────────────────────────────────────────────── */}
      <div className="relative mt-2xl min-h-[360px]">
        {/* Capas decorativas del mazo apilado detrás de la carta activa. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-[10px] translate-y-[10px] rotate-[-2deg] rounded-xl border-2 border-accent-400 bg-blanco"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-[5px] translate-y-[5px] rotate-[1deg] rounded-xl border-2 border-accent-300 bg-blanco"
        />

        {/*
         * La carta real, `position: relative` para quedar encima de las dos
         * capas de arriba. El dorso contiene un `<Link>` real (navegación a
         * la ficha): un `role="button"` no puede envolverlo sin dejar un
         * interactivo anidado dentro de otro (hallazgo bloqueante de
         * `ui-reviewer`, ticket #91) — un `<button>` nativo tampoco podría,
         * por la misma razón, contener un `<a>`. Por eso el `role="button"`
         * es un **hermano superpuesto** vía CSS (`absolute inset-0`, capa
         * `z-0`), no un contenedor: cubre toda la carta para el click y el
         * teclado, pero el contenido (con el `<Link>` del dorso) vive fuera
         * de su árbol, en una capa `z-10` con `pointer-events-none` —
         * excepto el propio `<Link>`, que recupera `pointer-events-auto`
         * para seguir siendo alcanzable. `aria-pressed` anuncia el estado de
         * frente/dorso, como un botón de alternar cualquiera. Nunca gira con
         * animación 3D: es un reemplazo de contenido.
         */}
        <div className="relative min-h-[360px]">
          <div
            role="button"
            tabIndex={0}
            aria-pressed={mostrandoDorso}
            aria-label={mostrandoDorso ? "Volver a la pregunta de la tarjeta" : "Dar vuelta la tarjeta para ver la respuesta"}
            onClick={alternarDorso}
            onKeyDown={manejarTeclaDeCarta}
            className="absolute inset-0 z-0 cursor-pointer touch-manipulation rounded-xl outline-offset-[6px] motion-safe:transition-shadow motion-safe:duration-150 hover:shadow-sombra-md focus-visible:outline-2 focus-visible:outline-celeste-700"
          />

          <div className="relative z-10 flex min-h-[360px] flex-col justify-center pointer-events-none">
            {mostrandoDorso ? (
              <Dorso tarjeta={tarjeta} onAbrirFicha={onAbrirFicha} />
            ) : (
              <Frente tarjeta={tarjeta} />
            )}
          </div>
        </div>
      </div>

      {/* ── Botones de respuesta ──────────────────────────────────────── */}
      <div className="mt-xl grid grid-cols-2 gap-md">
        <button
          type="button"
          onClick={() => {
            manejarRespuesta(false);
          }}
          className="min-h-[48px] cursor-pointer touch-manipulation rounded-lg border-2 border-error bg-error px-lg py-md font-cuerpo text-[14px] font-semibold tracking-[0.06em] text-blanco uppercase motion-safe:transition-[filter] motion-safe:duration-150 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
        >
          Falso
        </button>
        <button
          type="button"
          onClick={() => {
            manejarRespuesta(true);
          }}
          className="min-h-[48px] cursor-pointer touch-manipulation rounded-lg border-2 border-ok bg-ok px-lg py-md font-cuerpo text-[14px] font-semibold tracking-[0.06em] text-blanco uppercase motion-safe:transition-[filter] motion-safe:duration-150 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
        >
          Verdadero
        </button>
      </div>

      {/* ── Franja de estadísticas del mazo ──────────────────────────── */}
      <dl className="mt-2xl grid grid-cols-2 gap-lg border-y border-celeste-150 bg-blanco py-lg text-center sm:grid-cols-4">
        <div>
          <dd className="font-titulo text-[26px] leading-none font-normal text-ok tabular-nums">{stats.aciertos}</dd>
          <dt className="mt-xs font-cuerpo text-[10px] tracking-[0.14em] text-texto-terciario uppercase">
            Aciertos en este mazo
          </dt>
        </div>
        <div>
          <dd className="font-titulo text-[26px] leading-none font-normal text-accent-700 tabular-nums">{stats.racha}</dd>
          <dt className="mt-xs font-cuerpo text-[10px] tracking-[0.14em] text-texto-terciario uppercase">
            Racha actual
          </dt>
        </div>
        <div>
          <dd className={`font-titulo text-[26px] leading-none font-normal ${morado.text}`}>{stats.dominio}</dd>
          <dt className="mt-xs font-cuerpo text-[10px] tracking-[0.14em] text-texto-terciario uppercase">
            Dominio de esta tarjeta
          </dt>
        </div>
        <div>
          <dd className="font-titulo text-[26px] leading-none font-normal text-texto-titulo">{stats.ultimoRepaso}</dd>
          <dt className="mt-xs font-cuerpo text-[10px] tracking-[0.14em] text-texto-terciario uppercase">
            Último repaso
          </dt>
        </div>
      </dl>

      {/* ── Cierre ────────────────────────────────────────────────────── */}
      <p className="mt-lg text-center font-titulo text-[13px] italic text-texto-secundario">
        Cada respuesta queda como un evento; los puntos se calculan al leer.
      </p>
    </main>
  );
}

function Frente({ tarjeta }: { tarjeta: TarjetaDeRepaso }) {
  return (
    <div className="relative border border-celeste-150 bg-celeste-50 p-2xl outline outline-celeste-150 outline-offset-[6px] rounded-xl">
      {/*
       * Numeral romano decorativo, único lugar de esta carta con el
       * gradiente `.au` de la marca — repetido y espejado (180°) en la
       * esquina opuesta. Nunca leído por un lector de pantalla: el orden de
       * la tarjeta ya lo dice "Tarjeta N de M" en el encabezado.
       */}
      <span aria-hidden="true" className="au absolute top-md left-md font-titulo text-[32px] leading-none">
        {tarjeta.numeral}
      </span>
      <span
        aria-hidden="true"
        className="au absolute bottom-md right-md rotate-180 font-titulo text-[32px] leading-none"
      >
        {tarjeta.numeral}
      </span>

      <div className="text-center">
        <span className={`inline-block rounded-full ${morado.bg} ${morado.text} px-md py-xs font-cuerpo text-[11px] font-semibold tracking-[0.08em] uppercase`}>
          {tarjeta.categoria}
        </span>

        {/*
         * Único `<h1>` de la pantalla: la pregunta es, visualmente, el
         * titular de la carta — y de toda la pantalla, no hay otro
         * candidato (mismo criterio de heading real que
         * `ficha-entidad.tsx`).
         */}
        <h1 className="m-0 mt-lg text-balance font-titulo text-[40px] leading-[1.15] font-normal text-texto-titulo">
          {tarjeta.pregunta}
        </h1>

        <p className="mt-lg font-titulo text-[14px] italic text-texto-secundario">
          tocá la tarjeta para darla vuelta
        </p>
      </div>
    </div>
  );
}

function Dorso({
  tarjeta,
  onAbrirFicha,
}: {
  tarjeta: TarjetaDeRepaso;
  onAbrirFicha?: (entidadId: string) => void;
}) {
  return (
    <div className="border border-celeste-900 bg-celeste-900 p-2xl outline outline-celeste-text outline-offset-[6px] rounded-xl">
      <div className="text-center">
        <span className={`inline-block rounded-full ${morado.bg} ${morado.text} px-md py-xs font-cuerpo text-[11px] font-semibold tracking-[0.08em] uppercase`}>
          Respuesta revelada
        </span>

        <p className="mt-lg text-balance font-titulo text-[34px] leading-[1.2] font-normal text-accent-300">
          {tarjeta.respuesta}
        </p>

        <div aria-hidden="true" className="filete-dorado mx-auto mt-lg h-[3px] w-24 rounded-full" />

        {/*
         * `<Link>` real, hermano del `role="button"` de la carta (no
         * descendiente): el padre inmediato tiene `pointer-events-none`
         * (ver comentario en el render principal), así que este enlace
         * necesita `pointer-events-auto` explícito para seguir siendo
         * clicable y alcanzable por teclado. Ya no hace falta
         * `stopPropagation`: al no estar anidado dentro del `role="button"`,
         * no hay evento que burbujee hacia el toggle de frente/dorso.
         */}
        <Link
          href="/ficha"
          onClick={() => {
            onAbrirFicha?.(tarjeta.entidadId);
          }}
          className="relative z-10 mt-lg inline-block pointer-events-auto font-cuerpo text-[13px] font-semibold tracking-[0.06em] text-blanco underline underline-offset-4 uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blanco"
        >
          Abrir la ficha de {tarjeta.entidadNombre}
        </Link>

        <p className="mt-lg font-titulo text-[14px] italic text-celeste-150">
          tocá la tarjeta para volver a la pregunta
        </p>
      </div>
    </div>
  );
}
