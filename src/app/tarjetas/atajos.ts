/**
 * Atajos de teclado de la pantalla de tarjetas (ticket #133), como función pura:
 * dada una tecla y el estado del mazo, dice qué acción del reducer corresponde,
 * o `null` si la tecla no hace nada. Sin DOM, sin React, sin efectos: quien la
 * llama (el componente) reduce el evento a datos planos y despacha el resultado.
 *
 * Las reglas de `mazo.ts` mandan: no hay avance sin haber respondido y no hay
 * «volver atrás». Por eso `→` solo navega cuando ya se respondió, y `←` no
 * tiene acción (el reducer no tiene retroceso; agregarlo es alcance nuevo).
 */

import type { EstadoDelMazo } from "./mazo.ts";

export type TeclaPresionada = {
  /** `KeyboardEvent.key`. */
  tecla: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  /**
   * El foco está en un campo que consume teclas por sí mismo (input, textarea,
   * select, contenteditable, roles textbox/combobox). Los `<button>` y `<a>`
   * NO cuentan: las flechas y las letras no tienen acción nativa ahí, y al
   * responder el foco cae justo en «Siguiente», donde `→` tiene que andar.
   * Enter y Espacio nunca los maneja `decidirAtajo`, así que siguen nativos.
   */
  enCampo: boolean;
  /** Otro manejador ya resolvió la tecla (`KeyboardEvent.defaultPrevented`). */
  defaultPrevented: boolean;
  /** Composición de un IME en curso (`KeyboardEvent.isComposing`). */
  isComposing: boolean;
  /**
   * El foco está dentro del contenedor del mazo o en `<body>`. Solo lo exigen
   * las letras V/F (WCAG 2.1.4, atajos de un solo carácter): `→` es una tecla
   * no imprimible y sigue global.
   */
  enAmbitoDelMazo: boolean;
};

export type AccionDeAtajo =
  | { tipo: "responder"; elegido: boolean }
  /** `→`: pasar a la tarjeta que sigue. */
  | { tipo: "siguiente" };

export function decidirAtajo(entrada: TeclaPresionada, estado: EstadoDelMazo): AccionDeAtajo | null {
  if (
    entrada.enCampo ||
    entrada.defaultPrevented ||
    entrada.isComposing ||
    entrada.ctrl ||
    entrada.meta ||
    entrada.alt
  ) {
    return null;
  }
  if (estado.terminado) {
    return null;
  }
  const respondida = estado.resultado !== null;

  switch (entrada.tecla) {
    case "v":
    case "V":
      return respondida || !entrada.enAmbitoDelMazo ? null : { tipo: "responder", elegido: true };
    case "f":
    case "F":
      return respondida || !entrada.enAmbitoDelMazo ? null : { tipo: "responder", elegido: false };
    case "ArrowRight":
      return respondida ? { tipo: "siguiente" } : null;
    default:
      // Incluye `ArrowLeft`: no hay «volver atrás» en el mazo.
      return null;
  }
}
