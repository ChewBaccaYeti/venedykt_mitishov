"use client";

import { useRef } from "react";
import { usePixelCanvas, type PixelCanvasOptions } from "@/hooks/usePixelCanvas";

interface PixelCardProps extends PixelCanvasOptions {
  className?: string;
  children: React.ReactNode;
}

export default function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  className = "",
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, pixelProps } = usePixelCanvas(containerRef, {
    variant,
    gap,
    speed,
    colors,
    noFocus,
  });

  return (
    <div
      ref={containerRef}
      className={`relative isolate grid aspect-4/5 h-100 w-75 place-items-center overflow-hidden rounded-[25px] border border-[#27272a] transition-colors duration-200 ease-[cubic-bezier(0.5,1,0.89,1)] select-none ${className}`}
      {...pixelProps}
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
      {children}
    </div>
  );
}
