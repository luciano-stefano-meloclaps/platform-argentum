import { expect, test } from "vitest";

// Todavía no hay dominio que verificar: los módulos, el esquema y las pantallas
// llegan después. Esta prueba existe para que `pnpm test` tenga algo que
// reportar y para dejar demostrado que el runner ejecuta TypeScript. Se borra
// en cuanto exista la primera prueba de código real.
test("el arnés ejecuta una prueba escrita en TypeScript", () => {
  const nombre: string = "Argentum";

  expect(nombre).toBe("Argentum");
});
