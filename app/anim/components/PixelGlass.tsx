"use client";

import { useRef } from "react";
import GlassSurface, { type GlassSurfaceProps } from "../../../components/GlassSurface";
import { usePixelCanvas, type PixelCanvasOptions } from "@/hooks/usePixelCanvas";

export interface PixelGlassProps extends GlassSurfaceProps {
  /** Pixel shimmer config (variant/gap/speed/colors/noFocus). */
  pixel?: PixelCanvasOptions;
  /** Turn the pixel shimmer off, leaving only the glass effect. */
  disablePixels?: boolean;
}

/**
 * GlassSurface with a ReactBits pixel shimmer overlay: hovering (or focusing)
 * the surface fills it with the shimmer, leaving/blurring reverses it.
 *
 * Pass `disablePixels` for glass only.
 */
export default function PixelGlass({
  pixel,
  disablePixels = false,
  children,
  ...glass
}: PixelGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { canvasRef, pixelProps } = usePixelCanvas(containerRef, pixel);

  return (
    <GlassSurface
      ref={containerRef}
      {...glass}
      {...(disablePixels ? {} : pixelProps)}
      overlay={
        disablePixels ? undefined : <canvas ref={canvasRef} className="block h-full w-full" />
      }
    >
      {children}
    </GlassSurface>
  );
}
