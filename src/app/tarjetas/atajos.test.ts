import { describe, expect, it } from "vitest";

import { decidirAtajo, type TeclaPresionada } from "./atajos.ts";
import { estadoInicialDelMazo, reducirMazo, type EstadoDelMazo } from "./mazo.ts";

function tecla(t: string, resto: Partial<TeclaPresionada> = {}): TeclaPresionada {
  return { tecla: t, ctrl: false, meta: false, alt: false, enCampo: false, defaultPrevented: false, isComposing: false, enAmbitoDelMazo: true, ...resto };
}

const sinResponder: EstadoDelMazo = estadoInicialDelMazo(3);
const respondido: EstadoDelMazo = reducirMazo(sinResponder, { tipo: "responder", elegido: true, esVerdadero: true });
const terminado: EstadoDelMazo = estadoInicialDelMazo(0);

describe("decidirAtajo", () => {
  it("V responde Verdadero y F responde Falso, en minúscula o mayúscula", () => {
    expect(decidirAtajo(tecla("v"), sinResponder)).toEqual({ tipo: "responder", elegido: true });
    expect(decidirAtajo(tecla("V"), sinResponder)).toEqual({ tipo: "responder", elegido: true });
    expect(decidirAtajo(tecla("f"), sinResponder)).toEqual({ tipo: "responder", elegido: false });
    expect(decidirAtajo(tecla("F"), sinResponder)).toEqual({ tipo: "responder", elegido: false });
  });

  it("V y F no hacen nada con la tarjeta ya respondida", () => {
    expect(decidirAtajo(tecla("v"), respondido)).toBeNull();
    expect(decidirAtajo(tecla("f"), respondido)).toBeNull();
  });

  it("flecha derecha avanza solo si ya se respondió", () => {
    expect(decidirAtajo(tecla("ArrowRight"), respondido)).toEqual({ tipo: "siguiente" });
    expect(decidirAtajo(tecla("ArrowRight"), sinResponder)).toBeNull();
  });

  it("flecha izquierda no hace nada: el mazo no vuelve atrás", () => {
    expect(decidirAtajo(tecla("ArrowLeft"), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("ArrowLeft"), respondido)).toBeNull();
  });

  it("con el mazo terminado ninguna tecla hace nada", () => {
    for (const t of ["v", "f", "ArrowRight", "ArrowLeft"]) {
      expect(decidirAtajo(tecla(t), terminado)).toBeNull();
    }
  });

  it("se ignora con el foco en un campo de texto", () => {
    expect(decidirAtajo(tecla("v", { enCampo: true }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("f", { enCampo: true }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("ArrowRight", { enCampo: true }), respondido)).toBeNull();
  });

  it("con el foco en un botón (enCampo false) la flecha derecha sí avanza", () => {
    // Caso del flujo normal: al responder, el foco va a «Siguiente».
    expect(decidirAtajo(tecla("ArrowRight", { enCampo: false }), respondido)).toEqual({ tipo: "siguiente" });
  });

  it("V y F solo actúan dentro del mazo o en body; la flecha derecha es global", () => {
    expect(decidirAtajo(tecla("v", { enAmbitoDelMazo: false }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("F", { enAmbitoDelMazo: false }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("ArrowRight", { enAmbitoDelMazo: false }), respondido)).toEqual({ tipo: "siguiente" });
  });

  it("se ignora si el evento ya fue resuelto o hay composición de IME", () => {
    expect(decidirAtajo(tecla("v", { defaultPrevented: true }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("ArrowRight", { defaultPrevented: true }), respondido)).toBeNull();
    expect(decidirAtajo(tecla("v", { isComposing: true }), sinResponder)).toBeNull();
    expect(decidirAtajo(tecla("ArrowRight", { isComposing: true }), respondido)).toBeNull();
  });

  it("se ignora con teclas modificadoras", () => {
    for (const mod of [{ ctrl: true }, { meta: true }, { alt: true }]) {
      expect(decidirAtajo(tecla("v", mod), sinResponder)).toBeNull();
      expect(decidirAtajo(tecla("ArrowRight", mod), respondido)).toBeNull();
    }
  });

  it("no toca Enter, Espacio ni Tab", () => {
    for (const t of ["Enter", " ", "Tab"]) {
      expect(decidirAtajo(tecla(t), sinResponder)).toBeNull();
      expect(decidirAtajo(tecla(t), respondido)).toBeNull();
    }
  });
});
