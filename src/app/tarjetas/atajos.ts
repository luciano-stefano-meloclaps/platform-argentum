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
   * El foco está en un control interactivo o un campo (button, enlace, input,
   * textarea, select, contenteditable…). Lo calcula el componente con el
   * elemento del evento; acá solo importa el booleano.
   */
  enControl: boolean;
};

export type AccionDeAtajo =
  | { tipo: "responder"; elegido: boolean }
  /** `→`: pasar a la tarjeta que sigue. */
  | { tipo: "siguiente" };

export function decidirAtajo(entrada: TeclaPresionada, estado: EstadoDelMazo): AccionDeAtajo | null {
  if (entrada.enControl || entrada.ctrl || entrada.meta || entrada.alt) {
    return null;
  }
  if (estado.terminado) {
    return null;
  }
  const respondida = estado.resultado !== null;

  switch (entrada.tecla) {
    case "v":
    case "V":
      return respondida ? null : { tipo: "responder", elegido: true };
    case "f":
    case "F":
      return respondida ? null : { tipo: "responder", elegido: false };
    case "ArrowRight":
      return respondida ? { tipo: "siguiente" } : null;
    default:
      // Incluye `ArrowLeft`: no hay «volver atrás» en el mazo.
      return null;
  }
}
