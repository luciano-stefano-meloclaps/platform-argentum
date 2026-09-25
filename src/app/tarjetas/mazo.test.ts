import { describe, expect, it } from "vitest";

import { estadoInicialDelMazo, reducirMazo, type AccionDelMazo, type EstadoDelMazo } from "./mazo.ts";

function aplicar(estado: EstadoDelMazo, ...acciones: AccionDelMazo[]): EstadoDelMazo {
  return acciones.reduce(reducirMazo, estado);
}

const acertar: AccionDelMazo = { tipo: "responder", elegido: true, esVerdadero: true };
const errar: AccionDelMazo = { tipo: "responder", elegido: false, esVerdadero: true };
const siguiente: AccionDelMazo = { tipo: "siguiente" };

describe("reducirMazo", () => {
  it("arranca en la primera tarjeta, sin aciertos ni respuesta", () => {
    expect(estadoInicialDelMazo(3)).toEqual({ total: 3, indice: 0, aciertos: 0, resultado: null, terminado: false });
  });

  it("un mazo vacío nace terminado", () => {
    expect(estadoInicialDelMazo(0).terminado).toBe(true);
  });

  it("acierto: coincide lo elegido con lo que afirma la tarjeta y suma uno", () => {
    const estado = aplicar(estadoInicialDelMazo(3), acertar);
    expect(estado).toMatchObject({ resultado: "acierto", aciertos: 1, indice: 0 });
  });

  it("acierto también cuando la tarjeta es falsa y se elige Falso", () => {
    const estado = aplicar(estadoInicialDelMazo(3), { tipo: "responder", elegido: false, esVerdadero: false });
    expect(estado.resultado).toBe("acierto");
  });

  it("error: no suma y no avanza sola", () => {
    const estado = aplicar(estadoInicialDelMazo(3), errar);
    expect(estado).toMatchObject({ resultado: "error", aciertos: 0, indice: 0, terminado: false });
  });

  it("responder dos veces la misma tarjeta no cuenta dos veces", () => {
    const estado = aplicar(estadoInicialDelMazo(3), acertar, acertar);
    expect(estado.aciertos).toBe(1);
  });

  it("siguiente avanza y limpia el resultado", () => {
    const estado = aplicar(estadoInicialDelMazo(3), acertar, siguiente);
    expect(estado).toMatchObject({ indice: 1, resultado: null, aciertos: 1, terminado: false });
  });

  it("siguiente sin haber respondido no hace nada", () => {
    const inicial = estadoInicialDelMazo(3);
    expect(aplicar(inicial, siguiente)).toEqual(inicial);
  });

  it("fin de mazo: tras la última tarjeta queda terminado, con el conteo correcto", () => {
    const estado = aplicar(estadoInicialDelMazo(3), acertar, siguiente, errar, siguiente, acertar, siguiente);
    expect(estado).toMatchObject({ terminado: true, indice: 3, aciertos: 2, total: 3 });
  });

  it("terminado ignora respuestas y avances", () => {
    const fin = aplicar(estadoInicialDelMazo(1), acertar, siguiente);
    expect(aplicar(fin, acertar, siguiente)).toEqual(fin);
  });

  it("repasar de nuevo reinicia índice, aciertos y fin", () => {
    const fin = aplicar(estadoInicialDelMazo(2), acertar, siguiente, acertar, siguiente);
    expect(fin.terminado).toBe(true);
    expect(aplicar(fin, { tipo: "reiniciar" })).toEqual(estadoInicialDelMazo(2));
  });
});
