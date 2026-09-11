import { obtenerEstadisticasCatalogo } from "./estadisticas-catalogo.datos.ts";
import { ContadorEstadistica } from "./contador-estadistica.tsx";

/**
 * La barra de tres bloques de estadísticas del hero (ticket #65): fichas
 * publicadas, tipos de entidad y tarjetas de repaso, cada uno con su número
 * animado al montar. "Bloque" y no "tarjeta": CONTEXT.md reserva **Tarjeta**
 * para la unidad de repaso (pregunta de un lado, respuesta del otro) — usar
 * la misma palabra acá para un elemento de UI distinto sería justo la
 * ambigüedad de vocabulario que el glosario del dominio pide evitar.
 *
 * `<dl>` semántico: cada bloque es un par término/definición (`dt` la
 * etiqueta, `dd` el valor), envuelto en un `div` — contenido válido de
 * `<dl>` en HTML5.
 *
 * Cada bloque tiene su propio fondo `bg-blanco` (mismo patrón que la
 * tarjeta de prócer del catálogo), así el número dorado
 * (`text-dorado-text`) nunca queda directamente sobre el celeste del hero:
 * dorado y celeste no conviven en la misma superficie, salvo la única
 * excepción ya documentada del dorso de la tarjeta de repaso (skill
 * `identidad-argentum`, regla 3). Contraste `--color-dorado-text` sobre
 * `--color-blanco`: ~4.78:1 (comentario de `globals.css`).
 *
 * Radio `rounded-lg` (no `rounded-xl`): `globals.css` documenta `--radius-lg`
 * (14px) explícitamente para "tarjetas de estadística" y reserva `--radius-xl`
 * (16px) para la tarjeta principal de contenido de una ficha.
 *
 * `tabular-nums` en el número: son tres cifras comparables en una fila y una
 * de ellas cambia de dígito en cada cuadro de la animación — sin figuras
 * tabulares, eso puede causar un microrreflow. Sin riesgo documentado acá:
 * la cifra usa `font-titulo` (Cormorant Garamond), no Lora, que es la única
 * familia con el no-op de `tabular-nums` señalado y sin resolver
 * (`identidad-argentum`, tabla de riesgo).
 *
 * Server Component: solo lee el mock y arma el marcado — la animación vive
 * en `ContadorEstadistica`, la única isla de cliente.
 */
export async function EstadisticasCatalogo() {
  const estadisticas = await obtenerEstadisticasCatalogo();

  return (
    <dl className="mt-2xl flex flex-col gap-md sm:flex-row lg:gap-lg">
      {estadisticas.map((estadistica) => (
        <div
          key={estadistica.id}
          className="min-w-0 flex-1 rounded-lg border border-borde-default bg-blanco p-lg shadow-sombra-sm lg:p-xl"
        >
          <dt className="font-cuerpo text-body text-texto-secundario">{estadistica.etiqueta}</dt>
          <dd className="mt-xs font-titulo text-h1 tabular-nums text-dorado-text sm:text-h2 lg:text-display">
            <ContadorEstadistica valor={estadistica.valor} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
