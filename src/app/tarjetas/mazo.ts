/**
 * Estado del recorrido de un mazo, como función pura (ticket #132): qué tarjeta
 * toca, cuántos aciertos van, si ya se respondió la actual y si el mazo terminó.
 * Sin React, sin efectos, sin persistencia: vive solo en la memoria de la
 * pestaña (regla interina de `docs/decisiones-pendientes.md` §2). El componente
 * lo usa con `useReducer`; las pruebas lo llaman directo.
 */

export type EstadoDelMazo = {
  /** Cuántas tarjetas tiene el mazo. */
  total: number;
  /** Índice (desde 0) de la tarjeta actual. Con el mazo terminado vale `total`. */
  indice: number;
  aciertos: number;
  /** Resultado de la tarjeta actual, o `null` si todavía no se respondió. */
  resultado: "acierto" | "error" | null;
  terminado: boolean;
};

export type AccionDelMazo =
  /** `elegido` es lo que tocó el visitante; `esVerdadero` es lo que la tarjeta afirma. */
  | { tipo: "responder"; elegido: boolean; esVerdadero: boolean }
  | { tipo: "siguiente" }
  | { tipo: "reiniciar" };

export function estadoInicialDelMazo(total: number): EstadoDelMazo {
  return { total, indice: 0, aciertos: 0, resultado: null, terminado: total === 0 };
}

export function reducirMazo(estado: EstadoDelMazo, accion: AccionDelMazo): EstadoDelMazo {
  switch (accion.tipo) {
    case "responder": {
      // Una sola respuesta por tarjeta: tocar dos veces no suma dos aciertos.
      if (estado.terminado || estado.resultado !== null) {
        return estado;
      }
      const acerto = accion.elegido === accion.esVerdadero;
      return {
        ...estado,
        aciertos: estado.aciertos + (acerto ? 1 : 0),
        resultado: acerto ? "acierto" : "error",
      };
    }
    case "siguiente": {
      // No hay avance sin haber respondido: nada salta solo ni se saltea.
      if (estado.terminado || estado.resultado === null) {
        return estado;
      }
      const indice = estado.indice + 1;
      return { ...estado, indice, resultado: null, terminado: indice >= estado.total };
    }
    case "reiniciar":
      return estadoInicialDelMazo(estado.total);
  }
}
