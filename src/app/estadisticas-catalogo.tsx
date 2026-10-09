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
 * `<dl>` semántico: cada columna es un par etiqueta/valor, con el `<dt>`
 * antes que su `<dd>` en el marcado, que es el orden en que un lector de
 * pantalla lo anuncia: primero la etiqueta, después su cifra. La spec del
 * usuario pide el número arriba y la etiqueta abajo: eso lo resuelve solo
 * la presentación, con la columna en `flex-col` y `order-first` en el
 * `<dd>`. Cambió el orden del marcado, no lo que se ve.
 *
 * El número es texto que se lee, así que va en dorado AA **sólido y sin
 * brillo** (ADR 0028 §2): `text-accent-700` (`--color-accent-700`,
 * `#94691A`), 4.89:1 sobre el `bg-blanco` del `<dl>`, que es su fondo real.
 * El umbral es 4.5:1 aunque la cifra mida 38px: Cormorant Garamond a peso
 * 400 tiene trazos finos, y el producto se usa en pantallas de bajo brillo
 * (ADR 0008). El dorado brillante con banda (`.au`) es ornamento y no va
 * acá.
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
        <div
          key={estadistica.id}
          className="flex min-w-0 flex-1 flex-col border-l border-celeste-150 px-[10px] py-[20px] text-center"
        >
          <dt className="mt-sm font-cuerpo text-[10px] tracking-[0.16em] text-texto-terciario uppercase">
            {estadistica.etiqueta}
          </dt>
          <dd className="order-first font-titulo font-normal text-[38px] leading-none text-accent-700 tabular-nums lining-nums">
            <ContadorEstadistica valor={estadistica.valor} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
