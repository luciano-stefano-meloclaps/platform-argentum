/**
 * Guarda del **destino** de los comandos que escriben en la base desde una
 * máquina: `contenido:importar` y `db:migrate` (ADR 0023, ticket #122).
 *
 * Función pura y sin red: decide, antes de abrir ninguna conexión, si se puede
 * escribir en la base que dice la cadena. Falla cerrada:
 *
 * 1. Un host local (`localhost`, `127.0.0.1`, `[::1]`) pasa sin más.
 * 2. Cualquier otro host se rechaza, salvo que la confirmación
 *    (`DB_CONFIRMAR_DESTINO`) valga **exactamente** ese host. Hay que nombrarlo
 *    a mano; no alcanza con un `true`.
 *
 * El sufijo `-pooler` del primer segmento se ignora, en el host y en la
 * confirmación: la cadena de la app y la de drizzle-kit apuntan al mismo
 * endpoint con nombres distintos y se confirman con el mismo valor.
 *
 * Del destino solo se informa el **host**: la cadena trae usuario y contraseña,
 * y ni el resultado ni los motivos la incluyen. Tampoco se propaga el mensaje
 * del `URL` que falla, porque cita la entrada.
 */

const HOSTS_LOCALES = ["localhost", "127.0.0.1", "[::1]"];

export type ResultadoDeLaGuarda =
  | { permitido: true; host: string }
  | { permitido: false; motivo: string };

/** Minúscula, sin espacios y sin `-pooler` en el primer segmento. */
function normalizar(host: string): string {
  return host.trim().toLowerCase().replace(/^([^.]*)-pooler(?=\.|$)/, "$1");
}

export function evaluarDestino(
  url: string | undefined,
  confirmacion: string | undefined,
): ResultadoDeLaGuarda {
  if (!url) {
    return { permitido: false, motivo: "falta la cadena de conexión del destino." };
  }

  let host: string;

  try {
    host = normalizar(new URL(url).hostname);
  } catch {
    return { permitido: false, motivo: "la cadena de conexión del destino no es válida." };
  }

  if (host === "") {
    return { permitido: false, motivo: "la cadena de conexión del destino no trae un host." };
  }

  if (HOSTS_LOCALES.includes(host) || normalizar(confirmacion ?? "") === host) {
    return { permitido: true, host };
  }

  return {
    permitido: false,
    motivo:
      `el host \`${host}\` no es local. ` +
      `Para escribir ahí a propósito, corré el comando con DB_CONFIRMAR_DESTINO=${host}.`,
  };
}
