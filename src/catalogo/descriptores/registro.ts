import type * as z from "zod";

import type { Descriptor } from "./descriptor";
import { procer } from "./procer";

/**
 * El **registro de descriptores** (ADR 0001): la estructura en código que reúne
 * los descriptores de todos los **tipos**.
 *
 * Es la que define **qué tipos existen**. La base no lo sabe: `entidad.tipo` es
 * `text` y no un enum, justamente para que agregar un tipo no cueste una
 * migración. Agregar un tipo es escribir su descriptor y sumar una línea acá.
 *
 * `satisfies` y no una anotación de tipo, y la diferencia no es de estilo:
 * `const registroDeDescriptores: Record<string, Descriptor>` borraría las
 * claves —`Tipo` sería `string`— y borraría la forma de cada esquema —los
 * `datos` de un prócer serían `{}`—. Con `satisfies` el compilador verifica que
 * cada valor sea un descriptor y conserva las dos cosas.
 */
export const registroDeDescriptores = {
  procer,
} satisfies Record<string, Descriptor>;

/**
 * Los tipos de entidad que existen, derivados del registro.
 *
 * Sale de `keyof`: no hay una segunda lista, y no hay dónde meter un `enum`
 * aunque alguien quisiera —`erasableSyntaxOnly` lo prohíbe (ADR 0007)—.
 */
export type Tipo = keyof typeof registroDeDescriptores;

/**
 * Los **datos** de un tipo concreto: lo que devuelve validar, lo que se guarda
 * en la columna JSONB y lo que lee la **ficha**.
 */
export type DatosDe<T extends Tipo> = z.output<(typeof registroDeDescriptores)[T]>;

/**
 * Lo que se escribe a mano en un archivo de contenido curado
 * (`contenido/<tipo>/<slug>.ts`, ADR 0009).
 *
 * Hoy coincide con `DatosDe` porque ningún descriptor tiene `.default()` ni
 * `.transform()`. Existe igual, y es una línea: el día que un descriptor
 * incorpore un valor por omisión, `z.input` deja de exigirlo en los archivos de
 * contenido y `z.output` sí lo garantiza a quien lee. Si los archivos de
 * contenido se tiparan con `DatosDe`, ese día habría que tocar las sesenta
 * fichas.
 */
export type EntradaDe<T extends Tipo> = z.input<(typeof registroDeDescriptores)[T]>;

/**
 * Los **datos** de cualquier tipo. Es lo que va a `jsonb().$type<Datos>()`
 * (ADR 0005), en el ticket #28.
 *
 * Se deriva del registro; no se escribe a mano ni se mantiene en paralelo.
 *
 * Nota sobre el discriminador: `Datos` es la unión de los datos de todos los
 * tipos, pero **no** es una unión discriminada, y no puede serlo. El
 * discriminador `tipo` es una columna aparte de la tabla `entidad` y no vive
 * adentro del JSONB (ADR 0001). La unión discriminada por `tipo` es la que
 * empareja las dos columnas —la entidad—, y su lugar es el módulo `catalogo`
 * cuando lea de la base, donde puede derivar `id`, `slug` y `nombre` de la
 * tabla en vez de volver a escribirlos a mano.
 */
export type Datos = DatosDe<Tipo>;

/**
 * Estrecha un `tipo` que viene de la base —donde la columna es `text` libre— a
 * un tipo conocido por el registro.
 *
 * Es el borde: una fila con un tipo que ya no tiene descriptor existe y es
 * posible (se quitó un descriptor, quedaron filas viejas), y el módulo tiene
 * que poder tratarla como "no encontrada" en vez de romper.
 */
export function esTipoConocido(valor: string): valor is Tipo {
  return Object.hasOwn(registroDeDescriptores, valor);
}

/**
 * Valida unos **datos** contra el descriptor de su **tipo** y los devuelve con
 * el tipo estrecho de ese tipo.
 *
 * Es el único camino por el que unos datos sin verificar se convierten en
 * `DatosDe<T>`: la **importación** y el módulo `catalogo` pasan por acá.
 *
 * **Error:** lanza `ZodError` si los datos no cumplen. Cada `issue` lleva el
 * `path` del campo que falló, que es lo que la importación necesita para
 * decirle al redactor qué corregir (`z.prettifyError` arma el mensaje).
 *
 * Lanza y no devuelve un resultado tipado porque los dos consumidores de hoy
 * tratan unos datos inválidos como un **defecto** y no como una rama a
 * recuperar: la importación tiene que fallar fuerte (ADR 0009) y una fila
 * corrupta en JSONB también. El caso que sí necesita una rama sin excepción es
 * la **propuesta** de un usuario, que todavía no existe. Cómo se representan
 * los errores en todo el sistema es una decisión de arquitectura sin tomar:
 * esta firma está elegida para no fijarla. Lo que no se hace en ningún caso es
 * devolver el resultado de `safeParse` de Zod a través de la interfaz del
 * módulo, porque eso mete el tipo de error de Zod en un contrato que cruzan la
 * capa web y la importación.
 */
export function validarDatos<T extends Tipo>(tipo: T, datos: unknown): DatosDe<T> {
  // La única aserción del módulo, y es inevitable: al indexar el registro con
  // un `T` genérico, `.parse()` devuelve la unión ancha de todos los tipos y el
  // compilador pierde la relación entre `T` y su descriptor. El estrechamiento
  // es correcto —`registroDeDescriptores[T]` es el descriptor de `T`—, y está
  // encerrado en esta línea y cubierto por `registro.test-d.ts`.
  return registroDeDescriptores[tipo].parse(datos) as DatosDe<T>;
}
