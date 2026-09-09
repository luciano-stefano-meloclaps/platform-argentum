import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";

import {
  leerContenidoCurado,
  revisarContenidoCurado,
  rutaDeImagen,
  type UbicacionDelContenido,
} from "./contenido.mts";

/**
 * Pruebas de la lectura del contenido curado, sobre directorios de ejemplo
 * armados al vuelo. No tocan `contenido/` ni la base: lo que se verifica es el
 * recorrido, la validación y la derivación de la ruta de la imagen.
 *
 * La lectura del `contenido/` real vive en `contenido-curado.test.ts`.
 */

const temporales: string[] = [];

afterEach(async () => {
  await Promise.all(temporales.splice(0).map((ruta) => rm(ruta, { recursive: true, force: true })));
});

/**
 * Arma un contenido de ejemplo en un directorio nuevo.
 *
 * Cada llamada usa un directorio distinto a propósito: `import()` cachea por
 * ruta, así que reusar la misma devolvería la ficha de la prueba anterior.
 */
async function armarContenido(): Promise<UbicacionDelContenido> {
  const raiz = await mkdtemp(path.join(tmpdir(), "argentum-contenido-"));
  temporales.push(raiz);

  return {
    fichas: path.join(raiz, "contenido"),
    imagenes: path.join(raiz, "public", "contenido"),
  };
}

/** Escribe `contenido/<tipo>/<slug>.ts` con el cuerpo que se le pase. */
async function escribirFicha(
  ubicacion: UbicacionDelContenido,
  tipo: string,
  slug: string,
  cuerpo: string,
): Promise<void> {
  const directorio = path.join(ubicacion.fichas, tipo);
  await mkdir(directorio, { recursive: true });
  await writeFile(path.join(directorio, `${slug}.ts`), cuerpo, "utf8");
}

/** Escribe el `.webp` en la ruta derivada del tipo y del slug. */
async function escribirImagen(
  ubicacion: UbicacionDelContenido,
  tipo: string,
  slug: string,
): Promise<void> {
  const ruta = rutaDeImagen(ubicacion, tipo, slug);
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, "no es un webp de verdad, y para existir alcanza", "utf8");
}

/** El cuerpo de una ficha de prócer correcta. */
function fichaDeProcer(nombre: string): string {
  return `export default {
  nombre: ${JSON.stringify(nombre)},
  datos: {
    nombreCompleto: ${JSON.stringify(`${nombre} de ejemplo`)},
    anioDeNacimiento: 1770,
    anioDeMuerte: 1820,
    resumen: "Un resumen de ejemplo.",
    semblanza: "Una semblanza de ejemplo.",
    imagen: {
      textoAlternativo: "Un retrato de ejemplo.",
      credito: "Un crédito de ejemplo.",
      licencia: "dominio-publico",
    },
  },
};
`;
}

test("el tipo y el slug salen de la ruta del archivo, sin índice manual", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "juana-azurduy", fichaDeProcer("Juana Azurduy"));
  await escribirImagen(ubicacion, "procer", "juana-azurduy");

  const fichas = await leerContenidoCurado(ubicacion);

  expect(fichas).toHaveLength(1);
  expect(fichas[0]?.tipo).toBe("procer");
  expect(fichas[0]?.slug).toBe("juana-azurduy");
  expect(fichas[0]?.nombre).toBe("Juana Azurduy");
  expect(fichas[0]?.datos.anioDeNacimiento).toBe(1770);
});

test("una ficha que no cumple el descriptor es un problema que nombra el campo", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(
    ubicacion,
    "procer",
    "con-errata",
    fichaDeProcer("Con Errata").replace("anioDeNacimiento: 1770", "anioDeNacimiento: 17700"),
  );
  await escribirImagen(ubicacion, "procer", "con-errata");

  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  expect(fichas).toHaveLength(0);
  expect(problemas).toHaveLength(1);
  expect(problemas[0]).toContain("procer/con-errata");
  expect(problemas[0]).toContain("anioDeNacimiento");
});

test("falta la imagen derivada del tipo y del slug: es un problema y nombra la ruta", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "sin-imagen", fichaDeProcer("Sin Imagen"));

  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  // Los datos son válidos, así que la ficha se devuelve igual; lo que falta es
  // el archivo de al lado.
  expect(fichas).toHaveLength(1);
  expect(problemas).toEqual([
    "procer/sin-imagen: falta la imagen en `public/contenido/procer/sin-imagen.webp`.",
  ]);
});

test("un directorio que no es un tipo conocido es un problema", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "dinosaurio", "patagotitan", fichaDeProcer("Patagotitán"));

  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  expect(fichas).toHaveLength(0);
  expect(problemas).toEqual([
    "`contenido/dinosaurio` no es un tipo conocido: no tiene descriptor en el registro.",
  ]);
});

test("un slug que no sirve para una URL es un problema", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "Manuel Belgrano", fichaDeProcer("Manuel Belgrano"));

  const { problemas } = await revisarContenidoCurado(ubicacion);

  expect(problemas).toHaveLength(1);
  expect(problemas[0]).toContain("procer/Manuel Belgrano");
});

test("un `export default` que no es una ficha es un problema", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "sin-nombre", "export default { datos: {} };\n");
  await escribirImagen(ubicacion, "procer", "sin-nombre");

  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  expect(fichas).toHaveLength(0);
  expect(problemas[0]).toContain("procer/sin-nombre");
  expect(problemas[0]).toContain("nombre");
});

test("los archivos que empiezan con punto se ignoran", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "juana-azurduy", fichaDeProcer("Juana Azurduy"));
  await escribirImagen(ubicacion, "procer", "juana-azurduy");
  await writeFile(path.join(ubicacion.fichas, "procer", ".DS_Store"), "basura", "utf8");

  const { fichas, problemas } = await revisarContenidoCurado(ubicacion);

  expect(problemas).toEqual([]);
  expect(fichas).toHaveLength(1);
});

test("leerContenidoCurado lanza con todos los problemas y no devuelve nada a medias", async () => {
  const ubicacion = await armarContenido();
  await escribirFicha(ubicacion, "procer", "sin-imagen", fichaDeProcer("Sin Imagen"));
  await escribirFicha(ubicacion, "procer", "otra-sin-imagen", fichaDeProcer("Otra Sin Imagen"));

  await expect(leerContenidoCurado(ubicacion)).rejects.toThrow(/2 problema/);
});

test("un contenido vacío no es un problema, es una lista vacía", async () => {
  const ubicacion = await armarContenido();
  await mkdir(ubicacion.fichas, { recursive: true });

  await expect(leerContenidoCurado(ubicacion)).resolves.toEqual([]);
});
