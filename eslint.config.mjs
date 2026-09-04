import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import drizzlePlugin from "eslint-plugin-drizzle";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

/**
 * Cimiento del linter (ticket #14, primer incremento). Configuración plana de
 * ESLint 9: `eslint-config-next` no soporta el formato `.eslintrc` a partir de
 * Next.js 16.
 *
 * Versión de ESLint fijada en 9, no 10: de los tres paquetes que arma esta
 * configuración, `eslint-plugin-jsx-a11y@6.10.2` todavía no acepta
 * `eslint@^10` (`typescript-eslint` y `eslint-config-next` sí). Se revisa
 * cuando `jsx-a11y` publique soporte para ESLint 10.
 *
 * Segundo incremento del ticket #14: se suma `@typescript-eslint/no-floating-promises`
 * (con información de tipos) y `eslint-plugin-drizzle` (`enforce-delete-with-where`).
 *
 * Fuera de este archivo, a propósito, porque no tienen superficie real
 * todavía: `switch-exhaustiveness-check` sobre `entidad.tipo` (no hay unión
 * discriminada: los descriptores no existen, `tipo` es `text` libre) y
 * `no-restricted-imports` por glob para el límite del ADR 0002 (no hay
 * separación física entre capa web y módulo: solo existen `src/app` y
 * `src/db`). Quedan para cuando exista el primer descriptor y la primera
 * separación de módulo.
 */

// Todo lo que puede llevar sintaxis de TypeScript, incluidos los archivos de
// herramienta que corren con `node` sin paso de build (ver `src/db/ping.mts`).
const archivosTypeScript = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

/** @type {import("eslint").Linter.Config[]} */
const configuracion = [
  // Base: reglas de React, react-hooks, import y las de `@next/eslint-plugin-next`
  // en severidad "core-web-vitals". Ya cubre `.mts`/`.cts` en su propio `files`
  // (verificado leyendo `eslint-config-next/dist/index.js`), que es lo que hace
  // falta para que el criterio de aceptación 3 se pueda probar sobre
  // `src/db/ping.mts` sin agregar una regla nueva solo para eso.
  ...nextCoreWebVitals,

  {
    // ADR 0007 rechazó `noUnusedLocals` y `noUnusedParameters` en el compilador
    // con un disparador textual: "El cimiento del linter. Van ahí, como
    // advertencia." Esta regla es ese disparador cumplido.
    //
    // `eslint-config-next/core-web-vitals` no habilita ninguna regla de
    // `typescript-eslint` (verificado leyendo su config: el paquete solo lo hace
    // en el export separado `eslint-config-next/typescript`, que no se usa acá
    // porque trae de más el resto del preset "recommended"), así que se declara
    // a mano, y solo para esta regla.
    files: archivosTypeScript,
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        // `no-floating-promises` necesita el árbol de tipos para saber si una
        // expresión es una Promise. `projectService` es el mecanismo actual de
        // `typescript-eslint` (v8) para esto en configuración plana: arma el
        // programa de TypeScript a partir de `tsconfig.json` sin que haga falta
        // declarar un segundo `tsconfig.eslint.json` paralelo.
        projectService: true,
        // `typescript-eslint` resuelve `tsconfig.json` relativo a este valor,
        // no al directorio desde el que se invoca `eslint`. Sin esto, correr
        // `pnpm lint` desde otro `cwd` rompe la resolución del proyecto.
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      // Con información de tipos porque sin ella la regla no puede saber si
      // una expresión es una Promise. Está en "error" y no en "warn": una
      // promesa sin manejar es un bug silencioso (una escritura o un envío que
      // no se sabe si terminó), no un estilo a discutir.
      "@typescript-eslint/no-floating-promises": "error",
    },
  },

  {
    // `eslint-plugin-drizzle` no publica preset plano: verificado leyendo el
    // paquete instalado (`node_modules/eslint-plugin-drizzle/src/index.js`,
    // 0.2.3 estable, y el mismo resultado en el rc 1.0.0-rc.5-ab785fc), su
    // único `configs.recommended` es formato legacy (`env`/`parserOptions`/
    // `plugins` como string), incompatible con la configuración plana de
    // ESLint 9. Se registra el plugin a mano y se toma una sola regla, con el
    // mismo patrón que ya usa este archivo para `jsx-a11y.flatConfigs.recommended.rules`.
    //
    // Disparador de reconsideración: si `eslint-plugin-drizzle` publica un
    // export `flat/recommended` (o si el plugin deja de mantenerse y de
    // correr), se revisa este bloque; no hace falta antes.
    files: archivosTypeScript,
    plugins: { drizzle: drizzlePlugin },
    rules: {
      // Solo esta, no las dos del preset: `enforce-update-with-where` queda
      // afuera porque hoy no hay una sola tabla (`src/db/esquema.ts` es un
      // `export {}` vacío) y sumar una regla sin código que la ejercite no
      // tiene con qué justificarse todavía. Se suma cuando exista la primera
      // tabla y el primer `update`.
      "drizzle/enforce-delete-with-where": "error",
    },
  },

  {
    // jsx-a11y recomendado completo, en "error": `eslint-config-next` por
    // defecto solo trae seis de estas reglas y en "warn". Hoy no hay una sola
    // pantalla escrita, así que subir la severidad cuesta cero errores — el
    // mismo argumento de momento del ADR 0007, que con veinte pantallas ya no
    // se hace nunca.
    //
    // Solo las reglas, sin volver a declarar el plugin: `eslint-config-next` ya
    // registra `jsx-a11y` en su propio bloque, y ESLint rechaza redefinir un
    // plugin bajo la misma clave con una segunda instancia del objeto — que es
    // justo lo que pasa si se usa `jsxA11y.flatConfigs.recommended` entero,
    // porque `eslint-config-next` envuelve el módulo con su propio interop.
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
];

export default configuracion;
