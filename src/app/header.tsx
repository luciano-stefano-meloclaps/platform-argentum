import { obtenerSesion } from "../identidad/identidad.ts";
import { cerrarSesionDesdeNav } from "./header.acciones.ts";
import { NavPrincipal } from "./nav-principal.tsx";

/**
 * El header institucional de la aplicación (expansión de alcance pedida por
 * el usuario en esta conversación, fuera del ticket #65 —que dejó el header
 * explícitamente afuera— y sin ticket propio todavía: no se commitea acá,
 * queda en el árbol para que el usuario decida cómo lo mete al historial).
 *
 * Vive en `layout.tsx`, no en `page.tsx`: es sitewide, no exclusivo de la
 * home — aparece igual en `/catalogo` y en la ficha de cada prócer.
 *
 * Estructura y tokens, todos citados de `identidad-argentum` (v2, ADR 0015)
 * y de lo que el `brand-specialist` acaba de cablear en `globals.css` para
 * este pedido:
 *
 * - Cinta tricolor (`h-10` = 40px): gradiente de tres bandas
 *   celeste-cinta/blanco/celeste-cinta. `--color-celeste-cinta` es un token
 *   puntual, exclusivo de este uso — no un peldaño más de la escala celeste
 *   de v1 — y decorativo: sin texto encima, así que no hace falta contraste
 *   medido. Borde inferior 1px con `--color-accent`, igual que documenta la
 *   marca.
 * - Filete dorado de 3px debajo: clase `.filete-dorado` (`globals.css`),
 *   con la misma receta de brillo animado que `.au` y `.shiny` —
 *   `@keyframes shinySweep`, sincronizada entre los tres. Antes era un
 *   gradiente estático con `--gradiente-filete`; se unificó a pedido
 *   explícito del usuario porque el filete y `.au` compartían color con
 *   `.shiny` pero no su animación, y por eso se percibían "distintos".
 * - Logotipo "ARGENTUM": clase `.au` (gradiente metálico de texto, ahora con
 *   la misma banda de brillo animada que `.shiny` — antes era estático).
 *   Sus stops de base son, desde un pedido explícito del usuario en esta
 *   conversación, los mismos 5 del filete dorado de arriba (no ya los 7 que
 *   había fijado el ADR 0015) — ver `globals.css` e `identidad-argentum`
 *   §1/§3 para el detalle y la deuda de contraste que acepta. El tamaño
 *   (56px, subido de 38px → 50px → 56px en pedidos sucesivos del usuario),
 *   el tracking (0.34em) y el
 *   `text-indent` que lo compensa son valores puntuales de este único
 *   logotipo, no la escala tipográfica — mismo criterio que los `h-[92px]`/
 *   `border-b-[3px]` ya presentes en `catalogo/page.tsx`. El tracking y el
 *   indent están en `em`, así que escalan solos con el tamaño de fuente y
 *   el logotipo sigue centrado.
 * - Espacio superior del bloque del logotipo: el contenedor separaba
 *   `px-lg py-xl` (22px arriba y abajo). A pedido del usuario se sumó más
 *   aire específicamente **arriba**, entre el filete dorado y "ARGENTUM",
 *   sin tocar el espacio de abajo (que ya cierra el bloque contra el nav):
 *   `pt-2xl` (32px) reemplaza al `py-xl` de arriba, `pb-xl` (22px) se
 *   mantiene abajo. Los dos son tokens de `--spacing-*` ya existentes, no
 *   valores sueltos nuevos.
 * - Los tres tramos verticales internos del bloque —logotipo → subtítulo,
 *   subtítulo → separador, separador → nav— subieron un escalón más en la
 *   escala de espaciado a pedido del usuario: los tres estaban en `mt-lg`
 *   (16px) y pasan a `mt-xl` (22px). El tercero vive en `NavPrincipal`
 *   (`nav-principal.tsx`), no acá, pero es el mismo escalón.
 * - Segundo pedido de más aire, esta vez puntual entre el subtítulo y el
 *   nav de abajo (no los tres tramos parejo): el tramo subtítulo →
 *   separador sube un escalón más, de `mt-xl` (22px) a `mt-2xl` (32px), en
 *   el `<div>` del separador de abajo. El tramo separador → nav
 *   (`NavPrincipal`) no se toca en este pedido — sigue en `mt-xl`. No hay
 *   un token entre `xl` (22px) y `2xl` (32px) en la escala de
 *   `--spacing-*` (`globals.css`), así que "un escalón más" es literal:
 *   el próximo peldaño de la lista, no un valor intermedio inventado.
 * - Subtítulo "conocé tu país" y el ítem activo/hover del nav usan
 *   `--color-celeste-text` sobre `--color-crema` (el fondo real del header,
 *   no `--celeste-50`): 6.12:1, medido y aprobado por el `brand-specialist`
 *   a pedido de una auditoría de `ui-reviewer` — pasa AA en los dos tamaños
 *   en juego (13px y 11px). Ya está asentado en la tabla de contraste de
 *   `identidad-argentum`, sección 3.
 * - Subtítulo "conocé tu país": el diseño original lo pide en itálica, pero
 *   `layout.tsx` carga Lora sin el estilo itálico a propósito ("la escala
 *   tipográfica no la usa en ningún componente", comentario del ADR 0008
 *   corrección 5) — cargar un estilo nuevo de fuente es una decisión de
 *   marca, no mía. Lo resolví sin itálica, con tracking y tamaño para
 *   diferenciarlo del logotipo; ver la pregunta al `brand-specialist` en el
 *   resumen final si de verdad hace falta la itálica.
 * - Separador ornamental: línea dorada (`--color-accent`) — rombo 6x6px
 *   rotado 45° con borde `--color-celeste-400` — línea dorada
 *   (`--color-accent`), las dos iguales. La segunda línea había quedado con
 *   `--color-arena-borde-suave` por error (bug, no de gusto: la regla es que
 *   las dos líneas del separador son del mismo dorado, solo el rombo central
 *   es celeste) y se corrigió a pedido del usuario. Decorativo, `aria-hidden`.
 * - Nav: `NavPrincipal`, la única isla de cliente de este componente.
 * - Skip link a `#contenido`: con el header ahora sitewide, cualquier
 *   pantalla con `<nav>` antes del contenido obliga a un usuario de teclado
 *   a tabular por los dos links del nav antes de llegar a lo que vino a
 *   leer. `guidelines.md` de `revision-de-ui` lo pide explícitamente
 *   ("include skip link for main content"). Cada página expone `id="contenido"`
 *   en su `<main>` para que el ancla tenga destino.
 *
 * Server Component, ahora `async` (ticket #114, ADR 0019): el resto del
 * marcado sigue siendo estático, pero necesita `obtenerSesion()` — async y
 * server-only (`src/identidad/identidad.ts`) — para saber si hay una sesión
 * activa y decidir qué muestra `NavPrincipal` en el ítem que hoy es
 * "Ingresar"/"Salir". Es la señal visible de estado que pide el ticket: no
 * se rediseña la navegación, se le pasa el dato que le faltaba al único
 * ítem que ya distinguía ese caso (antes un botón inerte sin ruta).
 * `cerrarSesionDesdeNav` (`./header.acciones.ts`) viaja como prop, mismo
 * patrón que la Server Action de un formulario: es serializable de servidor
 * a cliente aunque `NavPrincipal` sea un Client Component.
 */
export async function Header() {
  const sesion = await obtenerSesion();

  return (
    <header className="border-b border-arena-borde-suave bg-crema">
      {/*
       * Visualmente oculto hasta que recibe foco por teclado (`sr-only` +
       * `focus:not-sr-only`), como cualquier skip link estándar: no debe
       * ocupar espacio ni verse para quien navega con mouse o táctil.
       */}
      <a
        href="#contenido"
        className="sr-only rounded-sm bg-celeste-700 px-lg py-sm font-cuerpo text-button text-texto-sobre-celeste focus:not-sr-only focus:absolute focus:left-lg focus:top-lg focus:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-900"
      >
        Saltar al contenido
      </a>
      {/* Cinta tricolor: puramente decorativa, no compite con el logotipo ni el nav por la atención de un lector de pantalla. */}
      <div
        aria-hidden="true"
        className="h-10 border-b border-accent"
        style={{
          background:
            "linear-gradient(180deg, var(--color-celeste-cinta) 0 33.3%, var(--color-blanco) 33.3% 66.6%, var(--color-celeste-cinta) 66.6% 100%)",
        }}
      />

      {/*
       * Filete dorado, 3px, con la misma receta de brillo animado que
       * `.au` (logotipo, abajo) y `.shiny` (cifras del hero) —
       * `.filete-dorado`, definida en `globals.css` junto a `@keyframes
       * shinySweep`. Antes era un gradiente estático (`style` inline con
       * `var(--gradiente-filete)`); ahora usa la clase para heredar la
       * banda de brillo animada y el mismo `prefers-reduced-motion`.
       */}
      <div aria-hidden="true" className="h-[3px] filete-dorado" />

      <div className="mx-auto max-w-5xl px-lg pt-2xl pb-xl text-center">
        <p className="au font-titulo font-normal text-[56px] leading-none tracking-[0.34em] indent-[0.34em]">ARGENTUM</p>

        <p className="mt-xl font-cuerpo text-caption uppercase tracking-[0.1em] text-celeste-text">conocé tu país</p>

        <div aria-hidden="true" className="mx-auto mt-2xl flex max-w-40 items-center gap-sm">
          <span className="h-px flex-1 bg-accent" />
          <span className="h-[6px] w-[6px] rotate-45 border border-celeste-400" />
          <span className="h-px flex-1 bg-accent" />
        </div>

        <NavPrincipal sesionActiva={sesion !== undefined} cerrarSesion={cerrarSesionDesdeNav} />
      </div>
    </header>
  );
}
