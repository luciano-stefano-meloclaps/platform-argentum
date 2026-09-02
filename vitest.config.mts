import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mismo alias que `paths` en tsconfig.json: el arnés tiene que resolver
      // los imports igual que el compilador y que Next, o una prueba falla por
      // una razón que no es la que se está probando.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Las pruebas viven junto al código que verifican, dentro de `src/`.
    // Acotar el patrón también evita que el runner entre en `.next/`, que no
    // está en el `exclude` que Vitest trae por defecto.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Explícito aunque hoy coincida con el valor por defecto: no hay entorno de
    // DOM instalado. Una prueba que necesite renderizar falla acá, con un
    // mensaje claro, y no en un lugar más raro.
    environment: "node",
  },
});
