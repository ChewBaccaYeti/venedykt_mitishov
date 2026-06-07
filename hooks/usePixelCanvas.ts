"use client";

import { useEffect, useRef, type RefObject } from "react";

class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;

  if (value <= min || reducedMotion) {
    return min;
  } else if (value >= max) {
    return max * throttle;
  } else {
    return value * throttle;
  }
}

export type PixelVariant = "default" | "blue" | "green" | "yellow" | "pink";

interface VariantConfig {
  activeColor: string | null;
  gap: number;
  speed: number;
  colors: string;
  noFocus: boolean;
}

const VARIANTS: Record<PixelVariant, VariantConfig> = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#f8fafc,#f1f5f9,#cbd5e1",
    noFocus: false,
  },
  blue: {
    activeColor: "#e0f2fe",
    gap: 10,
    speed: 25,
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    noFocus: false,
  },
  green: {
    activeColor: "#d1fae5",
    gap: 10,
    speed: 25,
    colors: "#d1fae5,#6ee7b7,#10b981,#00ff00",
    noFocus: false,
  },
  yellow: {
    activeColor: "#fef08a",
    gap: 3,
    speed: 20,
    colors: "#fef08a,#fde047,#eab308",
    noFocus: false,
  },
  pink: {
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true,
  },
};

export interface PixelCanvasOptions {
  variant?: PixelVariant;
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
}

type AnimateName = "appear" | "disappear";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Drives a ReactBits-style pixel shimmer onto a canvas that overlays
 * `containerRef`. Returns the canvas ref to attach plus the pointer/focus
 * handlers that start (appear) and stop (disappear) the animation.
 */
export function usePixelCanvas(
  containerRef: RefObject<HTMLElement | null>,
  options: PixelCanvasOptions = {},
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef(0);

  const { variant = "default", gap, speed, colors, noFocus } = options;

  const cfg = VARIANTS[variant] ?? VARIANTS.default;
  const finalGap = gap ?? cfg.gap;
  const finalSpeed = speed ?? cfg.speed;
  const finalColors = colors ?? cfg.colors;
  const finalNoFocus = noFocus ?? cfg.noFocus;

  const initPixels = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const reducedMotion = prefersReducedMotion();
    const colorsArray = finalColors.split(",");
    const step = parseInt(finalGap.toString(), 10);
    const pixels: Pixel[] = [];

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;
        pixels.push(
          new Pixel(canvas, ctx, x, y, color, getEffectiveSpeed(finalSpeed, reducedMotion), delay),
        );
      }
    }
    pixelsRef.current = pixels;
  };

  const doAnimate = (fnName: AnimateName) => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));

    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60;
    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allIdle = true;
    for (const pixel of pixelsRef.current) {
      pixel[fnName]();
      if (!pixel.isIdle) allIdle = false;
    }

    if (allIdle && animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleAnimation = (name: AnimateName) => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  const onMouseEnter = () => handleAnimation("appear");
  const onMouseLeave = () => handleAnimation("disappear");
  const onFocus: React.FocusEventHandler<HTMLElement> = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation("appear");
  };
  const onBlur: React.FocusEventHandler<HTMLElement> = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    handleAnimation("disappear");
  };

  useEffect(() => {
    timePreviousRef.current = performance.now();
    initPixels();

    const container = containerRef.current;
    const observer = new ResizeObserver(() => initPixels());
    if (container) observer.observe(container);

    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  const pixelProps = {
    onMouseEnter,
    onMouseLeave,
    onFocus: finalNoFocus ? undefined : onFocus,
    onBlur: finalNoFocus ? undefined : onBlur,
    tabIndex: finalNoFocus ? -1 : 0,
  };

  return { canvasRef, pixelProps, finalNoFocus };
}
