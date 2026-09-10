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
 * Cada ficha del contenido curado tiene que validar contra el descriptor de su
 * tipo **y** tener su imagen en `public/contenido/<tipo>/<slug>.webp`.
 *
 * La ficha de ejemplo (`manuel-belgrano`) ya tiene un placeholder temporal en
 * esa ruta —un cuadrado sólido sin crédito real, puesto para poder verificar la
 * tubería de punta a punta— así que hoy no hay ningún problema pendiente. El
 * día que una ficha nueva entre sin su imagen, esta prueba lo va a señalar acá.
 */
test("cada ficha del contenido curado valida contra el descriptor de su tipo", async () => {
  const { fichas, problemas } = await revisarContenidoCurado(ubicacionEnElRepositorio);

  expect(problemas).toEqual([]);
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
