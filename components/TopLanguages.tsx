import { getTopLanguages } from "@/lib/githubLanguages";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Python: "#3572A5",
  Kotlin: "#A97BFF",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  PHP: "#4F5D95",
  Ruby: "#701516",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
};

function colorFor(name: string): string {
  return LANG_COLORS[name] ?? "#a5a5a8";
}

export default async function TopLanguages() {
  const langs = await getTopLanguages(5);

  if (langs.length === 0) {
    return (
      <div
        id="top-languages"
        className="flex max-h-fit w-full max-w-80 flex-col rounded-xl border-2 border-[#a5a5a8] p-4"
      >
        <h3 className="mb-3 text-sm font-semibold tracking-wide">Top Languages</h3>
        <p className="text-xs text-[#a5a5a8]">Unavailable</p>
      </div>
    );
  }

  return (
    <div
      id="top-languages"
      className="flex max-h-fit w-full max-w-80 flex-col rounded-xl border-2 border-[#a5a5a8] p-4"
    >
      <h3 className="mb-3 text-sm font-semibold tracking-wide">Top Languages</h3>
      <ul className="flex flex-col gap-2">
        {langs.map((l) => (
          <li key={l.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colorFor(l.name) }}
                />
                {l.name}
              </span>
              <span className="text-[#a5a5a8] tabular-nums">{l.percent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ffffff14]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${l.percent}%`,
                  backgroundColor: colorFor(l.name),
                }}
              />
            </div>
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
      <h3 className="mb-3 text-sm font-semibold tracking-wide">Top Languages</h3>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
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
