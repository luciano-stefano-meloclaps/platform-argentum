import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
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
 * Fuera de este archivo, a propósito y para un segundo incremento del mismo
 * ticket: las tres reglas con información de tipos (`no-floating-promises`,
 * `switch-exhaustiveness-check` sobre `entidad.tipo`, `no-restricted-imports`
 * por glob) y `eslint-plugin-drizzle`.
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
      parserOptions: { sourceType: "module" },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
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
