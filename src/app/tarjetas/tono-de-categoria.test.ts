import { describe, expect, it } from "vitest";

import { CATEGORIAS_CONOCIDAS, TONO_NEUTRO, tonoDeCategoria } from "./tono-de-categoria.ts";

describe("tonoDeCategoria", () => {
  it("resuelve cada categoría conocida a su propio token, con borde, fondo y texto", () => {
    expect(CATEGORIAS_CONOCIDAS).toHaveLength(6);
    const vistos = new Set<string>();
    for (const categoria of CATEGORIAS_CONOCIDAS) {
      const tono = tonoDeCategoria(categoria);
      expect(tono).not.toBe(TONO_NEUTRO);
      expect(tono).toMatch(/border-cat-\S+-text bg-cat-\S+-bg text-cat-\S+-text/);
      vistos.add(tono);
    }
    expect(vistos.size).toBe(6);
  });

  it("cae al neutro con una categoría desconocida, vacía o heredada de Object", () => {
    for (const categoria of ["Deportes", "", "toString", "__proto__"]) {
      expect(tonoDeCategoria(categoria)).toBe(TONO_NEUTRO);
    }
  });
});
