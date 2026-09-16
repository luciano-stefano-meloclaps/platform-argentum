import type { Metadata } from "next";

import { obtenerMazoDeRepaso } from "./tarjetas-repaso.datos.ts";
import { TarjetasRepaso } from "./tarjetas-repaso.tsx";

/**
 * La pantalla "Tarjetas" (ticket #91): repaso tipo flashcard contra el mock
 * de `tarjetas-repaso.datos.ts`. Presentación pura, sin conexión a ningún
 * módulo ni a la base — el enchufe real queda para cuando se resuelva la
 * nota de revisión #92.
 *
 * Server Component: solo lee el mock y se lo pasa al Client Component. Los
 * callbacks (`onResponder`, `onAbrirFicha`) no se pasan a propósito —un
 * Server Component no puede pasarle una función de cliente a un hijo, mismo
 * motivo por el que `ficha/page.tsx` tampoco pasa sus tres acciones—;
 * `TarjetasRepaso` cae a su registro en consola cuando faltan.
 */

export const metadata: Metadata = {
  title: "Tarjetas | Argentum",
};

export default async function PaginaDeTarjetas() {
  const mazo = await obtenerMazoDeRepaso();

  return <TarjetasRepaso mazoNombre={mazo.nombre} tarjetas={mazo.tarjetas} stats={mazo.stats} />;
}
