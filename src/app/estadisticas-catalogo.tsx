import { obtenerEstadisticasCatalogo } from "./estadisticas-catalogo.datos.ts";
import { ContadorEstadistica } from "./contador-estadistica.tsx";

/**
 * La franja de cifras del hero: fichas publicadas, tipos de entidad y
 * tarjetas de repaso, cada una con su número animado al montar. "Bloque" y
 * no "tarjeta": CONTEXT.md reserva **Tarjeta** para la unidad de repaso
 * (pregunta de un lado, respuesta del otro) — usar la misma palabra acá
 * para un elemento de UI distinto sería justo la ambigüedad de vocabulario
 * que el glosario del dominio pide evitar.
 *
 * Los tres valores siguen viniendo de `estadisticas-catalogo.datos.ts`
 * (fichas publicadas / tipos de entidad / tarjetas de repaso): ya es una
 * fuente de datos real —mockeada, pero con la firma de la consulta que algún
 * día vive en el módulo `catalogo`—, así que no se reemplaza por otro
 * conjunto de cifras de ejemplo inventado para esta pasada.
 *
 * Layout: **una sola fila de columnas separadas por líneas verticales**, no
 * tarjetas independientes. El contenedor lleva el borde superior/inferior y
 * el fondo blanco; cada columna solo aporta su borde izquierdo (incluida la
 * primera) — sin `radius`, sin sombra ni fondo propio, para no volver a la
 * apariencia de tarjeta que se quería sacar.
 *
 * `<dl>` semántico: cada columna es un par valor/etiqueta. Achica la
 * distancia con la spec del usuario (número arriba, etiqueta abajo)
 * ordenando `dd` antes que `dt` en el marcado — sigue siendo un `<dl>`
 * válido, `dt`/`dd` no exigen ese orden.
 *
 * El número usa `.shiny` (dorado institucional v2, ADR 0015 + extensión):
 * el mismo gradiente metálico de texto que `.au`, con un brillo animado que
 * lo cruza cada 3.4s — pensado explícitamente para "cifras destacadas" según
 * la tabla de tipografía de `identidad-argentum`. `.shiny` respeta
 * `prefers-reduced-motion: reduce` (congela el brillo, conserva el
 * gradiente dorado) — verificado en `globals.css`, regla 9 de
 * `identidad-argentum`.
 *
 * `tabular-nums lining-nums` en el número: cifras comparables en una fila
 * que cambian de dígito en cada cuadro de la animación — sin figuras
 * tabulares eso puede causar un microrreflow. Sin riesgo documentado: la
 * cifra usa `font-titulo` (Cormorant Garamond), no Lora, que es la única
 * familia con el no-op de `tabular-nums` señalado y sin resolver
 * (`identidad-argentum`, tabla de riesgo).
 *
 * `max-w-[760px]` y los `20px`/`10px` de relleno de columna son métricas
 * exactas pedidas por el usuario, sin token equivalente en la escala de la
 * marca — van como valores arbitrarios de Tailwind, no como un token forzado
 * a un número que no le corresponde.
 *
 * Server Component: solo lee el mock y arma el marcado — la animación vive
 * en `ContadorEstadistica`, la única isla de cliente.
 */
export async function EstadisticasCatalogo() {
  const estadisticas = await obtenerEstadisticasCatalogo();

  return (
    <dl className="mx-auto mt-[44px] flex max-w-[760px] justify-center border-y border-celeste-150 bg-blanco">
      {estadisticas.map((estadistica) => (
        <div key={estadistica.id} className="min-w-0 flex-1 border-l border-celeste-150 px-[10px] py-[20px] text-center">
          <dd className="shiny font-titulo font-normal text-[38px] leading-none tabular-nums lining-nums">
            <ContadorEstadistica valor={estadistica.valor} />
          </dd>
          <dt className="mt-sm font-cuerpo text-[10px] tracking-[0.16em] text-texto-terciario uppercase">
            {estadistica.etiqueta}
          </dt>
        </div>
      ))}
    </dl>
  );
}
