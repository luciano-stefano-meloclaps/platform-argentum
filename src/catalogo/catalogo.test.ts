import { randomUUID } from "node:crypto";

import { eq, like } from "drizzle-orm";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { DatosDe } from "./descriptores/registro.ts";

/**
 * Pruebas de las tres funciones del módulo `catalogo` (ADR 0002, ticket #31)
 * contra la base de PostgreSQL de desarrollo (`docker compose up -d`).
 *
 * **`server-only` mockeado, y solo acá.** El módulo (y `../db/cliente.ts`, que
 * usa por dentro) empiezan con `import "server-only"`, que fuera de la
 * condición `react-server` de Next resuelve a un `throw` (ADR 0011) — ni
 * `node` ni Vitest la satisfacen. Este archivo es exactamente el caso legítimo
 * que esa guarda no contempla: ejercitar el módulo desde una prueba, no desde
 * un componente de cliente. El mock no debilita la regla de límite del
 * ADR 0002 — nada más importa `catalogo.ts` sin pasar por Next — y `pnpm build`
 * sigue siendo la verificación real del límite servidor/cliente.
 */
vi.mock("server-only", () => ({}));

/**
 * `vitest run` no pasa por `--env-file-if-exists=.env` como sí hacen
 * `db:ping` y `contenido:importar` (`package.json`), y Vitest solo autocarga
 * de `.env` las variables con prefijo `VITE_`. Sin esto, `DATABASE_URL` no
 * llega y `../db/cliente.ts` lanza al construir el cliente. Mismo mecanismo
 * que los scripts de arriba (`process.loadEnvFile`, Node ≥ 20.6): si no hay
 * `.env` se asume que `DATABASE_URL` ya está en el entorno (CI).
 */
try {
  process.loadEnvFile();
} catch {
  // Sin `.env`: `DATABASE_URL` tiene que venir ya seteada.
}

/**
 * Importados dinámicamente y **después** de `loadEnvFile()`: un import
 * estático de `../db/cliente.ts` se resuelve antes que cualquier otra línea de
 * este archivo (los imports de un módulo ES se ejecutan antes que su propio
 * cuerpo, sin importar en qué línea están escritos), así que `DATABASE_URL`
 * todavía no estaría seteada cuando el cliente se construye.
 */
const { db } = await import("../db/cliente.ts");
const { entidad } = await import("../db/esquema.ts");
const { listarPorTipo, listarSlugs, obtenerPorSlug } = await import("./catalogo.ts");

/** Un prócer válido contra el descriptor, para no depender del contenido real. */
function datosDeProcerDePrueba(sufijo: string): DatosDe<"procer"> {
  return {
    nombreCompleto: `Prócer de prueba ${sufijo}`,
    anioDeNacimiento: 1800,
    resumen: `Ficha creada solo para la prueba ${sufijo}.`,
    semblanza: `Semblanza de prueba para el caso ${sufijo}, sin valor histórico.`,
    imagen: {
      textoAlternativo: "Ilustración de prueba.",
      credito: "Prueba automatizada.",
      licencia: "dominio-publico",
    },
  };
}

describe("catalogo", () => {
  // Prefijo único por corrida: separa los datos de esta prueba de cualquier
  // otro contenido que ya viva en la base (incluida la ficha real de
  // Belgrano) sin tener que vaciar la tabla.
  const prefijo = `zzz-prueba-catalogo-${randomUUID()}`;

  afterEach(async () => {
    await db.delete(entidad).where(like(entidad.slug, `${prefijo}%`));
  });

  test("listarPorTipo devuelve las entidades de ese tipo, con `datos` validado contra su descriptor", async () => {
    const slug = `${prefijo}-listar-a`;
    const datos = datosDeProcerDePrueba("listar-a");

    await db.insert(entidad).values({ tipo: "procer", slug, nombre: "Prueba, listar A", datos });

    const resultado = await listarPorTipo("procer");
    const propia = resultado.find((fila) => fila.slug === slug);

    expect(propia).toBeDefined();
    // Que esto compile es parte de lo que se prueba: si `datos` no estuviera
    // estrechado a `DatosDe<"procer">`, `nombreCompleto` no existiría en el
    // tipo.
    expect(propia?.datos.nombreCompleto).toBe(datos.nombreCompleto);
    expect(propia?.tipo).toBe("procer");
  });

  test("listarPorTipo de un tipo sin entidades devuelve una lista vacía, no un error", async () => {
    // "procer" es hoy el único tipo del registro, así que probar el caso vacío
    // exige vaciarlo de verdad: se respalda lo que hay y se restaura al
    // terminar, para no perder contenido real (p. ej. la ficha de Belgrano).
    const respaldo = await db.select().from(entidad).where(eq(entidad.tipo, "procer"));

    await db.delete(entidad).where(eq(entidad.tipo, "procer"));

    try {
      await expect(listarPorTipo("procer")).resolves.toEqual([]);
    } finally {
      if (respaldo.length > 0) {
        await db.insert(entidad).values(respaldo);
      }
    }
  });

  test("obtenerPorSlug devuelve la entidad con ese slug", async () => {
    const slug = `${prefijo}-obtener-b`;
    const datos = datosDeProcerDePrueba("obtener-b");

    await db.insert(entidad).values({ tipo: "procer", slug, nombre: "Prueba, obtener B", datos });

    const resultado = await obtenerPorSlug(slug);

    expect(resultado?.slug).toBe(slug);
    expect(resultado?.tipo).toBe("procer");
    if (resultado?.tipo === "procer") {
      expect(resultado.datos.nombreCompleto).toBe(datos.nombreCompleto);
    }
  });

  test("obtenerPorSlug de un slug inexistente devuelve undefined y no lanza", async () => {
    await expect(obtenerPorSlug(`${prefijo}-no-existe`)).resolves.toBeUndefined();
  });

  test("obtenerPorSlug de una fila con un tipo sin descriptor la trata como inexistente", async () => {
    // Invariante documentado en `catalogo.ts`: una fila de un tipo que ya no
    // tiene descriptor en el registro no rompe, se comporta como "no
    // encontrada". `datos` puede seguir teniendo cualquier forma válida de
    // `Datos` — lo que hace que la fila sea "desconocida" es solo el `tipo`.
    const slug = `${prefijo}-tipo-desconocido`;

    await db.insert(entidad).values({
      tipo: `${prefijo}-tipo-que-no-existe`,
      slug,
      nombre: "Prueba, tipo desconocido",
      datos: datosDeProcerDePrueba("tipo-desconocido"),
    });

    await expect(obtenerPorSlug(slug)).resolves.toBeUndefined();
  });

  test("listarSlugs devuelve los slugs de todas las entidades, de cualquier tipo", async () => {
    const slug = `${prefijo}-slugs-c`;

    await db
      .insert(entidad)
      .values({ tipo: "procer", slug, nombre: "Prueba, slugs C", datos: datosDeProcerDePrueba("slugs-c") });

    const slugs = await listarSlugs();

    expect(slugs).toContain(slug);
  });
});
