import { describe, expect, it, vi } from "vitest";

/**
 * Pruebas puras del diccionario de errores (ADR 0019, Regla 4).
 *
 * `mensajes-de-error.ts` solo referencia `auth.ts` con `import type` —que
 * `verbatimModuleSyntax` (ADR 0007) garantiza que se borra en tiempo de
 * ejecución—, así que esta prueba no necesita ninguna variable de entorno de
 * Better Auth. Sí necesita el mismo mock de `server-only` que
 * `catalogo.test.ts`: fuera de la condición `react-server` de Next, el
 * paquete lanza (ver el comentario de ese archivo), y `mensajes-de-error.ts`
 * empieza con `import "server-only"` igual que el resto del módulo.
 */
vi.mock("server-only", () => ({}));

const { traducirError } = await import("./mensajes-de-error.ts");

describe("traducirError", () => {
  it("traduce un código conocido a un mensaje en español con su campo", () => {
    expect(traducirError("USER_ALREADY_EXISTS")).toEqual({
      mensaje: "Ya existe una cuenta con ese email.",
      campo: "email",
    });
  });

  it("devuelve el mensaje genérico para un código sin traducción", () => {
    expect(traducirError("UN_CODIGO_QUE_NO_EXISTE")).toEqual({
      mensaje: "No se pudo completar la operación. Intentá de nuevo.",
    });
  });

  it("devuelve el mensaje genérico cuando no hay código", () => {
    expect(traducirError(undefined)).toEqual({
      mensaje: "No se pudo completar la operación. Intentá de nuevo.",
    });
  });
});
