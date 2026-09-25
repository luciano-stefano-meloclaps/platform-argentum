"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { decidirAtajo } from "./atajos.ts";
import { estadoInicialDelMazo, reducirMazo } from "./mazo.ts";
import type { TarjetaDeRepaso } from "./tarjetas-repaso.datos.ts";

type Props = {
  mazoNombre: string;
  tarjetas: TarjetaDeRepaso[];
  /**
   * Sin efecto real todavía: el enchufe a datos reales es de la nota de
   * revisión #92, fuera de alcance de esta rebanada. Si no se provee, cae a
   * un registro en consola — mismo criterio que `onRepasar` en
   * `ficha-entidad.tsx` y `onAbrirFicha` en `grilla-laminas.tsx`. El registro
   * ocurre siempre ANTES de registrar el resultado en el estado del mazo: es
   * un requisito de orden del ticket, pensado para cuando esto tenga un
   * backend real detrás.
   */
  onResponder?: (esVerdadero: boolean) => void;
  onAbrirFicha?: (entidadId: string) => void;
  /**
   * Lo que va debajo de los botones (la franja de datos y la nota de cierre):
   * es estático, así que lo renderiza el servidor y entra acá como
   * `children` en vez de volverse parte de la isla de cliente (ADR 0016,
   * regla 4: el Client Component es el más chico posible).
   */
  children?: React.ReactNode;
};

/**
 * Acento morado de repaso: "categoría/temática" (tag del frente) y "revelar"
 * (badge del dorso). Nunca dorado ni celeste, nunca el rol del verde
 * (correcto). Tokens del `brand-specialist` (`--color-acento-repaso-*`).
 */
const morado = {
  bg: "bg-acento-repaso-100",
  text: "text-acento-repaso-700",
};

/**
 * "Tarjeta N de M": la pantalla de repaso tipo flashcard (ticket #91), en su
 * versión museística. Presentación pura sobre el mock de
 * `tarjetas-repaso.datos.ts`.
 *
 * Client Component: hay estado (qué tarjeta, frente o dorso) que comparten el
 * título, la barra de pasos, la carta y los botones. Lo que no depende de ese
 * estado (franja de datos, nota de cierre) llega como `children` desde el
 * servidor, así que la isla no lo arrastra al paquete del cliente.
 *
 * Estado (todo en memoria, nada se persiste): el recorrido del mazo —índice,
 * aciertos, resultado de la tarjeta actual, fin— es el reducer puro de
 * `mazo.ts`; `mostrandoDorso` (frente/dorso mientras todavía no se respondió)
 * es lo único que queda acá. `pasos` (la barra de progreso) es derivado de
 * `tarjetas.length`, no estado propio.
 */
export function TarjetasRepaso({ mazoNombre, tarjetas, onResponder, onAbrirFicha, children }: Props) {
  const [estado, despachar] = useReducer(reducirMazo, tarjetas.length, estadoInicialDelMazo);
  const [mostrandoDorso, setMostrandoDorso] = useState(false);

  const tituloRef = useRef<HTMLHeadingElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const cierreRef = useRef<HTMLHeadingElement>(null);

  const tarjeta = estado.terminado ? undefined : tarjetas[estado.indice];
  // Paso de la barra: la tarjeta actual cuenta como vista; al terminar, todas.
  const pasoActual = estado.terminado ? tarjetas.length : estado.indice + 1;
  const respondida = estado.resultado !== null;
  // Con la tarjeta respondida la cara queda fija en el dorso: ahí vive el feedback.
  const dorsoVisible = mostrandoDorso || respondida;

  // Foco: el botón que se toca desaparece al cambiar de paso, así que el foco
  // se lleva a mano al elemento que sigue (si no, cae al <body>).
  // Al responder -> «Siguiente». Al terminar -> el <h2> de cierre. Al pasar a
  // otra tarjeta (o repasar de nuevo) -> el título "Tarjeta N de M".
  const clave = estado.terminado ? -1 : estado.indice;
  const claveAnterior = useRef(clave);
  useEffect(() => {
    if (estado.resultado !== null) {
      siguienteRef.current?.focus();
    }
  }, [estado.resultado]);
  useEffect(() => {
    if (claveAnterior.current === clave) {
      return;
    }
    claveAnterior.current = clave;
    if (estado.terminado) {
      cierreRef.current?.focus();
    } else {
      tituloRef.current?.focus();
    }
  }, [clave, estado.terminado]);

  // Atajos (ticket #133): la decisión es la función pura `decidirAtajo`; acá solo
  // se reduce el evento a datos y se despacha lo que devuelva. Se ignoran con el
  // foco en cualquier control o campo, así Enter, Espacio y Tab siguen nativos.
  useEffect(() => {
    function alPresionar(evento: KeyboardEvent) {
      const objetivo = evento.target;
      const enControl = objetivo instanceof Element && objetivo.closest(SELECTOR_DE_CONTROLES) !== null;
      const accion = decidirAtajo(
        { tecla: evento.key, ctrl: evento.ctrlKey, meta: evento.metaKey, alt: evento.altKey, enControl },
        estado,
      );
      if (accion === null) {
        return;
      }
      evento.preventDefault();
      if (accion.tipo === "responder") {
        manejarRespuesta(accion.elegido);
      } else {
        irALaSiguiente();
      }
    }
    window.addEventListener("keydown", alPresionar);
    return () => {
      window.removeEventListener("keydown", alPresionar);
    };
  });

  function alternarDorso() {
    setMostrandoDorso((valor) => !valor);
  }

  function manejarRespuesta(elegido: boolean) {
    if (tarjeta === undefined) {
      return;
    }
    // El registro del evento va SIEMPRE antes de tocar el estado: es un
    // requisito del ticket, para que el orden ya esté bien cuando esto se
    // conecte a un backend real.
    if (onResponder !== undefined) {
      onResponder(elegido);
    } else {
      console.log("[tarjetas] respuesta registrada:", elegido, "para", tarjeta.entidadId);
    }

    despachar({ tipo: "responder", elegido, esVerdadero: tarjeta.esVerdadero });
  }

  function irALaSiguiente() {
    setMostrandoDorso(false);
    despachar({ tipo: "siguiente" });
  }

  function repasarDeNuevo() {
    setMostrandoDorso(false);
    despachar({ tipo: "reiniciar" });
  }

  if (tarjetas.length === 0) {
    // Mazo vacío: no debería pasar con el mock, pero un mazo real algún día
    // puede llegar sin tarjetas — nunca una pantalla en blanco sin
    // explicación.
    return (
      <main id="contenido" className="mx-auto w-full max-w-[760px] px-lg py-2xl text-center">
        <p className="font-cuerpo text-texto-secundario">Este mazo todavía no tiene tarjetas para repasar.</p>
      </main>
    );
  }

  return (
    <main id="contenido" className="mx-auto w-full max-w-[1800px] px-lg py-2xl">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header className="text-center">
        <p className="font-cuerpo text-[10px] font-semibold tracking-[0.18em] text-celeste-text uppercase">
          Repaso · mazo de {mazoNombre.toLowerCase()}
        </p>

        {/*
         * Único `<h1>` de la pantalla (recibe el foco al pasar de tarjeta).
         * Con el mazo terminado dice «Fin del mazo». La cifra en dorado oscuro PLANO, a
         * propósito sin `.au` ni `.shiny`: es la única cifra destacada de la
         * plataforma sin gradiente ni animación, para no competir con el
         * wordmark. El total va en un `<span>` gris, mismo tamaño y sin
         * negrita.
         */}
        <h1
          ref={tituloRef}
          tabIndex={-1}
          className="m-0 mt-md font-titulo text-[40px] leading-[1.15] font-normal text-tarjetas-dorado-provisorio focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco"
        >
          {estado.terminado ? (
            "Fin del mazo"
          ) : (
            <>
              Tarjeta {estado.indice + 1}
              <span className="text-texto-terciario"> de {tarjetas.length}</span>
            </>
          )}
        </h1>

        {/*
         * Barra de pasos: un segmento por tarjeta del mazo, solo DOS estados
         * (ya vista / no vista todavía). `role="progressbar"` con los tres
         * `aria-value*` es el estado real para un lector de pantalla; los
         * segmentos son decorativos (`aria-hidden`) porque el color no es el
         * único portador de significado: "Tarjeta N de M" ya lo dice en
         * texto. Los segmentos encogen (flex-shrink por defecto) en
         * pantallas angostas, donde 12 × 26px + huecos no entra.
         */}
        <div
          role="progressbar"
          aria-label="Progreso del mazo"
          aria-valuemin={1}
          aria-valuemax={tarjetas.length}
          aria-valuenow={pasoActual}
          aria-valuetext={estado.terminado ? "Mazo completo" : `Tarjeta ${pasoActual} de ${tarjetas.length}`}
          className="mt-xl mb-[34px] flex justify-center gap-[5px]"
        >
          {tarjetas.map((unaTarjeta, indice) => (
            <span
              key={unaTarjeta.id}
              aria-hidden="true"
              className={`h-[3px] w-[26px] ${indice < pasoActual ? "bg-celeste-400" : "bg-borde-strong"}`}
            />
          ))}
        </div>
      </header>

      {tarjeta === undefined ? (
        <>
          <CartaDeCierre total={tarjetas.length} aciertos={estado.aciertos} tituloRef={cierreRef} />
          <div className="mt-[34px] flex flex-col gap-[14px] sm:flex-row">
            <button
              type="button"
              onClick={repasarDeNuevo}
              className={`${BOTON_DORADO} flex-1`}
            >
              Repasar de nuevo
            </button>
            <Link href="/catalogo" className={`${BOTON_DORADO} flex-1`}>
              Volver al catálogo
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* ── La carta ─────────────────────────────────────────────── */}
          <div className="relative">
            {/* Capas decorativas del mazo apilado, ANTES de la carta real. */}
            <div
              aria-hidden="true"
              className="absolute top-[10px] -right-[10px] -bottom-[10px] left-[10px] border border-accent-300"
            />
            <div
              aria-hidden="true"
              className="absolute top-[5px] -right-[5px] -bottom-[5px] left-[5px] border border-accent-400"
            />

            {/*
             * La carta real. El elemento operable es un `<button>` HERMANO
             * superpuesto y vacío (`absolute inset-0`, capa `z-0`), no un
             * contenedor: el dorso contiene un `<Link>` real (navegación a la
             * ficha), y un `<button>` no puede envolver un interactivo sin
             * anidarlo ilegalmente (hallazgo bloqueante del `ui-reviewer`,
             * ticket #91). Al ser nativo, Enter y Espacio funcionan sin
             * handler propio. El contenido vive en una capa `z-10` con
             * `pointer-events-none` —el click lo recibe el botón de abajo—,
             * salvo el `<Link>`, que recupera `pointer-events-auto`.
             * `aria-pressed` anuncia frente/dorso y el contenido de la cara
             * actual es una región `aria-live="polite"`, así que el cambio de
             * cara se anuncia. Nunca gira en 3D: es un swap de contenido, con
             * el mismo `min-h-[360px]` en las dos caras.
             *
             * Una vez respondida la tarjeta el botón de dar vuelta no se
             * renderiza: la cara queda fija en el dorso, que es donde vive el
             * feedback, y lo que sigue es «Siguiente».
             *
             * El anillo de foco va a 12px del borde: más afuera que el marco
             * "passe-partout" (6px) y que las dos capas del mazo (5px y 10px).
             */}
            <div className="relative flex min-h-[360px]">
              {!respondida && (
                <button
                  type="button"
                  aria-pressed={mostrandoDorso}
                  aria-label="Dar vuelta la tarjeta"
                  onClick={alternarDorso}
                  className="absolute inset-0 z-0 cursor-pointer touch-manipulation outline-offset-[12px] focus-visible:outline-2 focus-visible:outline-foco"
                />
              )}

              <div aria-live="polite" className="pointer-events-none relative z-10 flex flex-1">
                {dorsoVisible ? (
                  <Dorso tarjeta={tarjeta} resultado={estado.resultado} onAbrirFicha={onAbrirFicha} />
                ) : (
                  <Frente tarjeta={tarjeta} />
                )}
              </div>
            </div>
          </div>

          {/* ── Botones ──────────────────────────────────────────────── */}
          {respondida ? (
            <div className="mt-[34px] flex">
              <button
                ref={siguienteRef}
                type="button"
                onClick={irALaSiguiente}
                className={`${BOTON_DORADO} flex-1`}
              >
                Siguiente
              </button>
            </div>
          ) : (
            /*
             * Mismo tamaño y peso visual; ninguno es `.btn-primary` ni el
             * botón secundario genérico. Rojo como borde de botón: único uso
             * de la plataforma (en el resto es solo texto de estado). Verde =
             * "correcto".
             */
            <div className="mt-[34px] flex gap-[14px]">
              <button
                type="button"
                onClick={() => {
                  manejarRespuesta(false);
                }}
                className="min-h-objetivo-tactil flex-1 cursor-pointer touch-manipulation border border-error bg-transparent py-[15px] font-cuerpo text-[14px] text-error motion-safe:transition-colors motion-safe:duration-150 hover:bg-error-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
              >
                Falso
              </button>
              <button
                type="button"
                onClick={() => {
                  manejarRespuesta(true);
                }}
                className="min-h-objetivo-tactil flex-1 cursor-pointer touch-manipulation border border-ok bg-transparent py-[15px] font-cuerpo text-[14px] text-ok motion-safe:transition-colors motion-safe:duration-150 hover:bg-ok-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
              >
                Verdadero
              </button>
            </div>
          )}

          <LeyendaDeAtajos />
        </>
      )}

      {children}
    </main>
  );
}

/** Todo lo que consume las teclas por sí mismo: los atajos no se disparan ahí. */
const SELECTOR_DE_CONTROLES =
  'button, a, input, textarea, select, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="textbox"], [role="combobox"]';

/**
 * Leyenda visible de los atajos. `<kbd>`: texto `texto-titulo` sobre blanco
 * 11.73:1; el resto del texto `texto-secundario` sobre crema 5.98:1. `←` no
 * figura: el mazo no vuelve atrás.
 */
function LeyendaDeAtajos() {
  const kbd =
    "inline-block min-w-[1.75em] border border-borde-strong bg-blanco px-xs py-px text-center font-cuerpo text-[12px] text-texto-titulo";
  return (
    <p className="mt-lg text-center font-cuerpo text-[12px] text-texto-secundario">
      Atajos: <kbd className={kbd}>V</kbd> Verdadero · <kbd className={kbd}>F</kbd> Falso ·{" "}
      <kbd className={kbd}>→</kbd> Siguiente
    </p>
  );
}

/**
 * Botón de acción de la pantalla («Siguiente», «Repasar de nuevo», «Volver al
 * catálogo»): mismo lenguaje que el botón primario v2 (outline dorado, relleno
 * dorado claro al hover), 44px de alto mínimo. Texto `accent-700` 4.58:1 sobre
 * crema; hover `accent-800` sobre `accent-300` 6.81:1. Sirve para `<button>` y
 * `<Link>`.
 */
const BOTON_DORADO =
  "inline-flex min-h-objetivo-tactil cursor-pointer touch-manipulation items-center justify-center border border-accent-700 bg-transparent px-lg py-[15px] text-center font-cuerpo text-[14px] text-accent-700 no-underline motion-safe:transition-colors motion-safe:duration-150 hover:bg-accent-300 hover:text-accent-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";

const TONO_MARCO = {
  claro: { linea: "border-accent-600", rombo: "bg-accent-700" },
  invertido: { linea: "border-accent-400", rombo: "bg-accent-300" },
};

/**
 * Marco de plate de museo: filete interior a 6px del borde y un rombo en cada
 * esquina (rombo separador de v2, 5-6px). Decorativo, sin `outline`: el foco
 * es del `<button>` (offset 12px) y las capas del mazo hacen de contorno.
 * Frente = tono claro, dorso = invertido (dorado sobre celeste-900, excepcion
 * de la regla 3). Marco aprobado por el usuario.
 */
function Marco({ tono }: { tono: "claro" | "invertido" }) {
  const t = TONO_MARCO[tono];
  const rombo = `absolute size-[6px] rotate-45 ${t.rombo}`;
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute inset-[6px] border ${t.linea}`}>
      <span className={`${rombo} -top-[4px] -left-[4px]`} />
      <span className={`${rombo} -top-[4px] -right-[4px]`} />
      <span className={`${rombo} -bottom-[4px] -left-[4px]`} />
      <span className={`${rombo} -right-[4px] -bottom-[4px]`} />
    </span>
  );
}

function Frente({ tarjeta }: { tarjeta: TarjetaDeRepaso }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center border border-accent-700 bg-tarjetas-carta-provisorio px-lg py-[56px] sm:px-[60px] sm:py-[64px]">
      <Marco tono="claro" />
      {/*
       * Numeral romano de esquina, como un índice de naipe: único lugar de
       * esta cara con el gradiente `.au` (detalle de esquina, no titular),
       * repetido y girado 180° en la esquina opuesta. Decorativo
       * (`aria-hidden`): el orden ya lo dice "Tarjeta N de M".
       */}
      <span
        aria-hidden="true"
        className="au absolute top-[20px] left-[24px] font-titulo text-[17px] leading-none tracking-[0.08em]"
      >
        {tarjeta.numeral}
      </span>
      <span
        aria-hidden="true"
        className="au absolute right-[24px] bottom-[20px] rotate-180 font-titulo text-[17px] leading-none tracking-[0.08em]"
      >
        {tarjeta.numeral}
      </span>

      <span
        className={`inline-block rounded-full ${morado.bg} ${morado.text} px-md py-xs font-cuerpo text-[11px] font-semibold tracking-[0.08em] uppercase`}
      >
        {tarjeta.categoria}
      </span>

      <h2 className="m-0 mt-xl max-w-[19ch] text-balance text-center font-titulo text-[30px] leading-[1.22] font-normal text-texto-titulo sm:text-[40px]">
        {tarjeta.pregunta}
      </h2>

      <p className="mt-[30px] flex items-center gap-[10px] text-center font-titulo text-[14px] italic text-texto-secundario">
        <span aria-hidden="true" className="h-px w-[40px] shrink-0 bg-accent-600" />
        tocá la lámina para darla vuelta
        <span aria-hidden="true" className="h-px w-[40px] shrink-0 bg-accent-600" />
      </p>
    </div>
  );
}

/**
 * Íconos Tabler (outline, 24px, trazo 2, MIT, https://tabler.io/icons), copiados
 * en línea y sin dependencia (ADR 0003/0008): `circle-check` e `info-circle`.
 * Decorativos: el texto de al lado es el portador del significado.
 */
function IconoDeFeedback({ acierto }: { acierto: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
    >
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      {acierto ? (
        <path d="M9 12l2 2l4 -4" />
      ) : (
        <>
          <path d="M12 9h.01" />
          <path d="M11 12h1v4h1" />
        </>
      )}
    </svg>
  );
}

function Dorso({
  tarjeta,
  resultado,
  onAbrirFicha,
}: {
  tarjeta: TarjetaDeRepaso;
  resultado: "acierto" | "error" | null;
  onAbrirFicha?: (entidadId: string) => void;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center border border-accent-600 bg-celeste-900 px-lg py-[56px] sm:px-[60px] sm:py-[64px]">
      <Marco tono="invertido" />
      {/*
       * Feedback, en texto MÁS ícono (el color nunca es el único portador).
       * Sobre celeste-900: acierto `--color-ok-invertido` 4.51:1; «no era esa»
       * en blanco 11.22:1 — neutro a propósito, sin rojo: equivocarse enseña,
       * no castiga. Sin animación propia: nada que reducir.
       */}
      {resultado !== null && (
        <p
          className={`mb-md flex items-center gap-[10px] font-cuerpo text-[16px] font-semibold ${
            resultado === "acierto" ? "text-ok-invertido" : "text-blanco"
          }`}
        >
          <IconoDeFeedback acierto={resultado === "acierto"} />
          {resultado === "acierto" ? "Acertaste" : "No era esa: mirá la respuesta"}
        </p>
      )}
      <span className="inline-block border border-acento-repaso-invertido px-[10px] py-xs font-cuerpo text-[9px] tracking-[0.14em] text-acento-repaso-100 uppercase">
        Respuesta revelada
      </span>

      <p className="mt-[18px] max-w-[24ch] text-center font-titulo text-[28px] leading-[1.35] font-normal text-accent-300 sm:text-[34px]">
        {tarjeta.esVerdadero ? "Sí" : "No"}: {tarjeta.respuesta}
      </p>

      <div
        aria-hidden="true"
        className="mt-[28px] mb-[18px] h-[2px] w-[70px] bg-[image:var(--gradiente-filete-invertido)]"
      />

      {/*
       * `<Link>` real, hermano del `<button>` de la carta: el contenedor
       * tiene `pointer-events-none`, así que el enlace recupera
       * `pointer-events-auto`. El texto es de 11px, pero el área tocable mide
       * 44px de alto (`min-h-objetivo-tactil`, regla de uso 18); el margen
       * vertical negativo devuelve el espacio que ese alto le suma, para que
       * el filete y el enlace conserven la separación de la spec.
       */}
      <Link
        href="/ficha"
        onClick={() => {
          onAbrirFicha?.(tarjeta.entidadId);
        }}
        className="pointer-events-auto -my-[14px] inline-flex min-h-objetivo-tactil items-center text-center font-cuerpo text-[11px] tracking-[0.14em] text-celeste-150 uppercase underline underline-offset-4 hover:text-blanco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco-invertido"
      >
        Abrir la ficha de {tarjeta.entidadNombre}
      </Link>
    </div>
  );
}

/**
 * Carta de cierre: el mismo marco de plate que el frente (filete exterior
 * `accent-700`, interior `accent-600`, rombos), fondo de la carta frontal. El
 * `<h2>` recibe el foco al aparecer (lo hace el efecto del padre). Texto sin
 * castigo: solo cuenta lo que pasó. Contrastes: `texto-titulo` 11.17:1 y
 * `texto-secundario` 6.08:1 sobre `#F5FAFF`.
 */
function CartaDeCierre({
  total,
  aciertos,
  tituloRef,
}: {
  total: number;
  aciertos: number;
  tituloRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute top-[10px] -right-[10px] -bottom-[10px] left-[10px] border border-accent-300"
      />
      <div
        aria-hidden="true"
        className="absolute top-[5px] -right-[5px] -bottom-[5px] left-[5px] border border-accent-400"
      />
      <div className="relative flex min-h-[360px] flex-col items-center justify-center border border-accent-700 bg-tarjetas-carta-provisorio px-lg py-[56px] text-center sm:px-[60px] sm:py-[64px]">
        <Marco tono="claro" />
        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="m-0 max-w-[19ch] text-balance font-titulo text-[30px] leading-[1.22] font-normal text-texto-titulo focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foco sm:text-[40px]"
        >
          Recorriste {total} {total === 1 ? "lámina" : "láminas"}
        </h2>
        <p className="mt-lg font-cuerpo text-[16px] text-texto-secundario">
          Acertaste {aciertos} de {total}
        </p>
        <p className="mt-sm flex items-center gap-[10px] font-titulo text-[14px] italic text-texto-secundario">
          <span aria-hidden="true" className="h-px w-[40px] shrink-0 bg-accent-600" />
          Cada repaso ayuda a fijar lo que viste
          <span aria-hidden="true" className="h-px w-[40px] shrink-0 bg-accent-600" />
        </p>
      </div>
    </div>
  );
}
