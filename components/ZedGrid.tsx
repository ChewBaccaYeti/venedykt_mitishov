import type React from "react";

/**
 * ZedGrid — фоновая "сетка" в стиле zed.dev, оптимизированная под роль
 * заднего фона всей страницы.
 *
 * Отличие от учебного скаффолда: сетка рисуется layered-gradient'ами (1 DOM-нода
 * вместо десятков линий-псевдоэлементов), поверх — фирменные боковые strip'ы Zed
 * с внутренним border, ромбы-узлы на пересечениях и noise-текстура.
 *
 * Чистый CSS, без хуков → server-компонент. pointer-events-none + aria-hidden:
 * фон невидим для ассистивных технологий и не перехватывает клики.
 */

interface ZedGridProps {
  /** Шаг мелкой сетки, px. */
  cell?: number;
  /** Сколько мелких клеток в одной крупной (жирной) клетке. */
  major?: number;
  /** Базовый цвет полотна. */
  background?: string;
  /** Цвет линий в формате "r, g, b" — прозрачность задаётся пропсами ниже. */
  lineColor?: string;
  /** Прозрачность мелких линий (0–1). */
  lineOpacity?: number;
  /** Прозрачность крупных линий (0–1). */
  majorOpacity?: number;
  /** Показывать ромбы-узлы на пересечениях боковых strip'ов. */
  nodes?: boolean;
  /** Сила noise-текстуры (0–1). 0 — выключить. */
  grain?: number;
  /** Затемнять края радиальной маской. */
  vignette?: boolean;
  /** fixed (по умолчанию, фон viewport'а) либо absolute к родителю. */
  fixed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Инлайновый fractal-noise → бумажное зерно. Кодируется один раз, переиспользуется.
const GRAIN =
  "data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%274%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23n)%27%2F%3E%3C%2Fsvg%3E";

/** Боковая вертикальная strip Zed. Внутренний border = вертикальная линия сетки. */
function NavStrip({ side }: { side: "left" | "right" }) {
  const sideClass =
    side === "left" ? "left-0 border-r" : "right-0 border-l";
  // Ромбы на внутренней грани strip'а (сверху и снизу). rotate-45 квадрат.
  const nodeEdge = side === "left" ? "right-[-3.5px]" : "left-[-3.5px]";

  return (
    <div
      className={`absolute top-0 bottom-0 w-4 border-white/10 bg-white/1.5 sm:w-6 md:w-12 ${sideClass}`}
    >
      <span
        aria-hidden
        className={`absolute top-6 size-1.5 rotate-45 border border-white/25 bg-neutral-300/80 ${nodeEdge}`}
      />
      <span
        aria-hidden
        className={`absolute bottom-6 size-1.5 rotate-45 border border-white/25 bg-neutral-300/80 ${nodeEdge}`}
      />
    </div>
  );
}

export default function ZedGrid({
  cell = 32,
  major = 4,
  background = "#1b1a1a",
  lineColor = "255, 255, 255",
  lineOpacity = 0.045,
  majorOpacity = 0.08,
  nodes = true,
  grain = 0.35,
  vignette = true,
  fixed = true,
  className = "",
  style = {},
}: ZedGridProps) {
  const majorCell = cell * major;
  const fine = `rgba(${lineColor}, ${lineOpacity})`;
  const bold = `rgba(${lineColor}, ${majorOpacity})`;

  // Слои рисуются спереди-назад: крупная сетка → мелкая сетка → базовый цвет.
  const gridStyle: React.CSSProperties = {
    backgroundColor: background,
    backgroundImage: [
      `linear-gradient(${bold} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${bold} 1px, transparent 1px)`,
      `linear-gradient(${fine} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${fine} 1px, transparent 1px)`,
    ].join(", "),
    backgroundSize: [
      `${majorCell}px ${majorCell}px`,
      `${majorCell}px ${majorCell}px`,
      `${cell}px ${cell}px`,
      `${cell}px ${cell}px`,
    ].join(", "),
    ...(vignette
      ? {
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 95%)",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 95%)",
        }
      : {}),
  };

  const position = fixed ? "fixed" : "absolute";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 -z-10 overflow-hidden ${className}`}
      style={{ position, ...style }}
    >
      {/* сетка */}
      <div className="absolute inset-0" style={gridStyle} />

      {/* боковые strip'ы + ромбы-узлы */}
      {nodes && (
        <>
          <NavStrip side="left" />
          <NavStrip side="right" />
        </>
      )}

      {/* бумажное зерно */}
      {grain > 0 && (
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage: `url("${GRAIN}")`,
            backgroundSize: "200px 200px",
            opacity: grain,
          }}
        />
      )}
    </div>
  );
}