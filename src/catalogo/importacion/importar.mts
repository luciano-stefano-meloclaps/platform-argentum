import { drizzle } from "drizzle-orm/node-postgres";

import { entidad } from "../../db/esquema.ts";
import { evaluarDestino } from "../../db/guarda-de-destino.mts";
import {
  leerContenidoCurado,
  ubicacionEnElRepositorio,
  type FichaCurada,
} from "./contenido.mts";

/**
 * Comando de importación del **contenido curado**: lleva las fichas de
 * `contenido/` a PostgreSQL, que es de donde las lee la aplicación (ADR 0004).
 *
 * Se puede correr dos veces seguidas: cada ficha se escribe con
 * `ON CONFLICT (slug) DO UPDATE`, apoyado en la restricción
 * `entidad_slug_unico` del esquema. La segunda corrida deja la misma cantidad
 * de filas y los mismos datos; corregir una ficha y volver a importar actualiza
 * la fila que ya existe.
 *
 * **Orden de operaciones, y no es casual:** primero se lee y se valida todo el
 * contenido, y recién después se abre la conexión. Una ficha inválida voltea el
 * comando **sin escribir nada**.
 *
 * **Una transacción por ficha.** Es una decisión del usuario, tomada sabiendo
 * que el backend recomendaba una sola transacción para toda la importación. La
 * consecuencia asumida: si la escritura falla a mitad de camino, las fichas ya
 * escritas quedan escritas y la base queda con una parte del contenido nuevo y
 * otra del viejo. Como la importación es idempotente, la reparación es volver a
 * correrla.
 *
 * Este archivo no importa `src/db/cliente.ts`, igual que `src/db/ping.mts` y
 * por el mismo motivo: aquel empieza con `import "server-only"`, que fuera del
 * empaquetador de Next lanza. La conexión se arma acá con el mismo driver.
 *
 * El diagnóstico de una falla de conexión está duplicado de `src/db/ping.mts` a
 * propósito: extraerlo a un módulo compartido es el ticket #48, cuando existan
 * los dos llamadores reales que hoy recién nacen.
 */

function fallar(mensaje: string): never {
  console.error(`contenido:importar — ${mensaje}`);
  process.exit(1);
}

/**
 * Del error se informa el **código** y no el mensaje: el mensaje de una falla de
 * autenticación de PostgreSQL trae adentro el usuario, y el de una URL mal
 * formada trae la cadena entera. Se recorre la cadena de causas porque Drizzle
 * envuelve el error del driver en uno propio.
 */
function describirFalla(error: unknown): string {
  let actual: unknown = error;

  while (actual instanceof Error) {
    const codigo = (actual as Error & { code?: unknown }).code;

    if (typeof codigo === "string") {
      return codigo === "ECONNREFUSED"
        ? "ECONNREFUSED: no hay nadie escuchando. ¿Levantaste `docker compose up -d`?"
        : codigo;
    }

    actual = actual.cause;
  }

  return "sin código";
}

/** Host, puerto y base del destino. Nunca la cadena, que trae credenciales. */
function describirDestino(url: string): string {
  try {
    const partes = new URL(url);
    return `${partes.hostname}:${partes.port || "5432"}${partes.pathname}`;
  } catch {
    return fallar("DATABASE_URL no es una cadena de conexión válida.");
  }
}

async function main(): Promise<void> {
  let fichas: FichaCurada[];

  try {
    fichas = await leerContenidoCurado(ubicacionEnElRepositorio);
  } catch (error) {
    return fallar(
      `el contenido curado no está listo, no se escribió nada.\n\n${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (fichas.length === 0) {
    return fallar("no hay ninguna ficha en `contenido/`. No hay nada que importar.");
  }

  // La guarda corre antes de abrir la conexión (ticket #122): decide con
  // el host, sin red, y solo informa el host.
  const guarda = evaluarDestino(process.env.DATABASE_URL, process.env.DB_CONFIRMAR_DESTINO);

  if (!guarda.permitido) {
    return fallar(`${guarda.motivo} No se escribió nada.`);
  }

  const url = process.env.DATABASE_URL;

  if (!url) {
    return fallar("falta la variable de entorno DATABASE_URL.");
  }

  const destino = describirDestino(url);
  const db = drizzle({
    connection: {
      connectionString: url,
      // Sin esto, una base que no responde deja el comando colgado en vez de
      // fallar.
      connectionTimeoutMillis: 5_000,
    },
  });

  console.log(`contenido:importar — ${fichas.length} ficha(s) validada(s), escribiendo en ${destino}.`);

  let escritas = 0;

  try {
    for (const ficha of fichas) {
      try {
        // Una transacción por ficha (decisión del usuario). Con una sola
        // sentencia adentro la transacción es redundante para PostgreSQL; se
        // escribe explícita porque el límite es la decisión, no el rendimiento,
        // y porque la sentencia de al lado se agrega sin volver a pensarla.
        await db.transaction(async (tx) => {
          await tx
            .insert(entidad)
            .values({
              tipo: ficha.tipo,
              slug: ficha.slug,
              nombre: ficha.nombre,
              datos: ficha.datos,
            })
            // La idempotencia. `entidad_slug_unico` es lo que le da a
            // `ON CONFLICT (slug)` sobre qué apoyarse; sin ella esto duplicaría
            // el catálogo en cada corrida. `slug` no se actualiza: es la
            // columna del conflicto y ya vale lo mismo.
            .onConflictDoUpdate({
              target: entidad.slug,
              set: { tipo: ficha.tipo, nombre: ficha.nombre, datos: ficha.datos },
            });
        });

        escritas += 1;
      } catch (error) {
        // Fallar acá y no seguir: una escritura que falla es un defecto —el
        // esquema no coincide, la conexión se cayó—, no una ficha más que
        // reintentar. Las `escritas` que ya entraron quedan escritas, que es
        // exactamente lo que significa una transacción por ficha.
        fallar(
          `falló al escribir \`${ficha.tipo}/${ficha.slug}\` (${describirFalla(error)}). ` +
            `Quedaron ${escritas} ficha(s) escrita(s); volvé a correr el comando después de arreglarlo.`,
        );
      }
    }

    console.log(`contenido:importar — ${escritas} ficha(s) escrita(s) en ${destino}.`);
  } finally {
    await db.$client.end();
  }
}

await main();
