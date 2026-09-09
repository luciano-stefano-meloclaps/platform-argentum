import { expect, test } from "vitest";

import { revisarContenidoCurado, ubicacionEnElRepositorio } from "./contenido.mts";

/**
 * Lectura funcional del `contenido/` **real** del repositorio: recorre el
 * directorio y verifica que cada ficha valide contra el descriptor de su tipo y
 * tenga su imagen.
 *
 * No es una prueba que Vitest descubra adentro de `contenido/` —el `include` de
 * `vitest.config.mts` sigue siendo solo `src/`—: es una prueba de `src/` que
 * lee el directorio de contenido a través de la misma interfaz que usa la
 * importación. Si una ficha se rompe, se entera acá y no en la importación.
 */

/**
 * Fichas cuya imagen todavía **no** entregó quien la aporta.
 *
 * El ADR 0009 puso el crédito y la licencia como campos obligatorios
 * justamente para que nadie tape este hueco con un archivo de relleno y una
 * licencia inventada. Así que el hueco se declara acá, con nombre y apellido,
 * en vez de aflojar la verificación.
 *
 * **Se vacía sola.** La lista se compara por igualdad exacta contra los
 * problemas encontrados: el día que aparezca el `.webp`, esta prueba falla y la
 * única forma de arreglarla es borrar la línea. Una lista de excepciones que no
 * caduca es una verificación apagada.
 */
const imagenesPendientes = [
  "procer/manuel-belgrano: falta la imagen en `public/contenido/procer/manuel-belgrano.webp`.",
];

test("cada ficha del contenido curado valida contra el descriptor de su tipo", async () => {
  const { fichas, problemas } = await revisarContenidoCurado(ubicacionEnElRepositorio);

  expect(problemas).toEqual(imagenesPendientes);
  expect(fichas.length).toBeGreaterThan(0);
});

test("el tipo y el slug de cada ficha salen de su ruta y no se repiten", async () => {
  const { fichas } = await revisarContenidoCurado(ubicacionEnElRepositorio);

  expect(fichas.map((ficha) => `${ficha.tipo}/${ficha.slug}`)).toEqual([
    "procer/manuel-belgrano",
  ]);
});

test("la ficha de ejemplo trae los campos con los que se arma la ficha en pantalla", async () => {
  const { fichas } = await revisarContenidoCurado(ubicacionEnElRepositorio);
  const belgrano = fichas.find((ficha) => ficha.slug === "manuel-belgrano");

  expect(belgrano?.nombre).toBe("Manuel Belgrano");
  // Que estas líneas compilen es parte de lo que se prueba: si `datos` fuera
  // `unknown`, no compilarían.
  expect(belgrano?.datos.anioDeNacimiento).toBe(1770);
  expect(belgrano?.datos.imagen.licencia).toBe("dominio-publico");
});
