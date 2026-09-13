"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Los ítems del nav plano del header. Solo rutas reales: hoy la aplicación
 * tiene "/" (la home) y "/catalogo" (ticket #33) — nada de Tarjetas, Quiz ni
 * Progreso, que todavía no existen como pantalla. Cuando aparezcan, se
 * agregan acá; no se inventan links a rutas que hoy dan 404.
 */
const ITEMS = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/catalogo", etiqueta: "Catálogo" },
] as const;

/**
 * Devuelve si `href` es la sección activa para `pathname`. "/" solo se
 * considera activo con match exacto (si no, marcaría cualquier ruta como
 * "Inicio" activo); el resto, exacto o como prefijo de una ruta hija —
 * `/catalogo/manuel-belgrano` también marca "Catálogo" como activo.
 */
function esActivo(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Nav plano del header (expansión de alcance pedida por el usuario, sin
 * ticket todavía — ver `header.tsx`). Único fragmento de cliente de todo el
 * bloque superior: `usePathname` no existe en un Server Component, y es lo
 * único que necesita para resaltar el ítem activo con `aria-current`.
 *
 * Objetivo táctil: `text-chip` es 11px con `line-height:1`, así que hace
 * falta más que `py-xs` para llegar al piso de 24×24px CSS (WCAG 2.2 SC
 * 2.5.8) — con `py-sm` (8px arriba y abajo) la caja del link da ~27px de
 * alto. `px-sm` (8px) de cada lado, y `gap-lg` entre ítems — ningún par de
 * links queda pegado el uno al otro para un dedo chico. Foco visible con el
 * mismo patrón de
 * outline celeste que ya usan los demás links de la aplicación
 * (`salas-del-catalogo.tsx`, `catalogo/page.tsx`).
 *
 * Separación respecto del separador ornamental que lo precede: `mt-xl`
 * (22px), un escalón más que el `mt-lg` (16px) anterior — mismo pedido de
 * "más aire" que documenta `header.tsx` para los tres tramos verticales del
 * bloque del logotipo.
 */
export function NavPrincipal() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="mt-xl flex flex-wrap items-center justify-center gap-x-lg gap-y-xs">
      {ITEMS.map((item) => {
        const activo = esActivo(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-sm px-sm py-sm font-cuerpo text-chip uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste-700 ${
              activo
                ? "text-celeste-text underline decoration-celeste-400 decoration-2 underline-offset-4"
                : "text-texto-secundario hover:text-celeste-text"
            }`}
          >
            {item.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
