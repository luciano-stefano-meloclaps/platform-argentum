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
 * Ticket #57: las dos reglas que quedaron afuera de los incrementos
 * anteriores "para cuando exista el primer descriptor y la primera
 * separación de módulo" — ese disparador ya se cumplió (#31, #61) — se
 * agregan acá:
 *
 * - `@typescript-eslint/switch-exhaustiveness-check`, sobre la unión
 *   discriminada `Entidad` de `src/catalogo/catalogo.ts` (discriminador
 *   `tipo`).
 * - `no-restricted-imports` con `patterns`, para que `src/app/**` no pueda
 *   importar `src/db/*` (el cliente y el esquema de la base) ni el interior
 *   de `src/catalogo/*` — solo su interfaz pública, `catalogo/catalogo.ts`
 *   (no existe un `catalogo/index.ts`: ese es el nombre real del punto de
 *   entrada del módulo, ver ADR 0002).
 *
 *   El código real de `src/app` importa con rutas **relativas**, no con el
 *   alias `@/` (aunque `tsconfig.json` lo declara), así que los patrones no
 *   pueden ser literales tipo `@/db/*`: una ficha a un nivel de profundidad
 *   escribe `../db/cliente.ts`, otra a tres niveles escribe
 *   `../../../db/cliente.ts`, y ninguna de las dos empieza con `@/`. Se usa
 *   `patterns` (no `paths`) con glob estilo `.gitignore` (`**`), que es lo
 *   que exporta la propia regla core de ESLint vía el paquete `ignore`: `**`
 *   absorbe cualquier cantidad de segmentos `..` iniciales, así que
 *   `**\/db/**` combina en un solo patrón el alias y cualquier profundidad
 *   relativa (verificado ejecutando el matcher a mano: `../db/x`,
 *   `../../../db/x` y `@/db/x` dan los tres `true`). Para `catalogo` se
 *   agrega la excepción `!**\/catalogo/catalogo.ts`, que por el mismo
 *   mecanismo excluye el punto de entrada sin importar cuántos `../` lo
 *   antecedan.
 */

// Todo lo que puede llevar sintaxis de TypeScript, incluidos los archivos de
// herramienta que corren con `node` sin paso de build (ver `src/db/ping.mts`).
const archivosTypeScript = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

// La capa web (ADR 0002): únicos archivos donde tiene sentido evaluar el
// límite contra la base y contra el interior del módulo `catalogo`. Acotar
// `files` a esto, en vez de dejar la regla correr sobre todo el árbol, es lo
// que le permite a `src/catalogo/catalogo.ts` seguir importando su propio
// `../db/cliente.ts` sin activar la regla que le prohíbe eso a `src/app`.
const archivosCapaWeb = ["src/app/**/*.ts", "src/app/**/*.tsx", "src/app/**/*.mts", "src/app/**/*.cts"];

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
      // Ticket #57: la unión discriminada `Entidad` (`src/catalogo/catalogo.ts`,
      // discriminador `tipo`) es la única que existe hoy en el árbol, pero la
      // regla no se acota a un archivo — un `switch` sobre `tipo` que le falte
      // una rama tiene que dejar de compilar donde sea que se escriba, no solo
      // adentro del módulo. Con información de tipos (necesita saber qué unión
      // se está recorriendo); no hay un solo `switch` en el árbol todavía, así
      // que subir la severidad a "error" cuesta cero errores hoy, mismo
      // argumento de momento que ya usa este archivo para `jsx-a11y`. Las
      // opciones por omisión alcanzan: un `default` no oculta una rama
      // faltante (`allowDefaultCaseForExhaustiveSwitch` es sobre lo
      // *contrario* — permitir un `default` de más cuando ya está completo—),
      // y no se exige `default` en switches sobre tipos que no son unión
      // (`requireDefaultForNonUnion: false`, que es donde vive el
      // `noFallthroughCasesInSwitch` del ADR 0007, no acá).
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },

  {
    // Ticket #57, ADR 0002: "la capa web no consulta la base de datos; le
    // pide al módulo". Hasta este ticket lo sostenía solo la disciplina del
    // equipo (server-only rompe un componente de *cliente* que importe el
    // módulo, pero no dice nada de un Server Component que importe
    // `../db/cliente.ts` directo y consulte).
    //
    // `no-restricted-imports` (regla core, no la de un plugin) en vez de
    // `import/no-restricted-paths`: esta última matchea contra el archivo ya
    // *resuelto* en disco, que hubiera sido más simple para el caso de rutas
    // relativas de profundidad variable, pero la regla que pide el ticket es
    // esta, y sus `patterns` (a diferencia de `paths`) alcanzan el mismo
    // resultado: usan glob estilo `.gitignore` vía el paquete `ignore`
    // (`allowRelativePaths: true`, así lo declara la propia regla), y ahí
    // `**` absorbe cualquier cantidad de segmentos `../` iniciales. Un patrón
    // como `**/db/**` matchea `../db/cliente.ts`, `../../../db/cliente.ts` y
    // (si algún día se usa) `@/db/cliente.ts` con la misma línea —verificado
    // ejecutando el matcher (`node_modules/ignore`) a mano contra los tres—.
    //
    // `catalogo`: se restringe el interior del módulo completo y se excepciona
    // solo `catalogo.ts`, que es su interfaz pública (ver el comentario de
    // ese archivo). No hay `catalogo/index.ts` — el ticket lo nombra así, pero
    // ese archivo no existe en este árbol — así que la excepción apunta al
    // nombre real.
    //
    // Sin `allowTypeImports`: un `import type` de un tipo interno del módulo
    // (por ejemplo `Tipo`, de `descriptores/registro.ts`) es tan parte del
    // interior que hay que pedirle a `catalogo.ts` como cualquier otra cosa,
    // no una excepción al límite.
    //
    // Ticket #112, ADR 0019: mismo tratamiento para `identidad` que para
    // `catalogo`, con la excepción del propio módulo apuntando a
    // `identidad.ts` (su interfaz pública). Se excluye por completo
    // `src/app/api/auth/[...all]/route.ts` de este bloque (`ignores`, no una
    // excepción más al patrón): esa ruta es la única nombrada por el ADR 0019
    // (Regla 3) que necesita la instancia cruda de Better Auth
    // (`identidad/auth.ts`) en vez del contrato de dominio del módulo, porque
    // sirve el protocolo propio de Better Auth, no una llamada de negocio.
    files: archivosCapaWeb,
    ignores: ["src/app/api/auth/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/db/**"],
              message: "La capa web no consulta la base de datos (ADR 0002): pedile al módulo `catalogo`.",
            },
            {
              group: ["**/catalogo/**", "!**/catalogo/catalogo.ts"],
              message:
                "Desde `src/app` solo se importa la interfaz pública del módulo, `catalogo/catalogo.ts` (ADR 0002).",
            },
            {
              group: ["**/identidad/**", "!**/identidad/identidad.ts"],
              message:
                "Desde `src/app` solo se importa la interfaz pública del módulo, `identidad/identidad.ts` (ADR 0019).",
            },
          ],
        },
      ],
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
    // ADR 0011: la extensión `.ts` explícita en los imports relativos de
    // **valor** es lo que permite que el script de importación del contenido
    // curado corra con `node` directo, sin compilador en el camino (ADR 0009):
    // ESM no adivina extensiones, y Node resuelve exactamente lo que sobrevive
    // al borrado de tipos. Los `import type` quedan afuera a propósito —Node
    // nunca los resuelve— y así la extensión conserva un significado: "esto
    // existe en tiempo de ejecución", la misma señal que el ADR 0007 le pidió a
    // `verbatimModuleSyntax`. Esa exención es el default de la regla
    // (`checkTypeImports: false`).
    //
    // Sin la regla, el invariante se rompe en silencio: `tsc`, Turbopack y
    // Vitest resuelven igual con o sin extensión, y la única que falla es la
    // importación, en tiempo de ejecución y fuera de CI.
    //
    // La regla es de `eslint-plugin-import`, que `eslint-config-next` ya
    // registra bajo la clave `import`: se toma la regla sin volver a declarar el
    // plugin, mismo patrón que este archivo usa para `jsx-a11y`. Si alguna vez
    // dejara de traerlo, ESLint falla ruidosamente con "regla desconocida" y
    // ahí se agrega `eslint-plugin-import` como dependencia directa.
    files: archivosTypeScript,
    rules: {
      "import/extensions": [
        "error",
        "ignorePackages",
        { ts: "always", tsx: "always", mts: "always", cts: "always" },
      ],
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
