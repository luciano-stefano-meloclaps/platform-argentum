"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Los 12 ítems de la Nav/TabsBar de tipografía pura (ticket #82), en el
 * orden exacto que pide el ticket. Hoy hay pantalla real para "Explorar"
 * (`/`, `src/app/page.tsx`), "Ficha" (`/ficha`, `src/app/ficha/page.tsx`) e
 * "Índice" (`/catalogo`, `src/app/catalogo/page.tsx`) — el resto
 * ("Mi progreso", "Propuestas", "Proponer", "Resultado", "Perfil",
 * "Usuarios", "Ingresar") no tiene ruta ni pantalla todavía: sin `href`, se
 * renderizan como `<button type="button">` inertes, nunca como `<a>`/`<Link>`
 * que resolvería en 404 — mismo criterio que ya documentaba el
 * `NavPrincipal` viejo. "Tarjetas" pasó a tener ruta real en el ticket #91
 * (`/tarjetas`, `src/app/tarjetas/page.tsx`) y "Quiz" en el ticket #94
 * (`/quiz`, `src/app/quiz/page.tsx`); ambas se renderizan como link, igual
 * que "Explorar", "Ficha" e "Índice".
 */
const ITEMS = [
  { etiqueta: "Explorar", href: "/" },
  { etiqueta: "Ficha", href: "/ficha" },
  { etiqueta: "Tarjetas", href: "/tarjetas" },
  { etiqueta: "Quiz", href: "/quiz" },
  { etiqueta: "Mi progreso" },
  { etiqueta: "Propuestas" },
  { etiqueta: "Índice", href: "/catalogo" },
  { etiqueta: "Proponer" },
  { etiqueta: "Resultado" },
  { etiqueta: "Perfil" },
  { etiqueta: "Usuarios" },
  { etiqueta: "Ingresar" },
] as const;

/**
 * Devuelve si `href` es la sección activa para `pathname`. "/" solo se
 * considera activo con match exacto (si no, marcaría cualquier ruta como
 * "Explorar" activo); el resto, exacto o como prefijo de una ruta hija —
 * `/catalogo/manuel-belgrano` también marca "Índice" como activo.
 */
function esActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Clases compartidas por todo ítem, sea link real o botón inerte —
 * tipografía pura del ticket #82, sin pill ni fondo detrás del activo, sin
 * ícono, sin badge, sin sombra. `font-cuerpo` es Lora (`--font-body` del
 * ticket): el nav es UI, nunca `font-titulo` (Cormorant Garamond, reservada
 * a titulación). `text-[10px]` y `tracking-[0.14em]` no tienen token en la
 * escala existente — mismo criterio documentado en `header.tsx` para los
 * `text-[56px]`/`tracking-[0.34em]` del logotipo: valor puntual de este
 * componente, no una escala nueva.
 *
 * `border-b border-b-transparent`: el preflight de Tailwind ya deja
 * `border-width: 0` en los cuatro lados, así que alcanza con fijar el ancho
 * del lado inferior a 1px transparente — reserva el espacio de la línea
 * activa para que no salte el layout al cambiar de ítem, sin pisar ningún
 * otro lado.
 *
 * `transition-[color]` (no `transition-colors`, que además anima
 * `border-color`, `background-color`, etc.): el ticket pide una única
 * transición, `color 120ms ease`.
 */
const clasesBase =
  "cursor-pointer border-b border-b-transparent bg-transparent px-md py-sm font-cuerpo text-[10px] uppercase leading-none tracking-[0.14em] whitespace-nowrap text-texto-cuerpo transition-[color] duration-[120ms] ease-[ease] hover:text-celeste-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-text";

/**
 * Vía `aria-current="page"` únicamente — nunca una clase `.active`
 * desconectada del estado semántico. El espacio entre texto y línea lo da
 * el `py-sm` (8px) de `clasesBase`; acá no se agrega margin extra. El
 * `font-weight` no cambia: la diferencia activo/inactivo es solo color +
 * línea.
 */
const clasesActivo = "border-b-celeste-text text-celeste-text";

/**
 * Nav/TabsBar de tipografía pura (ticket #82), reemplazo del `NavPrincipal`
 * con subrayado grueso y fondo `rounded-sm`. Nav simple, no widget ARIA
 * tabs: `aria-current="page"`, nunca `aria-selected` ni `role="tablist"`.
 * Único fragmento de cliente del bloque superior del header: `usePathname`
 * no existe en un Server Component, y es lo único que este componente
 * necesita para resaltar el ítem activo.
 *
 * Contenedor: ancho completo del header (sin `max-width` propio, se centra
 * por `justify-content`), `flex-wrap` deja 2-3 líneas en mobile —nunca
 * hamburguesa ni scroll horizontal— cada una centrada.
 */
export function NavPrincipal() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex flex-wrap items-center justify-center gap-x-xs gap-y-0 pt-[6px]">
      {ITEMS.map((item) => {
        if (!("href" in item)) {
          return (
            <button key={item.etiqueta} type="button" className={clasesBase}>
              {item.etiqueta}
            </button>
          );
        }

        const activo = esActivo(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={activo ? `${clasesBase} ${clasesActivo}` : clasesBase}
          >
            {item.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
