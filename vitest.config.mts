import { defineConfig } from "vitest/config";

export default defineConfig({
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
