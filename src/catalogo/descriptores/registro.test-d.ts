import { expectTypeOf } from "vitest";

import { validarDatos, type Datos, type DatosDe, type Tipo } from "./registro";

/**
 * Pruebas de tipos del registro de descriptores.
 *
 * No las corre `vitest run`: el patrón del arnés es `src/**\/*.test.ts` y este
 * archivo no matchea. Las corre `pnpm typecheck`, porque un desajuste de
 * `expectTypeOf` es un error de compilación normal y el archivo entra en el
 * `include` del `tsconfig.json`.
 */

/**
 * Lo que sostiene la aserción `as DatosDe<T>` de `validarDatos`. Si esto deja
 * de valer, la función devuelve la unión ancha de todos los tipos y el módulo
 * `catalogo` y la ficha empiezan a recibir datos de un tipo que no pidieron.
 */
expectTypeOf(validarDatos("procer", {})).toEqualTypeOf<DatosDe<"procer">>();

/** `Tipo` sale del registro y de ningún otro lado. */
expectTypeOf<Tipo>().toEqualTypeOf<"procer">();

/** `Datos` se deriva del registro: con un solo tipo, es lo mismo que sus datos. */
expectTypeOf<Datos>().toEqualTypeOf<DatosDe<"procer">>();
