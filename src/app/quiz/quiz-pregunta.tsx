"use client";

import { useState } from "react";
import Link from "next/link";

import type { PreguntaDeQuiz, ProgresoDePregunta, EstadoDePregunta } from "./quiz-pregunta.datos";

type Props = {
  pregunta: PreguntaDeQuiz;
  progreso: ProgresoDePregunta[];
  aciertos: number;
  errores: number;
};

/** Texto accesible de cada estado del tracker — nunca solo el color. */
const ETIQUETA_DE_ESTADO: Record<EstadoDePregunta, string> = {
  correcta: "correcta",
  incorrecta: "incorrecta",
  actual: "pregunta actual",
  pendiente: "pendiente",
};

/**
 * Clases del círculo del tracker por estado. Ninguna usa borde punteado —el
 * ticket #94 reserva el `border-dashed` exclusivamente para el botón de
 * pista, en ningún otro control de la plataforma—; "actual" se distingue de
 * "pendiente" por un borde más grueso y relleno celeste, no solo por color,
 * para que la diferencia no dependa únicamente de la percepción del color.
 */
const CLASES_DE_CIRCULO: Record<EstadoDePregunta, string> = {
  correcta: "border-ok bg-ok-bg text-ok",
  incorrecta: "border-error bg-error-bg text-error",
  actual: "border-2 border-celeste-700 bg-celeste-50 text-celeste-text font-semibold",
  pendiente: "border-arena-borde bg-blanco text-texto-terciario",
};

/**
 * La pantalla "Quiz" (ticket #94): panel de pregunta con pista, grilla de
 * cuatro opciones, panel de feedback y el tracker de las 10 preguntas.
 * Presentación pura sobre el mock de `quiz-pregunta.datos.ts` — el módulo
 * `aprendizaje` (ADR 0002) todavía no existe.
 *
 * Client Component: hay tres piezas de estado que viven y cambian en esta
 * misma pantalla —la pista abierta o cerrada, la opción elegida, y el hecho
 * de que la respuesta se fija una sola vez—, así que no hay un recorte de
 * "isla mínima" más chico que valga la pena: es la interactividad completa
 * de la pantalla, mismo criterio que `TarjetasRepaso`.
 *
 * A propósito **no** repite el lenguaje visual de Tarjetas (ticket #91):
 * nada de mazo apilado, nada de numerales de naipe en las esquinas — esas
 * dos piezas son la seña visual de "esto es una tarjeta", y el Quiz es un
 * panel de pregunta, no una carta.
 */
export function QuizPregunta({ pregunta, progreso, aciertos, errores }: Props) {
  const [opcionElegida, setOpcionElegida] = useState<PreguntaDeQuiz["opciones"][number]["letra"] | undefined>(
    undefined,
  );
  const [pistaAbierta, setPistaAbierta] = useState(false);

  const respuestaFijada = opcionElegida !== undefined;
  const opcionElegidaDatos = pregunta.opciones.find((opcion) => opcion.letra === opcionElegida);

  /**
   * Fija la respuesta una sola vez: una vez elegida una opción, las cuatro
   * quedan `aria-disabled` (ver el render de abajo — NO `disabled` nativo:
   * un `<button disabled>` deja de ser focuseable en el mismo render que lo
   * deshabilita, así que el foco de teclado que tenía la opción recién
   * clickeada saltaría a `<body>` justo cuando aparece el panel de
   * feedback, hallazgo bloqueante de `ui-reviewer`). Este handler no vuelve
   * a escribir el estado una vez fijada, así que el guard cubre tanto el
   * click real como cualquier `Enter`/`Espacio` que llegue por accesibilidad
   * a un botón `aria-disabled`.
   */
  function elegirOpcion(letra: PreguntaDeQuiz["opciones"][number]["letra"]) {
    if (respuestaFijada) return;
    setOpcionElegida(letra);
  }

  function alternarPista() {
    setPistaAbierta((valor) => !valor);
  }

  return (
    <main id="contenido" className="mx-auto max-w-[720px] px-lg py-2xl">
      {/* ── Panel de pregunta ─────────────────────────────────────────── */}
      <header className="border-y border-celeste-150 bg-celeste-50 px-xl py-2xl text-center">
        <p className="font-cuerpo text-[10px] font-semibold tracking-[0.18em] text-celeste-text uppercase">
          Quiz · pregunta {pregunta.numero} de {pregunta.totalPreguntas}
        </p>

        {/*
         * Tag del tipo de la entidad: mismos tokens que ya usan
         * `catalogo/page.tsx` y `ficha-procer.tsx` para "Próceres" — no se
         * inventa un color nuevo para esta pantalla. `tipo`, no
         * `categoria`: CONTEXT.md fija "tipo" como el término del glosario y
         * marca "categoría" explícitamente a evitar.
         */}
        <span className="mt-md inline-flex items-center rounded-sm bg-cat-proceres-bg px-sm py-xs text-chip text-cat-proceres-text uppercase">
          {pregunta.tipo}
        </span>

        <h1 className="m-0 mt-lg text-balance font-titulo text-[32px] leading-[1.2] font-normal text-texto-titulo sm:text-[38px]">
          {pregunta.enunciado}
        </h1>

        {/* Separador línea-rombo-línea, patrón de `identidad-argentum` (v2/ADR 0015). */}
        <div aria-hidden="true" className="mt-xl flex items-center justify-center gap-md">
          <span className="h-px w-[60px] bg-accent" />
          <span className="h-[5px] w-[5px] rotate-45 bg-celeste-400" />
          <span className="h-px w-[60px] bg-accent" />
        </div>

        {/*
         * Botón de pista: ÚNICO lugar de toda la plataforma con borde
         * punteado (regla negativa del ticket #94). Revela el texto de la
         * pista al abrirse, sin ocultar la pregunta ni las opciones.
         *
         * `hover:bg-blanco`, no `hover:bg-dorado-bg`: este botón vive dentro
         * de la banda `bg-celeste-50` de arriba, y `identidad-argentum`
         * regla de uso 3 prohíbe que un fondo dorado conviva con una
         * superficie celeste (la única excepción de la marca es el dorso de
         * la tarjeta de repaso, y esta no lo es) — hallazgo de
         * `ui-reviewer`. El borde y el texto dorados (`border-accent-600`,
         * `text-accent-800`) sí pueden convivir ahí: es el mismo patrón que
         * ya usa el rombo separador (`bg-accent` en línea, sobre este mismo
         * panel celeste).
         */}
        <button
          type="button"
          onClick={alternarPista}
          aria-expanded={pistaAbierta}
          className="mt-xl inline-flex min-h-[44px] cursor-pointer touch-manipulation items-center gap-sm rounded-sm border border-dashed border-accent-600 bg-transparent px-lg py-sm font-cuerpo text-[12px] font-semibold tracking-[0.06em] text-accent-800 uppercase motion-safe:transition-colors motion-safe:duration-150 hover:bg-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
        >
          {pistaAbierta ? "Ocultar la pista" : "Ver una pista"}
        </button>

        {pistaAbierta && (
          <p className="mx-auto mt-md max-w-[480px] font-titulo text-[16px] italic text-texto-secundario">
            {pregunta.pista}
          </p>
        )}
      </header>

      {/* ── Grilla de opciones ────────────────────────────────────────── */}
      <div className="mt-2xl grid grid-cols-1 gap-md sm:grid-cols-2">
        {pregunta.opciones.map((opcion) => {
          const esLaElegida = opcion.letra === opcionElegida;

          // Solo la opción elegida cambia de color — la correcta NUNCA se
          // revela si el usuario erró (regla del ticket #94). El hover
          // neutral solo aplica mientras la respuesta no está fijada: una
          // vez fijada, la opción deja de ser accionable y no debería
          // insinuar por hover que todavía se puede elegir.
          let clasesEstado = "border-arena-borde bg-blanco text-texto-cuerpo";
          if (esLaElegida) {
            clasesEstado = opcion.esCorrecta ? "border-ok bg-ok-bg text-ok" : "border-error bg-error-bg text-error";
          } else if (!respuestaFijada) {
            clasesEstado += " hover:border-celeste-400";
          }

          return (
            <button
              key={opcion.letra}
              type="button"
              onClick={() => {
                elegirOpcion(opcion.letra);
              }}
              // `aria-disabled`, no `disabled` nativo: un `<button disabled>`
              // deja de ser focuseable en el mismo render que se deshabilita,
              // así que el foco de teclado saltaría a `<body>` justo cuando
              // aparece el panel de feedback — hallazgo bloqueante de
              // `ui-reviewer`. `elegirOpcion` ya bloquea el click una vez
              // fijada la respuesta, así que `aria-disabled` alcanza para
              // comunicar el estado sin sacrificar el foco.
              aria-disabled={respuestaFijada}
              className={`flex min-h-[64px] w-full touch-manipulation flex-col items-start gap-xs rounded-lg border-2 px-lg py-md text-left font-cuerpo text-[15px] motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700 ${respuestaFijada ? "cursor-default" : "cursor-pointer"} ${clasesEstado}`}
            >
              <span className="flex items-center gap-sm">
                <span
                  aria-hidden="true"
                  className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border border-current font-cuerpo text-[12px] font-semibold"
                >
                  {opcion.letra}
                </span>
                <span>{opcion.texto}</span>
              </span>

              {esLaElegida && (
                <span className="pl-[34px] font-cuerpo text-[11px] font-semibold tracking-[0.08em] uppercase">
                  {opcion.esCorrecta ? "Correcta ✓" : "Incorrecta ✕"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/*
       * ── Panel de feedback ────────────────────────────────────────────
       * `aria-live="polite"` en el contenedor SIEMPRE presente —no solo
       * cuando hay respuesta—, para que un lector de pantalla anuncie el
       * contenido que aparece adentro cuando se fija la respuesta, en vez
       * de depender de que detecte la inserción de un nodo nuevo.
       */}
      <div aria-live="polite" className="mt-xl">
        {respuestaFijada && opcionElegidaDatos !== undefined && (
          <div
            className={`rounded-lg border-l-2 px-xl py-lg ${
              opcionElegidaDatos.esCorrecta
                ? "border-celeste-150 border-l-ok bg-celeste-50"
                : "border-celeste-150 border-l-error bg-celeste-50"
            }`}
          >
            <p className="m-0 font-cuerpo text-[10px] font-semibold tracking-[0.16em] text-celeste-text uppercase">
              {opcionElegidaDatos.esCorrecta ? "¡Correcto!" : "No era esa"}
            </p>
            <p className="mt-sm mb-0 font-cuerpo text-[15px] leading-[1.8] text-texto-cuerpo">
              {pregunta.explicacion}
            </p>
            <Link
              href={pregunta.entidadHref}
              className="mt-md inline-block font-cuerpo text-[13px] font-semibold text-celeste-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700"
            >
              Ver la ficha de {pregunta.entidadNombre}
            </Link>
          </div>
        )}
      </div>

      {/* ── Seguimiento del quiz ─────────────────────────────────────── */}
      <section aria-label="Seguimiento del quiz" className="mt-2xl border-t border-arena-borde-suave pt-xl">
        <p className="m-0 text-center font-cuerpo text-[13px] text-texto-secundario">
          <span className="font-semibold text-ok">{aciertos} acierto{aciertos === 1 ? "" : "s"}</span>
          {" · "}
          <span className="font-semibold text-error">{errores} error{errores === 1 ? "" : "es"}</span>
        </p>

        {/*
         * Diez círculos numerados —nunca con ícono, regla del ticket #94—,
         * cada uno con su propio `aria-label` textual: el color nunca es el
         * único portador del estado, ni para quien lo ve ni para quien lo
         * escucha.
         */}
        <ol aria-label="Las 10 preguntas del quiz" className="mt-lg flex flex-wrap justify-center gap-sm">
          {progreso.map((item) => (
            <li key={item.numero}>
              <span
                aria-label={`Pregunta ${item.numero}: ${ETIQUETA_DE_ESTADO[item.estado]}`}
                className={`flex h-[32px] w-[32px] items-center justify-center rounded-full border font-cuerpo text-[12px] tabular-nums ${CLASES_DE_CIRCULO[item.estado]}`}
              >
                {item.numero}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
