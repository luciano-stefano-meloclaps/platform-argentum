import { EstadisticasCatalogo } from "./estadisticas-catalogo.tsx";

/**
 * El hero de la home. Eyebrow (kicker), título, un divisor decorativo, la
 * bajada, y debajo la franja de estadísticas del catálogo.
 *
 * Franja `bg-celeste-50` de borde a borde: es el token que la marca
 * documenta explícitamente para "fondos de página, cabeceras suaves"
 * (`identidad-argentum`, tabla de celeste — `docs/marca/sistema-de-diseno.md`
 * §3), así que usarlo acá es consumir un token ya aprobado, no agregar uno
 * nuevo.
 *
 * El bloque de texto (kicker/título/separador/párrafo) se acota a un
 * wrapper propio de `max-w-[640px] mx-auto` — métrica exacta pedida por el
 * usuario, no un ancho de la escala de contenedor de la marca, así que va
 * como valor arbitrario de Tailwind en vez de forzar un token que no
 * corresponde (mismo criterio que ya se aplicó con `max-w-[760px]` en la
 * franja de cifras, más abajo). La franja de cifras vive **fuera** de ese
 * wrapper, con su propio ancho y centrado.
 *
 * Algunos tamaños de esta pantalla (52px/34px de título, 11px de kicker con
 * tracking 0.18em, 15px/1.8 de párrafo) no tienen un token equivalente en
 * `identidad-argentum` — la escala tipográfica de la marca no define esos
 * valores exactos. Como el usuario los fijó a nivel de píxel a propósito,
 * van como clases arbitrarias de Tailwind (`text-[Npx]`), consumiendo igual
 * las familias y los colores del tema (`font-titulo`, `font-cuerpo`,
 * `text-celeste-text`, `text-texto-titulo`, `text-texto-secundario`) en vez
 * de un hex a mano.
 *
 * Server Component: no hay estado ni interacción acá. La única isla de
 * cliente de esta pantalla vive dos niveles más abajo, en
 * `contador-estadistica.tsx`.
 *
 * Altura: la "caja azul" —esta misma `<section>` con `bg-celeste-50`, no
 * un wrapper interno— tiene que llegar exactamente al borde de la
 * pantalla, pegada al fondo, a pedido del usuario. Antes tenía su propio
 * `min-h-dvh`, pero el `<Header />` (ver `header.tsx`) se renderiza
 * *antes* que este componente, en `layout.tsx`: sumar un 100dvh propio acá
 * al alto del Header hacía que el conjunto pasara el 100% de la ventana y
 * la caja celeste terminara más abajo del borde, no pegada a él.
 *
 * La corrección vive en dos archivos: `layout.tsx` le pone `min-h-dvh
 * flex flex-col` al `<body>` (Header + Hero como conjunto), y acá el
 * `<section>` pasa de `min-h-dvh` a `flex-1` — dentro de esa columna
 * flex, `flex-1` hace que el Hero ocupe *todo el espacio que sobra*
 * después del alto natural del Header, ni un pixel más ni menos, sin
 * importar cuánto mida el Header. El resultado es el mismo de siempre en
 * una pantalla más alta que el contenido (el fondo celeste llena hasta el
 * borde) pero ahora sin sumar dos alturas de 100%.
 *
 * `flex flex-col` en el `<section>` (además de `flex-1`) sigue haciendo
 * falta: es lo que le da estructura de columna al wrapper interno de
 * abajo, que a su vez es `flex-1` *respecto de este `<section>`* — dos
 * niveles de flex anidados, no uno solo. No hay conflicto entre ambos
 * `flex-1`: el de acá reparte espacio contra el Header (nivel `<body>`),
 * el de adentro reparte espacio contra el `py-2xl` del wrapper (nivel
 * `<section>`).
 *
 * El contenido interno (bloque de texto + franja de cifras) se centra
 * verticalmente con `flex flex-col justify-center` en el wrapper que ya
 * existía (`mx-auto max-w-5xl px-lg py-2xl`): con contenido corto en una
 * pantalla alta, el texto y las cifras quedan a media altura de la caja
 * azul en vez de pegados arriba con un vacío enorme abajo. `py-2xl` sigue
 * dando aire mínimo contra los bordes superior/inferior de la sección
 * incluso cuando el contenido es más alto que `100dvh` y el centrado deja
 * de notarse.
 */
export function Hero() {
  return (
    <section className="flex flex-1 flex-col bg-celeste-50">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-lg py-2xl">
        <div className="mx-auto max-w-[640px] text-center">
          {/*
           * Kicker: EXCEPCIÓN puntual a la regla de `identidad-argentum`
           * ("kickers de sección" van en Cormorant Garamond, peso 600). Este
           * kicker del hero de home usa Lora (`font-cuerpo`) por decisión
           * explícita del usuario, no porque la regla general haya cambiado
           * para todo el sistema — ver la nota que deja el `brand-specialist`
           * en la skill. Peso `font-medium` (no `font-semibold`): en Lora,
           * semibold a 11px con este tracking se ve más pesado que el
           * semibold de Cormorant Garamond que reemplaza. Tamaño, tracking y
           * color sin cambios. Versalitas vía `uppercase`, no
           * `font-variant-caps` (mismo motivo que antes: no está confirmado
           * que la fuente traiga `smcp`).
           */}
          <p className="font-cuerpo text-[11px] leading-none font-medium tracking-[0.18em] text-celeste-text uppercase">
            Catálogo general · Edición 2026
          </p>

          {/*
           * Título: peso 400 explícito (no el 700 que trae `text-h1`/
           * `text-display` de la escala) — Cormorant Garamond en su peso
           * normal, no el que la marca reserva para H1–H3. Color de texto
           * normal (`--color-texto-titulo`), no el gradiente `.au`: ese
           * dorado es exclusivo de "ARGENTUM" y de las cifras destacadas,
           * no de este título.
           */}
          <h1 className="mt-lg text-[34px] leading-[1.08] font-titulo font-normal text-texto-titulo sm:text-[52px]">
            Todo lo que hace
            <br />
            a la Argentina
          </h1>

          {/*
           * Divisor decorativo: patrón "Rombo separador" de
           * `identidad-argentum` (v2/ADR 0015) — línea con `--color-accent`,
           * rombo 5px rotado 45° con **fondo** `--color-celeste-400` (no
           * borde), línea con `--color-accent`.
           */}
          <div aria-hidden="true" className="my-xl flex items-center justify-center gap-md">
            <span className="h-px w-[70px] bg-accent" />
            <span className="h-[5px] w-[5px] rotate-45 bg-celeste-400" />
            <span className="h-px w-[70px] bg-accent" />
          </div>

          <p className="font-cuerpo text-[15px] leading-[1.8] text-texto-secundario">
            Próceres, monumentos, paisajes, comidas, fechas y animales. Cada
            ficha se lee en dos minutos y vuelve después como tarjeta de
            repaso.
          </p>
        </div>

        <EstadisticasCatalogo />
      </div>
    </section>
  );
}
