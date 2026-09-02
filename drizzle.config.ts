import { defineConfig } from "drizzle-kit";

/**
 * Configuración de drizzle-kit (ADR 0005): genera y aplica las migraciones.
 *
 * `schema` va con ruta relativa y no con el alias `@/`: ese alias lo resuelve
 * el empaquetador de Next, y drizzle-kit no lee `paths` de `tsconfig.json`, así
 * que un `@/` acá compilaría limpio y fallaría al ejecutarse.
 *
 * `out` apunta a `drizzle/` en la raíz, fuera de `src/`: las migraciones son
 * SQL versionado y revisable, no código de aplicación.
 *
 * En este proyecto no se usa `drizzle-kit push`: saltea las migraciones
 * versionadas, que son la mitad de lo que el ADR 0005 fue a buscar.
 */
const url = process.env.DATABASE_URL_DIRECT;

if (!url) {
  // Nombra la variable que falta y no imprime ningún valor.
  throw new Error(
    "Falta la variable de entorno DATABASE_URL_DIRECT. En desarrollo sale de " +
      "`.env`, copiado de `.env.example`; en producción, del panel de Neon.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/esquema.ts",
  out: "./drizzle",
  // Sin pooler a propósito: un pooler en modo transacción no soporta las
  // sentencias de DDL con las que trabaja drizzle-kit.
  dbCredentials: { url },
  // Pide confirmación antes de una sentencia destructiva y muestra el SQL que
  // va a correr. Las dos cosas son deliberadas: acá el SQL se lee antes de
  // aplicarse.
  strict: true,
  verbose: true,
});
