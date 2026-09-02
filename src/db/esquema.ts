import { jsonb, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";

/**
 * Esquema de la base, en TypeScript plano (ADR 0005).
 *
 * Los nombres de las columnas se escriben explícitamente —`text("tipo")` y no
 * `text()`— en vez de configurar `casing: "snake_case"` global en
 * `drizzle.config.ts`. Nombrar acá es lo que hace que esa configuración no haga
 * falta, y deja el nombre físico de cada columna a la vista de quien lee el
 * esquema y de quien lee la migración.
 */

/**
 * La tabla única del catálogo (ADR 0001).
 *
 * Todo el catálogo vive acá: próceres, monumentos, animales, fechas patrias y
 * los tipos que todavía no se le ocurrieron a nadie. Lo que distingue a una
 * entidad de otra es la columna `tipo`; los campos propios de cada tipo viven
 * en `datos`, y su forma la dicta el **descriptor** en código, no la base.
 *
 * Lo que la base **no** hace, a propósito: validar la forma de `datos`. Esa
 * validación es del descriptor, en el borde del módulo `catalogo`. Replicarla
 * acá con una restricción `check` pondría la misma regla en dos lugares que se
 * desincronizan.
 */
export const entidad = pgTable(
  "entidad",
  {
    /**
     * Clave sustituta, interna y estable. Las URL del sitio usan `slug`, no
     * esto.
     *
     * `uuid` y no un entero de identidad porque la clave nunca se muestra ni se
     * ordena por ella, y `gen_random_uuid()` viene de fábrica en PostgreSQL
     * desde la versión 13 —sin extensiones, igual en Docker que en Neon—. Con
     * 60 fichas la diferencia de tamaño e índice es irrelevante; lo que sí
     * importa es que la **importación** pueda calcular una fila entera sin
     * pedirle un número a una secuencia.
     */
    id: uuid("id").primaryKey().defaultRandom(),

    /**
     * El discriminador del ADR 0001.
     *
     * `text` y **no** un `pgEnum`: el ADR 0001 se decidió sobre la premisa de
     * que el conjunto de tipos no está cerrado y de que agregar uno tiene que
     * costar un descriptor, "sin migración". Un enum de PostgreSQL convertiría
     * cada tipo nuevo en una migración, que es exactamente el costo que la
     * decisión fue a eliminar. El conjunto válido de valores lo sostiene el
     * registro de descriptores, en código.
     */
    tipo: text("tipo").notNull(),

    /**
     * El identificador legible que aparece en la URL de la ficha.
     *
     * Único: ver la restricción al pie. No es la clave primaria porque un slug
     * se corrige —una errata, un renombre— y una clave mutable se propaga a
     * todo lo que la referencie.
     */
    slug: text("slug").notNull(),

    /** El nombre de la entidad tal como se muestra. */
    nombre: text("nombre").notNull(),

    /**
     * Los **datos** de la entidad: los campos propios de su tipo.
     *
     * Sin `$type<Datos>()` todavía, y es deliberado: `Datos` sale de los
     * descriptores, que no existen hasta la primera rebanada. Engancharlo
     * después **no cuesta una migración**, porque `$type<>()` es puramente de
     * compilación y no cambia una coma del SQL.
     *
     * `notNull` sin valor por omisión: una entidad sin datos es un error de la
     * importación, y conviene que falle al insertar y no que quede una fila con
     * `{}` que después nadie sabe si es un vacío legítimo.
     */
    datos: jsonb("datos").notNull(),
  },
  (tabla) => [
    /**
     * Unicidad de `slug`. No es opcional ni cosmética: es la condición que
     * habilita la **importación** idempotente del ADR 0004. Sin ella, `ON
     * CONFLICT (slug)` no tiene sobre qué apoyarse y correr la importación dos
     * veces duplica el catálogo.
     *
     * El nombre va explícito porque es el que va a leer el módulo `catalogo`
     * cuando PostgreSQL rechace un alta duplicada.
     *
     * Es el **único** índice además de la clave primaria. En particular no hay
     * GIN sobre `datos`: con 60 fichas la lectura secuencial le gana a
     * cualquier índice, y uno que nadie usa es costo de escritura a cambio de
     * nada. Cuando exista un filtro real sobre un atributo de `datos`, la
     * respuesta primero a evaluar no es indexar el JSON sino promover ese
     * atributo a columna real (ADR 0001, deuda asumida).
     */
    unique("entidad_slug_unico").on(tabla.slug),
  ],
);
