import type * as z from "zod";

/**
 * Un **descriptor** es el esquema Zod de los **datos** de un **tipo** de
 * entidad (ADR 0001, `CONTEXT.md`). Es la fuente única de la forma de un tipo:
 * de él salen el tipo de la columna JSONB, la validación de la **importación**
 * y la validación que hace el módulo `catalogo` al leer.
 *
 * **El descriptor no declara a qué tipo pertenece.** Eso lo dice la clave con
 * la que entra al registro de descriptores, y declararlo dos veces habilita que
 * las dos declaraciones se contradigan: con un campo `tipo` adentro,
 * `{ monumento: descriptorDeProcer }` compilaría sin quejarse. Sin él, ese
 * error no se puede escribir. Coincide además con el glosario, que define
 * descriptor como "la definición en código —un esquema Zod— de los campos que
 * tiene un tipo".
 *
 * `z.ZodObject` y no `z.ZodType`: un descriptor describe los campos de un tipo,
 * así que siempre es un objeto. Acotarlo acá es lo que permite que
 * `satisfies Descriptor` conserve la forma de cada esquema en vez de borrarla.
 */
export type Descriptor = z.ZodObject;
