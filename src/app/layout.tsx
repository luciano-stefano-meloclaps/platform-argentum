import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";

import "./globals.css";

/*
 * Las dos familias de la identidad Argentum (sistema de diseño, sección 4),
 * auto-hospedadas con `next/font/google` por la corrección 5 del ADR 0008: sin
 * esto, el `@import` a Google Fonts haría una petición a un tercero desde el
 * navegador del chico y produciría salto de layout.
 *
 * Cada una expone su variable CSS, que el bloque `@theme` de `globals.css`
 * referencia como `--font-titulo` y `--font-cuerpo`. Los pesos pedidos son
 * los que la escala tipográfica realmente usa (sección 4 del sistema de
 * diseño): 600 y 700 para Cormorant Garamond (h3 y display/h1/h2, este
 * último ya corregido a 700 por el ADR 0008), 400/500/600 para Montserrat
 * (cuerpo, label, botón, meta). No se pide la itálica: la escala tipográfica
 * no la usa en ningún componente, solo aparecía en el `@import` original como
 * declaración de la familia completa.
 */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Argentum",
  description: "Argentum",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${montserrat.variable}`}>
      {/*
       * Fondo y tipografía por defecto del documento: `bg-crema` (nunca
       * blanco puro, sistema de diseño §3) y `font-cuerpo` (Montserrat). Es
       * la aplicación mínima que hace falta para que los tokens del ticket
       * #26 dejen de ser solo declaración y pasen a estar en uso; no agrega
       * ninguna pantalla ni componente.
       */}
      <body className="bg-crema font-cuerpo text-texto-cuerpo">{children}</body>
    </html>
  );
}
