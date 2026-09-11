import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "../db/cliente.ts";
import { entidad } from "../db/esquema.ts";
import { esTipoConocido, validarDatos, type DatosDe, type Tipo } from "./descriptores/registro.ts";

/**
 * El módulo `catalogo` (ADR 0002): el **único** lugar del sistema que consulta
 * la tabla `entidad`. La capa web no toca la base — le pide a estas tres
 * funciones, y solo a estas tres.
 *
 * **Interfaz:**
 *
 * - `listarPorTipo(tipo)` — todas las entidades de un tipo.
 * - `obtenerPorSlug(slug)` — una entidad por su slug, sin importar el tipo.
 * - `listarSlugs()` — los slugs de **todas** las entidades, de todos los
 *   tipos. Existe porque la ficha vive en `/catalogo/<slug>` (ticket #32, sin
 *   el tipo en la URL) y `generateStaticParams` necesita el universo completo
 *   de slugs sin que la capa web recorra el registro de descriptores, que es
 *   justo el import que la regla de límite prohíbe.
 *
 * No hay una cuarta función. `buscar`, `filtrar` y `contar` no entran porque
 * ninguna ruta las necesita hoy: agregarlas "por si acaso" es ensanchar la
 * interfaz sin un consumidor, y este módulo no lo hace.
 *
 * **Invariantes:**
 *
 * - Lo que devuelven estas tres funciones ya está validado contra el
 *   **descriptor** de su tipo (ADR 0001): quien las llama recibe `Entidad`, el
 *   tipo estrecho, y no vuelve a `parse` ni a castear.
 * - Una fila cuyo `tipo` no tiene descriptor en el registro —quedó de un tipo
 *   que se sacó del código— se trata como si no existiera: no rompe, no
 *   aparece en los resultados. `esTipoConocido` es el borde que lo decide (ver
 *   `descriptores/registro.ts`).
 * - **Errores:** ninguna de las tres lanza por "no encontrado". `obtenerPorSlug`
 *   de un slug inexistente devuelve `undefined`; `listarPorTipo` de un tipo sin
 *   entidades devuelve `[]`. Sí puede lanzar si `datos` está corrupto en la
 *   base y no pasa la validación del descriptor: es la regla interina de
 *   `docs/decisiones-pendientes.md` §1 — una fila que no cumple su propio
 *   descriptor es un defecto del sistema, no una decisión de un visitante, y
 *   todavía no hay decisiones de usuario en el catálogo.
 * - `server-only`: importar este módulo desde un componente de cliente rompe
 *   el build (también lo asegura `../db/cliente.ts`, que lo declara primero;
 *   se repite acá porque es parte del contrato de *este* módulo, no solo del
 *   cliente de base que usa por dentro).
 *
 * **No es de este módulo, a propósito** (ADR 0013, prohibiciones interinas): el
 * registro de lectura —épico o para chicos— no es un parámetro de ninguna de
 * estas tres funciones. Cuando exista, entra de forma aditiva.
 */

/** La fila cruda de `entidad`, tal como la infiere Drizzle del esquema. */
type FilaEntidad = typeof entidad.$inferSelect;

/**
 * Una entidad ya leída del catálogo: unión discriminada por `tipo`, con una
 * rama por cada tipo del registro de descriptores, donde el literal de `tipo`
 * empareja con los `datos` de ese mismo tipo.
 *
 * `id`, `slug` y `nombre` se derivan de `FilaEntidad` —la fila que infiere
 * Drizzle del esquema— y no se reescriben a mano: si una columna común cambia
 * de nombre o de tipo, este tipo lo hereda solo. Estrechar por `tipo` estrecha
 * `datos` (verificado en `catalogo.test-d.ts`), que es lo que le ahorra a quien
 * llama tener que validar o castear de nuevo.
 *
 * Es lo único que este módulo expone hacia afuera: quien lo consume nunca ve
 * `FilaEntidad` ni un `datos` sin estrechar.
 */
export type Entidad<T extends Tipo = Tipo> = {
  [K in T]: Omit<FilaEntidad, "tipo" | "datos"> & {
    tipo: K;
    datos: DatosDe<K>;
  };
}[T];

/**
 * Valida `datos` contra el descriptor de `tipo` y arma la `Entidad` que
 * devuelve el módulo. Único punto donde una fila cruda se convierte en el tipo
 * estrecho, para que las tres funciones públicas no repitan la conversión.
 *
 * `Entidad` está parametrizado por `T` (con `Tipo` de valor por omisión para el
 * uso externo, que es una unión discriminada) y es un *mapped type homomórfico*
 * indexado por el mismo `T` que recibe esta función. Es lo que hace sound la
 * conversión de abajo sin pasar por `unknown`: `Entidad<T>` para el `T`
 * genérico de esta función es, por construcción, la misma forma que se arma acá
 * — no una rama de una unión ya resuelta que el compilador tenga que adivinar
 * (que es lo que fallaba con `Extract<Entidad, { tipo: T }>` cuando el registro
 * tiene un solo tipo: `Entidad` deja de ser una unión de verdad y `Extract`
 * pierde la correlación con `T`). Sigue siendo la única aserción del módulo,
 * igual que la de `validarDatos`, y está cubierta por `catalogo.test-d.ts`.
 */
function aEntidad<T extends Tipo>(fila: Omit<FilaEntidad, "tipo"> & { tipo: T }): Entidad<T> {
  const { datos, ...resto } = fila;

  return { ...resto, datos: validarDatos(fila.tipo, datos) } as Entidad<T>;
}

/**
 * Todas las entidades de un `tipo`, ordenadas por `nombre`.
 *
 * Un tipo sin entidades devuelve `[]`, no un error.
 */
export async function listarPorTipo<T extends Tipo>(tipo: T): Promise<Entidad<T>[]> {
  const filas = await db.select().from(entidad).where(eq(entidad.tipo, tipo)).orderBy(asc(entidad.nombre));

  return filas.map((fila) => aEntidad({ ...fila, tipo }));
}

/**
 * La entidad con ese `slug`, de cualquier tipo, o `undefined` si no existe.
 *
 * `slug` es único en toda la tabla (`entidad_slug_unico`, ADR 0013), así que
 * alcanza con el valor: no hace falta saber el tipo de antemano.
 */
export async function obtenerPorSlug(slug: string): Promise<Entidad | undefined> {
  const [fila] = await db.select().from(entidad).where(eq(entidad.slug, slug)).limit(1);

  if (fila === undefined) return undefined;
  if (!esTipoConocido(fila.tipo)) return undefined;

  return aEntidad({ ...fila, tipo: fila.tipo });
}

/**
 * Los slugs de **todas** las entidades del catálogo, de todos los tipos.
 *
 * Sin parámetros y sin recorrer el registro de descriptores: es la capa web la
 * que necesitaría hacer eso para llamar a `listarPorTipo` tipo por tipo, y es
 * justo el import que la regla de límite del ADR 0002 prohíbe. Esta función le
 * da el universo completo en una sola llamada.
 *
 * Devuelve `string[]`, no `{ slug: string }[]`: encajar la forma en la
 * convención de `generateStaticParams` de Next es trabajo de la capa web, no
 * de este módulo (ver ticket #31).
 */
export async function listarSlugs(): Promise<string[]> {
  const filas = await db.select({ slug: entidad.slug }).from(entidad).orderBy(asc(entidad.slug));

  return filas.map((fila) => fila.slug);
}
