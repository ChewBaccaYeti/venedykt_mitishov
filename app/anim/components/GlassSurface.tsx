"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B";
  yChannel?: "R" | "G" | "B";
  mixBlendMode?:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity"
    | "plus-darker"
    | "plus-lighter";
  /** Layer rendered between the glass background and the content, clipped to the rounded container. */
  overlay?: React.ReactNode;
}

const subscribeDarkMode = (onChange: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const useDarkMode = () =>
  useSyncExternalStore(
    subscribeDarkMode,
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

const supportsBackdropFilter = () => {
  if (typeof window === "undefined") return false;
  return CSS.supports("backdrop-filter", "blur(10px)");
};

const supportsSVGFilters = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  if (isWebkit || isFirefox) {
    return false;
  }

  const div = document.createElement("div");
  div.style.backdropFilter = "url(#glass-filter-support-test)";
  return div.style.backdropFilter !== "";
};

// SVG-filter / backdrop support never changes at runtime, so the store
// subscription is a no-op; the snapshot is read once per environment.
const useSvgFilterSupport = () =>
  useSyncExternalStore(
    () => () => {},
    supportsSVGFilters,
    () => false,
  );

const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(function GlassSurface(
  {
    children,
    width = 200,
    height = 80,
    borderRadius = 20,
    borderWidth = 0.07,
    brightness = 50,
    opacity = 0.93,
    blur = 11,
    displace = 0,
    backgroundOpacity = 0,
    saturation = 1,
    distortionScale = -180,
    redOffset = 0,
    greenOffset = 10,
    blueOffset = 20,
    xChannel = "R",
    yChannel = "G",
    mixBlendMode = "difference",
    overlay,
    className = "",
    style = {},
    ...rest
  },
  ref,
) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;

  const svgSupported = useSvgFilterSupport();

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const isDarkMode = useDarkMode();

  // Feature detection (backdrop-filter / SVG filters / dark mode) only resolves
  // on the client, so the first client render must match the server HTML to
  // avoid a hydration mismatch. Render a neutral surface until mounted, then
  // swap in the detected styles.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Keep the internal ref and the forwarded ref pointing at the same node.
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute("href", generateDisplacementMap());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borderRadius, borderWidth, brightness, opacity, blur, mixBlendMode, redGradId, blueGradId]);

  useEffect(() => {
    updateDisplacementMap();

    if (displacementRef.current) {
      // Single displacement pass instead of one per RGB channel: the
      // backdrop-filter is recomputed every frame (animated content sits
      // behind it), so collapsing 3 displacement maps + 3 color matrices +
      // 2 blends into one pass is the main cost win. The per-channel offsets
      // are averaged into the single scale to keep their tuning meaningful.
      const offset = (redOffset + greenOffset + blueOffset) / 3;
      displacementRef.current.setAttribute("scale", (distortionScale + offset).toString());
      displacementRef.current.setAttribute("xChannelSelector", xChannel);
      displacementRef.current.setAttribute("yChannelSelector", yChannel);
    }

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString());
  }, [
    width,
    height,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    updateDisplacementMap,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [updateDisplacementMap]);

  useEffect(() => {
    setTimeout(updateDisplacementMap, 0);
  }, [width, height, updateDisplacementMap]);

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      "--glass-frost": backgroundOpacity,
      "--glass-saturation": saturation,
    } as React.CSSProperties;

    // Pre-mount (and on the server) every code path below would branch on
    // client-only detection, so return a deterministic surface that matches
    // the SSR output exactly.
    if (!mounted) {
      return {
        ...baseStyles,
        background: "rgba(255, 255, 255, 0.1)",
      };
    }

    const backdropFilterSupported = supportsBackdropFilter();

    if (svgSupported) {
      return {
        ...baseStyles,
        background: isDarkMode
          ? `hsl(0 0% 0% / ${backgroundOpacity})`
          : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        boxShadow: isDarkMode
          ? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset,
             0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`
          : `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset,
             0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset,
             0px 4px 16px rgba(17, 17, 26, 0.05),
             0px 8px 24px rgba(17, 17, 26, 0.05),
             0px 16px 56px rgba(17, 17, 26, 0.05),
             0px 4px 16px rgba(17, 17, 26, 0.05) inset,
             0px 8px 24px rgba(17, 17, 26, 0.05) inset,
             0px 16px 56px rgba(17, 17, 26, 0.05) inset`,
      };
    }

    if (isDarkMode) {
      if (!backdropFilterSupported) {
        return {
          ...baseStyles,
          background: "rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`,
        };
      }
      return {
        ...baseStyles,
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px) saturate(1.8) brightness(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.8) brightness(1.2)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`,
      };
    }

    if (!backdropFilterSupported) {
      return {
        ...baseStyles,
        background: "rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`,
      };
    }
    return {
      ...baseStyles,
      background: "rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(12px) saturate(1.8) brightness(1.1)",
      WebkitBackdropFilter: "blur(12px) saturate(1.8) brightness(1.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.2),
                  0 2px 16px 0 rgba(31, 38, 135, 0.1),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`,
    };
  };

  const glassSurfaceClasses =
    "relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out";

  const focusVisibleClasses = isDarkMode
    ? "focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2"
    : "focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2";

  return (
    <div
      ref={setRefs}
      className={`${glassSurfaceClasses} ${focusVisibleClasses} ${className}`}
      style={getContainerStyles()}
      {...rest}
    >
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />

            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="map"
              id="displacement"
              result="displaced"
            />
            <feGaussianBlur ref={gaussianBlurRef} in="displaced" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      {overlay && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
          {overlay}
        </div>
      )}

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[inherit] p-2">
        {children}
      </div>
    </div>
  );
});

export default GlassSurface;
