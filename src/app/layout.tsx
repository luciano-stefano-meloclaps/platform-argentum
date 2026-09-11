import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";

import "./globals.css";

/*
 * Las dos familias de la identidad Argentum, auto-hospedadas con
 * `next/font/google` por la corrección 5 del ADR 0008: sin esto, el
 * `@import` a Google Fonts haría una petición a un tercero desde el
 * navegador del chico y produciría salto de layout.
 *
 * Cada una expone su variable CSS, que el bloque `@theme` de `globals.css`
 * referencia como `--font-titulo` y `--font-cuerpo`. Los pesos pedidos son
 * los que la escala tipográfica realmente usa: 600 y 700 para Cormorant
 * Garamond (h3 y display/h1/h2, este último ya corregido a 700 por el ADR
 * 0008), 400/500/600 para Lora (cuerpo, label, botón, meta). No se pide la
 * itálica: la escala tipográfica no la usa en ningún componente.
 *
 * Lora reemplaza a Montserrat en toda la interfaz (ADR 0015, giro
 * museístico v2 — sistema-de-diseno-v2.md §4): no solo el cuerpo de
 * lectura largo de una ficha, sino también labels, botones, chips, nav,
 * metadatos y cifras de dashboard. Lora trae 400/500/600/700 como pesos
 * estáticos nativos (verificado contra el `font-data.json` que empaqueta
 * `next/font/google`), así que estos tres pesos no producen negrita
 * sintética — mismo criterio que ya se aplicó a Cormorant Garamond en el
 * ADR 0008. El riesgo que el ADR 0015 deja documentado y sin resolver por
 * adelantado es de legibilidad a tamaño chico y de `tabular-nums`, no de
 * disponibilidad de peso.
 */
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Argentum",
  description: "Argentum",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${lora.variable}`}>
      {/*
       * Fondo y tipografía por defecto del documento: `bg-crema` (nunca
       * blanco puro, sistema de diseño §3) y `font-cuerpo` (Lora, ADR 0015).
       * Es la aplicación mínima que hace falta para que los tokens de la
       * marca dejen de ser solo declaración y pasen a estar en uso; no
       * agrega ninguna pantalla ni componente.
       */}
      <body className="bg-crema font-cuerpo text-texto-cuerpo">{children}</body>
    </html>
  );
}
