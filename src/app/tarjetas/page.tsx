import type { Metadata } from "next";

import { FranjaDeDatos } from "./franja-de-datos.tsx";
import { obtenerMazoDeRepaso } from "./tarjetas-repaso.datos.ts";
import { TarjetasRepaso } from "./tarjetas-repaso.tsx";

/**
 * La pantalla "Tarjetas" (ticket #91): repaso tipo flashcard contra el mock
 * de `tarjetas-repaso.datos.ts`. Presentación pura, sin conexión a ningún
 * módulo ni a la base — el enchufe real queda para cuando se resuelva la
 * nota de revisión #92.
 *
 * Server Component: lee el mock, le pasa al Client Component (la carta y su
 * estado) lo que necesita y renderiza acá lo estático —la franja de datos—
 * como `children`. Los
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

  return (
    <TarjetasRepaso mazoNombre={mazo.nombre} tarjetas={mazo.tarjetas}>
      <FranjaDeDatos stats={mazo.stats} totalDeTarjetas={mazo.tarjetas.length} />
    </TarjetasRepaso>
  );
}
