import type React from "react";

// GitHub fetch disabled — static card for now. Re-enable when live data wanted.
// import { getTopLanguages } from "@/lib/githubLanguages";

type TopLanguagesProps = {
  className?: string;
};

// Value = single hex, or [hex, hex] for a split-color dot (e.g. HTML/CSS).
const LANG_COLORS: Record<string, string | [string, string]> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Shell: "#89e051",
  Java: "#b07219",
  "HTML/CSS": ["#e34c26", "#563d7c"],
  // SCSS: "#c6538c",
  // Kotlin: "#A97BFF",
  // Go: "#00ADD8",
  // Rust: "#dea584",
  // Dockerfile: "#384d54",
  // Vue: "#41b883",
  // Svelte: "#ff3e00",
  // PHP: "#4F5D95",
  // Ruby: "#701516",
  // C: "#555555",
  // "C++": "#f34b7d",
  // "C#": "#178600",
};

function dotStyle(name: string): React.CSSProperties {
  const c = LANG_COLORS[name] ?? "#a5a5a8";
  // Two colors → split the dot down the middle (left = first, right = second).
  if (Array.isArray(c)) {
    return { background: `linear-gradient(90deg, ${c[0]} 0 50%, ${c[1]} 50% 100%)` };
  }
  return { backgroundColor: c };
}

export default function TopLanguages({ className = "" }: TopLanguagesProps) {
  const langs = Object.keys(LANG_COLORS);

  return (
    <div
      id="top-languages"
      className={`flex max-h-fit w-fit max-w-80 flex-col rounded-md border-2 border-[#a5a5a8] p-2 ${className}`}
    >
      <h2 className="text-start mb-2 text-sm font-semibold tracking-wide">Languages</h2>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
        {langs.map((name) => (
          <li key={name} className="flex items-center w-fit gap-2 text-xs text-[#a5a5a8]">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={dotStyle(name)}
            />
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopLanguagesSkeleton() {
  return (
    <div
      id="top-languages-skeleton"
      className="flex max-h-fit w-full max-w-80 flex-col rounded-xl border-2 border-[#a5a5a8] p-4"
    >
      <h3 className="mb-3 text-sm font-semibold tracking-wide">Languages</h3>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="h-3 w-24 rounded bg-[#ffffff14]" />
              <span className="h-3 w-10 rounded bg-[#ffffff14]" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#ffffff14]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
