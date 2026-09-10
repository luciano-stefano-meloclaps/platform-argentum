import { expectTypeOf } from "vitest";

import type { Entidad } from "./catalogo.ts";
import type { DatosDe } from "./descriptores/registro.ts";

/**
 * Prueba de tipos de `Entidad`, la unión discriminada que devuelve el módulo
 * `catalogo`.
 *
 * Igual que `descriptores/registro.test-d.ts`: no la corre `vitest run` —el
 * arnés solo matchea `*.test.ts`—, la corre `pnpm typecheck`, porque
 * `expectTypeOf` es un chequeo de compilación normal y este archivo entra en
 * el `include` del `tsconfig.json`.
 */

declare const unaEntidad: Entidad;

/**
 * Lo que garantiza `Entidad` en la práctica: estrechar por `tipo` (acá, con un
 * único tipo en el registro, siempre es cierto) estrecha `datos` al mismo
 * tiempo, sin un `as` de por medio en el sitio de uso.
 */
if (unaEntidad.tipo === "procer") {
  expectTypeOf(unaEntidad.datos).toEqualTypeOf<DatosDe<"procer">>();
}

/**
 * `id`, `slug` y `nombre` no se reescribieron a mano: siguen siendo `string`,
 * tal como los infiere Drizzle del esquema.
 */
expectTypeOf(unaEntidad.id).toEqualTypeOf<string>();
expectTypeOf(unaEntidad.slug).toEqualTypeOf<string>();
expectTypeOf(unaEntidad.nombre).toEqualTypeOf<string>();
