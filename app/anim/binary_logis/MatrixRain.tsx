"use client";

import { useEffect, useRef } from "react";
import { savery } from "../../fonts/fonts";

const DEFAULT_OPTIONS = {
  size: () => window.innerWidth * 0.014,
  family: savery.style.fontFamily,
  fps: 30,
  hue: 120,
  glyphs:
    "ラドクリフマラソンわたしワタシんょンョたばこタバコとうきょうトウキョウ0123456789±!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZ对于更庞大的数据集",
};

type RainOptions = typeof DEFAULT_OPTIONS;

type Column = {
  chars: string[];
  cacheChars: string[];
  destination: number;
  lastDestination: number;
  lastLen: number;
  tailEnd: number;
  tailCounter: number;
  tailOff?: number;
  row: number;
  len: number;
  hue?: number;
};

// Minimal replacements for the gsap.utils helpers the original used,
// so the effect carries no external CDN dependency.
const random = (min: number, max: number, snap?: number) => {
  const value = min + Math.random() * (max - min);
  return snap ? Math.round(value / snap) * snap : value;
};

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));

const mapRange =
  (inMin: number, inMax: number, outMin: number, outMax: number) => (value: number) =>
    outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

class DigitalRain {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly options: RainOptions;
  private readonly glyphs: string[];
  private readonly ratio: number;

  private fontSize = 0;
  private columns = 0;
  private rows = 0;
  private characters = 0;
  private tracker: Column[] = [];

  private rafId = 0;
  private lastFrame = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, options: RainOptions) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d canvas context unavailable");

    this.canvas = canvas;
    this.context = context;
    this.options = options;
    this.glyphs = options.glyphs.split("");
    // Cap at 2x: beyond that the canvas pixel count (and per-frame fillText
    // work) grows quadratically for no perceptible gain in the rain.
    this.ratio = Math.min(window.devicePixelRatio || 1, 2);

    this.setSize();
    this.setTracker();
  }

  // Build the state object for a single column.
  private setColumn(column: Partial<Column> = {}): Column {
    const len = random(6, this.rows, 1);
    const lastLen = column.len ?? len;
    const destination = random(this.rows * 0.1, this.rows + len, 1);
    const lastDestination = column.destination ?? destination;
    const tailEnd = lastDestination + lastLen;

    const previous = column.chars ?? [];
    const cacheChars = [...previous];
    const chars = new Array<string>(Math.max(destination, previous.length))
      .fill("")
      .map((_, index) =>
        index <= destination
          ? (this.glyphs[random(0, this.glyphs.length - 1, 1)] ?? "")
          : (cacheChars[index] ?? ""),
      );

    const row = random(-this.rows, -1, 1);

    return {
      ...column,
      chars,
      cacheChars,
      destination,
      lastDestination,
      lastLen,
      tailEnd,
      tailCounter: lastDestination,
      row,
      len,
    };
  }

  private setTracker() {
    this.tracker = new Array(this.columns).fill(null).map(() => this.setColumn());
  }

  private getColor(y: number, column: Column): string {
    const { hue, row, len, lastLen, lastDestination, tailCounter } = column;
    const lower = 0.1;
    const upper = 1;
    let alpha = 0.1;

    if (y <= row) {
      alpha = clamp(lower, upper, mapRange(-len, 0, lower, upper)(y - row));
    } else if (y > row && y <= lastDestination) {
      alpha = clamp(lower, upper, mapRange(-lastLen, 0, lower, upper)(y - tailCounter));
    } else if (y > lastDestination) {
      alpha = lower;
    }

    return `hsl(${hue || this.options.hue}, 100%, ${row === y ? 60 : 35}%, ${alpha})`;
  }

  private render() {
    const { context } = this;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let c = 0; c < this.characters; c++) {
      const x = c % this.columns;
      const y = Math.floor(c / this.columns);
      const column = this.tracker[x];
      if (!column) continue;

      if (y === 0 && Math.random() > 0.1) column.row += 1;
      if (column.tailCounter !== column.tailOff && y === 0) column.tailCounter += 1;

      const row = column.row;
      const chars = y > row ? column.cacheChars : column.chars;

      // Skip empty cells before the expensive color-string build + fillStyle
      // assignment. The grid is mostly sparse, so this avoids ~10k useless
      // getColor() calls per frame with no change to what's drawn.
      if (chars[y]) {
        if (Math.random() > 0.999 && y > row) {
          column.cacheChars[y] = column.chars[y] = "";
        }
        if (
          Math.random() > 0.99 &&
          y < row &&
          y < column.destination &&
          y > column.destination - column.len
        ) {
          column.cacheChars[y] = column.chars[y] =
            this.glyphs[random(0, this.glyphs.length - 1, 1)] ?? "";
        }
        context.fillStyle = this.getColor(y, column);
        context.fillText(chars[y], (x + 0.5) * this.fontSize, (y + 1) * this.fontSize);
      }

      if (row > column.destination) {
        this.tracker[x] = this.setColumn(column);
      }
    }
  }

  private setSize() {
    const { height, width } = this.canvas.getBoundingClientRect();
    this.canvas.height = height * this.ratio;
    this.canvas.width = width * this.ratio;
    this.fontSize = Math.ceil(
      typeof this.options.size === "function" ? this.options.size() : this.options.size,
    );
    this.columns = Math.ceil(this.canvas.width / this.fontSize);
    this.rows = Math.ceil(this.canvas.height / this.fontSize);
    this.characters = this.rows * this.columns;
    this.context.font = `${this.fontSize}px ${this.options.family}`;
    this.context.textAlign = "center";
  }

  reset() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setSize();
    this.setTracker();
  }

  start() {
    if (this.running) return;
    this.running = true;
    const interval = 1000 / this.options.fps;
    const tick = (now: number) => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(tick);
      if (now - this.lastFrame < interval) return;
      this.lastFrame = now;
      this.render();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rain = new DigitalRain(canvas, DEFAULT_OPTIONS);
    rain.start();

    // Canvas fillText doesn't trigger font loading and silently falls back if
    // the face isn't ready. Force-load the family, then re-seed so glyphs draw
    // in Savery from the first visible frame.
    if (document.fonts) {
      document.fonts
        .load(`${Math.ceil(window.innerWidth * 0.014)}px ${DEFAULT_OPTIONS.family}`)
        .then(() => rain.reset())
        .catch(() => {});
    }

    const onResize = () => rain.reset();
    // Don't burn frames animating glyphs nobody can see.
    const onVisibility = () => (document.hidden ? rain.stop() : rain.start());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      rain.stop();
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-black">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
