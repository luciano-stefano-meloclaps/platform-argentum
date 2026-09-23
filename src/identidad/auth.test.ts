import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * La instancia de Better Auth se construye en el primer uso y no al importar
 * (ticket #111): `next build` importa las rutas sin las variables de identidad
 * cargadas, y un `throw` al importar rompía el build. `DATABASE_URL` se fija
 * a una cadena inerte: `pg` no conecta hasta la primera consulta.
 */
vi.mock("server-only", () => ({}));

const VARIABLES = ["BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;

beforeEach(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://u:p@localhost:5432/inerte");
  for (const nombre of VARIABLES) vi.stubEnv(nombre, "");
  delete (globalThis as { authArgentum?: unknown }).authArgentum;
});

afterEach(() => {
  vi.unstubAllEnvs();
  delete (globalThis as { authArgentum?: unknown }).authArgentum;
  vi.resetModules();
});

describe("auth", () => {
  it("importar el archivo sin variables de identidad no lanza", async () => {
    await expect(import("./auth.ts")).resolves.toHaveProperty("obtenerAuth");
  });

  it("usarla sin BETTER_AUTH_SECRET lanza un mensaje que nombra la variable", async () => {
    const { obtenerAuth } = await import("./auth.ts");

    expect(() => obtenerAuth()).toThrow("Falta la variable de entorno BETTER_AUTH_SECRET");
  });

  it("con las cuatro variables la construye una sola vez", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("GOOGLE_CLIENT_ID", "id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secreto");
    const { obtenerAuth } = await import("./auth.ts");

    expect(obtenerAuth()).toBe(obtenerAuth());
  });
});
