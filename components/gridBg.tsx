import React from "react";

interface GridBgProps {
    /** Spacing of the fine grid in px. */
    cell?: number;
    /** How many fine cells make up one major (bold) cell. */
    major?: number;
    /** Base color of the grid surface. */
    background?: string;
    /** Line color (any CSS color). Alpha applied on top via the props below. */
    lineColor?: string;
    /** Opacity of the fine lines (0–1). */
    lineOpacity?: number;
    /** Opacity of the major lines (0–1). */
    majorOpacity?: number;
    /** Show small plus-marks at major intersections. */
    plusMarks?: boolean;
    /** Strength of the paper grain overlay (0–1). */
    grain?: number;
    /** Fade the grid toward the edges with a radial mask. */
    vignette?: boolean;
    /** Render fixed to the viewport instead of absolute to the parent. */
    fixed?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

// Inline SVG fractal-noise → paper grain. Encoded once, reused as a CSS image.
const GRAIN = "data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.9%27%20numOctaves%3D%274%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23n)%27%2F%3E%3C%2Fsvg%3E";

export default function GridBg({
    cell = 32,
    major = 4,
    background = "#1b1a1a",
    lineColor = "255, 255, 255",
    lineOpacity = 0.04,
    majorOpacity = 0.08,
    plusMarks = true,
    grain = 0.4,
    vignette = true,
    fixed = false,
    className = "",
    style = {},
}: GridBgProps) {
    const majorCell = cell * major;
    const fine = `rgba(${lineColor}, ${lineOpacity})`;
    const bold = `rgba(${lineColor}, ${majorOpacity})`;
    const mark = `rgba(${lineColor}, ${majorOpacity * 1.6})`;

    // Layered backgrounds, painted back-to-front:
    //  1. plus-marks at major intersections (two short gradients)
    //  2. major grid (bold)
    //  3. fine grid
    //  4. base color
    const layers: string[] = [];
    const sizes: string[] = [];

    if (plusMarks) {
        // Horizontal + vertical 1px ticks, ~9px long, centered on each major node.
        layers.push(
            `linear-gradient(${mark} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${mark} 1px, transparent 1px)`,
        );
        sizes.push(`9px 1px`, `1px 9px`);
    }

    layers.push(
        `linear-gradient(${bold} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${bold} 1px, transparent 1px)`,
        `linear-gradient(${fine} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${fine} 1px, transparent 1px)`,
    );
    sizes.push(
        `${majorCell}px ${majorCell}px`,
        `${majorCell}px ${majorCell}px`,
        `${cell}px ${cell}px`,
        `${cell}px ${cell}px`,
    );

    const gridStyle: React.CSSProperties = {
        backgroundColor: background,
        backgroundImage: layers.join(", "),
        backgroundSize: sizes.join(", "),
        // Offset by half a cell so plus-marks sit on the intersections, not in cells.
        backgroundPosition: plusMarks
            ? `${-4}px ${majorCell / 2}px, ${majorCell / 2}px ${-4}px, 0 0, 0 0, 0 0, 0 0`
            : undefined,
        ...(vignette
            ? {
                WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 90%)",
                maskImage:
                    "radial-gradient(ellipse at center, black 35%, transparent 90%)",
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
            {/* grid layer */}
            <div className="absolute inset-0" style={gridStyle} />

            {/* paper grain */}
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
