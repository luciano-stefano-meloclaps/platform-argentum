import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as z from "zod";

import { esTipoConocido, validarDatos } from "../descriptores/registro.ts";
import type { Dirent } from "node:fs";
import type { Datos, Tipo } from "../descriptores/registro";

/**
 * Lectura del **contenido curado**: convierte el árbol de archivos que fija el
 * ADR 0009 —`contenido/<tipo>/<slug>.ts` más su imagen en
 * `public/contenido/<tipo>/<slug>.webp`— en fichas verificadas contra el
 * **descriptor** de su tipo.
 *
 * Toda la interfaz son dos funciones: `revisarContenidoCurado`, que informa lo
 * que encontró y lo que está mal, y `leerContenidoCurado`, que exige que no
 * haya nada mal. Detrás quedan el recorrido del directorio, el descubrimiento
 * de tipos y slugs sin índice manual, la carga de cada archivo, la validación
 * de su forma, la validación de sus **datos** contra el descriptor y la
 * verificación de que la imagen exista.
 *
 * **La extensión es `.mts` y no `.ts`** por lo mismo que `src/db/ping.mts`: el
 * script de importación corre con `node` a secas, sin compilador en el camino
 * (ADR 0009), y sin `"type": "module"` en `package.json` un `.ts` se parsea
 * primero como CommonJS. `.mts` es ESM sin ambigüedad.
 *
 * **Errores:** ambas funciones fallan lanzando. Es la regla interina de
 * `docs/decisiones-pendientes.md` §1: una excepción señala un fallo del
 * programa o del contenido, no una decisión de un usuario, y acá no hay
 * usuarios. `revisarContenidoCurado` **no** lanza por contenido inválido —para
 * eso están los `problemas`—, pero sí por un fallo de entrada/salida que no sea
 * "no existe".
 */

/**
 * Dónde están las dos mitades del contenido curado. Se recibe en vez de
 * calcularse adentro para que las pruebas apunten a un directorio de ejemplo
 * sin tocar el repositorio real.
 */
export type UbicacionDelContenido = {
  /** Raíz de los archivos de ficha. En el repositorio, `contenido/`. */
  fichas: string;
  /** Raíz de las imágenes. En el repositorio, `public/contenido/`. */
  imagenes: string;
};

/** Una ficha del contenido curado, ya verificada y lista para escribir. */
export type FichaCurada = {
  tipo: Tipo;
  /** Sale del nombre del archivo, nunca de adentro (ADR 0009). */
  slug: string;
  nombre: string;
  datos: Datos;
};

/**
 * Lo que encontró una revisión del contenido curado.
 *
 * `fichas` trae las que se pudieron leer y cuyos **datos** validaron contra el
 * descriptor de su tipo, ordenadas por tipo y slug. `problemas` trae una línea
 * por cada cosa que no cumple, con el tipo y el slug adelante. Las dos listas
 * juntas y no un error a la primera falla: quien redacta prefiere ver las
 * cuatro fichas rotas de una vez y no descubrirlas de a una.
 *
 * **Las dos listas no son complementarias**: una ficha con los datos válidos a
 * la que le falta la imagen aparece en `fichas` **y** en `problemas`. Quien
 * exige que no haya ningún problema es `leerContenidoCurado`, y es la que usa
 * la importación.
 */
export type RevisionDelContenido = {
  fichas: FichaCurada[];
  problemas: string[];
};

/**
 * La forma del archivo, verificada en tiempo de ejecución.
 *
 * `datos` se exige objeto y nada más: qué campos lleva adentro lo dice el
 * descriptor del tipo, y duplicar acá una sola de sus reglas sería empezar a
 * tener dos fuentes de la forma de un tipo.
 */
const formaDelArchivo = z.object({
  nombre: z.string().min(1),
  datos: z.record(z.string(), z.unknown()),
});

/** Un slug es lo que va en la URL de la **ficha**, así que se acota a eso. */
const slugValido = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Raíz del repositorio, tres niveles arriba de `src/catalogo/importacion/`. */
const raizDelRepositorio = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

/** Las rutas reales del repositorio, las que usa el comando de importación. */
export const ubicacionEnElRepositorio: UbicacionDelContenido = {
  fichas: path.join(raizDelRepositorio, "contenido"),
  imagenes: path.join(raizDelRepositorio, "public", "contenido"),
};

/** `true` si la ruta existe y es un archivo. Un directorio no es una imagen. */
async function existeArchivo(ruta: string): Promise<boolean> {
  try {
    return (await stat(ruta)).isFile();
  } catch {
    return false;
  }
}

/**
 * Ruta de la imagen de una ficha, **derivada** del tipo y del slug (ADR 0009).
 * No hay ningún campo que la escriba a mano, así que no puede desincronizarse.
 */
export function rutaDeImagen(
  ubicacion: UbicacionDelContenido,
  tipo: string,
  slug: string,
): string {
  return path.join(ubicacion.imagenes, tipo, `${slug}.webp`);
}

/** Cómo se nombra una ficha en un mensaje de problema: `procer/manuel-belgrano`. */
function nombrar(tipo: string, slug: string): string {
  return `${tipo}/${slug}`;
}

/**
 * Las entradas del directorio, o `null` si el directorio no existe.
 *
 * El tipo de retorno se escribe a mano y **no** se deriva de
 * `ReturnType<typeof readdir>`: `readdir` está sobrecargado y esa expresión se
 * queda con la última sobrecarga, la de `Dirent<Buffer>`, con lo que
 * `entrada.name` dejaría de ser una cadena.
 */
async function listar(directorio: string): Promise<Dirent[] | null> {
  try {
    return await readdir(directorio, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

/**
 * Carga un archivo de contenido y devuelve su `export default` sin verificar.
 *
 * El `import` dinámico es el que hace que la importación sea "un `import` y un
 * recorrido de directorio, no un parser" (ADR 0009). Va por `pathToFileURL`
 * porque una ruta absoluta de Windows no es un especificador válido.
 */
async function cargarPorDefecto(rutaDelArchivo: string): Promise<unknown> {
  const modulo: unknown = await import(pathToFileURL(rutaDelArchivo).href);

  return (modulo as { default?: unknown }).default;
}

/**
 * Recorre el contenido curado y devuelve las fichas sanas y los problemas.
 *
 * El recorrido es la única fuente de qué fichas existen: el directorio es el
 * **tipo** y el nombre del archivo es el **slug**, y no hay índice manual que
 * alguien se olvide de actualizar (ADR 0009).
 *
 * Se ignoran los archivos y directorios que empiezan con punto —`.DS_Store` y
 * compañía—; cualquier otra cosa que no sea un `.ts` dentro de un directorio de
 * tipo se informa como problema en vez de saltearse en silencio.
 */
export async function revisarContenidoCurado(
  ubicacion: UbicacionDelContenido,
): Promise<RevisionDelContenido> {
  const fichas: FichaCurada[] = [];
  const problemas: string[] = [];

  const raiz = await listar(ubicacion.fichas);

  if (raiz === null) {
    return { fichas, problemas: [`No existe el directorio de contenido \`${ubicacion.fichas}\`.`] };
  }

  const tipos = raiz
    .filter((entrada) => !entrada.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entradaDeTipo of tipos) {
    const tipo = entradaDeTipo.name;

    if (!entradaDeTipo.isDirectory()) {
      problemas.push(
        `\`contenido/${tipo}\` no es un directorio. En la raíz del contenido solo hay tipos.`,
      );
      continue;
    }

    if (!esTipoConocido(tipo)) {
      problemas.push(
        `\`contenido/${tipo}\` no es un tipo conocido: no tiene descriptor en el registro.`,
      );
      continue;
    }

    const archivos = (await listar(path.join(ubicacion.fichas, tipo)) ?? [])
      .filter((entrada) => !entrada.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entradaDeArchivo of archivos) {
      if (!entradaDeArchivo.isFile() || !entradaDeArchivo.name.endsWith(".ts")) {
        problemas.push(
          `\`contenido/${tipo}/${entradaDeArchivo.name}\` no es un archivo de ficha \`.ts\`.`,
        );
        continue;
      }

      const slug = entradaDeArchivo.name.slice(0, -".ts".length);
      const donde = nombrar(tipo, slug);

      if (!slugValido.test(slug)) {
        problemas.push(
          `${donde}: el slug tiene que ser minúsculas, números y guiones. Sale del nombre del archivo.`,
        );
        continue;
      }

      const ficha = await revisarFicha(ubicacion, tipo, slug, problemas);

      if (ficha !== null) fichas.push(ficha);
    }
  }

  return { fichas, problemas };
}

/**
 * Revisa una ficha: la carga, verifica su forma, valida sus **datos** contra el
 * descriptor de su tipo y comprueba que su imagen exista.
 *
 * Devuelve `null` y agrega a `problemas` en vez de lanzar, porque la revisión
 * completa vale más que la primera falla.
 */
async function revisarFicha(
  ubicacion: UbicacionDelContenido,
  tipo: Tipo,
  slug: string,
  problemas: string[],
): Promise<FichaCurada | null> {
  const donde = nombrar(tipo, slug);
  let porDefecto: unknown;

  try {
    porDefecto = await cargarPorDefecto(path.join(ubicacion.fichas, tipo, `${slug}.ts`));
  } catch (error) {
    problemas.push(
      `${donde}: no se pudo cargar el archivo (${error instanceof Error ? error.message : "error desconocido"}).`,
    );
    return null;
  }

  const forma = formaDelArchivo.safeParse(porDefecto);

  if (!forma.success) {
    problemas.push(
      `${donde}: el \`export default\` no es una ficha.\n${z.prettifyError(forma.error)}`,
    );
    return null;
  }

  let datos: Datos;

  try {
    datos = validarDatos(tipo, forma.data.datos);
  } catch (error) {
    problemas.push(
      error instanceof z.ZodError
        ? `${donde}: los datos no cumplen el descriptor de \`${tipo}\`.\n${z.prettifyError(error)}`
        : `${donde}: falló la validación (${error instanceof Error ? error.message : "error desconocido"}).`,
    );
    return null;
  }

  // La imagen se verifica después de los datos y no antes: si la ficha está mal
  // escrita, lo primero que hay que decirle a quien la escribió es eso.
  //
  // Y a diferencia de los casos de arriba, la ficha se devuelve igual: sus
  // datos son válidos, y lo que falta es un archivo de al lado. Quien lea la
  // revisión puede así verificar el contenido de una ficha a la que todavía no
  // le llegó la imagen. Quien exige que todo esté sano es `leerContenidoCurado`.
  if (!(await existeArchivo(rutaDeImagen(ubicacion, tipo, slug)))) {
    problemas.push(`${donde}: falta la imagen en \`public/contenido/${tipo}/${slug}.webp\`.`);
  }

  return { tipo, slug, nombre: forma.data.nombre, datos };
}

/**
 * Las fichas del contenido curado, o un error si alguna no cumple.
 *
 * Es lo que usa la importación, y es lo que garantiza el criterio de "falla sin
 * escribir nada": la validación entera ocurre acá, antes de que nadie abra una
 * conexión.
 *
 * **Error:** lanza `Error` con una línea por problema si hay al menos uno.
 */
export async function leerContenidoCurado(
  ubicacion: UbicacionDelContenido,
): Promise<FichaCurada[]> {
  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  if (problemas.length > 0) {
    throw new Error(
      `El contenido curado tiene ${problemas.length} problema(s):\n\n${problemas.join("\n\n")}`,
    );
  }

  return fichas;
}
