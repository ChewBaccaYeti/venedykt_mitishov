import localFont from "next/font/local";

// Self-hosted via next/font/local. `savery.style.fontFamily` is the generated
// family name (plus fallback) to hand to the canvas 2d context.
export const savery = localFont({
  src: "./Lunar-Escape.otf",
  display: "swap",
  variable: "--font-lunar",
});
