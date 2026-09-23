import { describe, expect, it } from "vitest";

import { debeRefrescarSesion } from "./nav-refresco.ts";

/** Reproduce la lógica del efecto de la nav: cuenta los refetch de un recorrido. */
function contarRefetch(recorrido: string[]): number {
  let refetch = 0;
  let anterior = recorrido[0] ?? "/";
  for (const pathname of recorrido.slice(1)) {
    if (debeRefrescarSesion(anterior, pathname)) refetch += 1;
    anterior = pathname;
  }
  return refetch;
}

describe("debeRefrescarSesion", () => {
  it("no refresca al navegar entre rutas internas", () => {
    expect(contarRefetch(["/", "/catalogo", "/catalogo/manuel-belgrano", "/quiz", "/tarjetas", "/"])).toBe(0);
  });

  it("no refresca al ir hacia /ingresar o /registrarse", () => {
    expect(contarRefetch(["/", "/ingresar", "/registrarse"])).toBe(1); // solo al salir de /ingresar
    expect(debeRefrescarSesion("/", "/ingresar")).toBe(false);
  });

  it.each(["/ingresar", "/registrarse"])("refresca una sola vez al venir de %s", (entrada) => {
    expect(contarRefetch(["/", entrada, "/", "/catalogo", "/quiz"])).toBe(1);
  });

  it("no refresca si la ruta no cambió", () => {
    expect(debeRefrescarSesion("/ingresar", "/ingresar")).toBe(false);
  });
});
