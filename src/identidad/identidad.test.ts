import { describe, expect, it, vi } from "vitest";

/**
 * Cubre la validación de forma (Zod) de `registrarse` e `iniciarSesion`
 * (ADR 0019, Regla 4): las dos corren antes de invocar a Better Auth, así que
 * estos casos no tocan la base ni la red. Lo que Better Auth resuelve por
 * detrás (alta y login reales contra Postgres, OAuth de Google) queda fuera
 * de esta prueba a propósito, mismo motivo por el que `identidad` no declara
 * un puerto de persistencia propio (ADR 0019, Regla 1): no hay, hoy, una
 * forma de reemplazar Better Auth por un doble de prueba sin envolverlo en
 * una interfaz que la Regla 1 descarta.
 *
 * `server-only` mockeado y `.env` cargado a mano, mismo mecanismo que
 * `catalogo.test.ts` (ver su comentario): `identidad.ts` importa `auth.ts`,
 * que necesita `DATABASE_URL` (para `../db/cliente.ts`); las variables de
 * Better Auth ya no hacen falta al importar (se leen en el primer uso).
 */
vi.mock("server-only", () => ({}));

try {
  process.loadEnvFile();
} catch {
  // Sin `.env`: las variables tienen que venir ya seteadas (CI).
}

// Estas pruebas no consultan la base: `db/cliente.ts` solo exige que la cadena
// exista al importarse, y `pg` no conecta hasta la primera consulta.
process.env.DATABASE_URL ??= "postgresql://u:p@localhost:5432/inerte";

const { iniciarSesion, registrarse } = await import("./identidad.ts");

describe("registrarse", () => {
  it("rechaza un email con formato inválido sin llegar a Better Auth", async () => {
    const resultado = await registrarse({ nombre: "Ana", email: "no-es-un-email", contrasena: "contrasena123" });

    expect(resultado).toEqual({
      ok: false,
      mensaje: "El email no tiene un formato válido.",
      campo: "email",
    });
  });

  it("rechaza una contraseña más corta que el mínimo", async () => {
    const resultado = await registrarse({ nombre: "Ana", email: "ana@example.com", contrasena: "corta" });

    expect(resultado).toEqual({
      ok: false,
      mensaje: "La contraseña tiene que tener al menos 8 caracteres.",
      campo: "contrasena",
    });
  });

  it("rechaza un nombre vacío", async () => {
    const resultado = await registrarse({ nombre: "  ", email: "ana@example.com", contrasena: "contrasena123" });

    expect(resultado).toEqual({
      ok: false,
      mensaje: "El nombre no puede estar vacío.",
      campo: "nombre",
    });
  });
});

describe("iniciarSesion", () => {
  it("rechaza un email con formato inválido sin llegar a Better Auth", async () => {
    const resultado = await iniciarSesion({ email: "no-es-un-email", contrasena: "lo-que-sea" });

    expect(resultado).toEqual({
      ok: false,
      mensaje: "El email no tiene un formato válido.",
      campo: "email",
    });
  });

  it("rechaza una contraseña vacía", async () => {
    const resultado = await iniciarSesion({ email: "ana@example.com", contrasena: "" });

    expect(resultado).toEqual({
      ok: false,
      mensaje: "La contraseña no puede estar vacía.",
      campo: "contrasena",
    });
  });
});
