"use client";

import React, { useMemo } from "react";

interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  /** Width of the glare band as a fraction of the diagonal sweep (0-1). */
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const hexToRgba = (glareColor: string, glareOpacity: number): string => {
  const hex = glareColor.replace("#", "");
  if (/^[\dA-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  if (/^[\dA-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  return glareColor;
};

/**
 * Hover glare sweep. The bright band is a fixed gradient on an overlay that is
 * translated diagonally across the surface via `transform` (GPU-composited, no
 * per-frame repaint) on `:hover`. No JS hover handlers, so hovering never
 * triggers a React render or inline-style thrash. Honors reduced-motion.
 */
const GlareHover: React.FC<GlareHoverProps> = ({
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 0.4,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}) => {
  const rgba = useMemo(() => hexToRgba(glareColor, glareOpacity), [glareColor, glareOpacity]);

  // Band centered in the gradient; glareSize sets its half-width.
  const mid = 0.5;
  const half = Math.max(0, Math.min(0.5, glareSize / 2));
  const start = Math.round((mid - half) * 100);
  const peak = Math.round(mid * 100);
  const end = Math.round((mid + half) * 100);

  const vars = {
    "--gh-rgba": rgba,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-grad": `linear-gradient(var(--gh-angle), transparent ${start}%, var(--gh-rgba) ${peak}%, transparent ${end}%)`,
  } as React.CSSProperties;

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--once" : ""} relative grid place-items-center overflow-hidden border ${className}`}
      style={{ width, height, background, borderRadius, borderColor, ...vars, ...style }}
    >
      <style>{`
        .glare-hover > .glare-hover__glare {
          position: absolute;
          inset: 0;
          z-index: 2147483647;
          background: var(--gh-grad);
          pointer-events: none;
          will-change: transform;
          transform: translate3d(-110%, -110%, 0);
        }
        .glare-hover:hover > .glare-hover__glare {
          transform: translate3d(110%, 110%, 0);
        }
        @media (prefers-reduced-motion: no-preference) {
          .glare-hover > .glare-hover__glare {
            transition: transform var(--gh-duration) ease;
          }
          .glare-hover--once:not(:hover) > .glare-hover__glare {
            transition: none;
          }
        }
      `}</style>
      <div className="glare-hover__glare" aria-hidden="true" />
      {children}
    </div>
  );
};

export default GlareHover;