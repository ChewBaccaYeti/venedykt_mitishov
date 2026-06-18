const GITHUB_USER = "ChewBaccaYeti";
const REVALIDATE_SECONDS = 60 * 60 * 24;

type Repo = { name: string; fork: boolean; languages_url: string };
type LanguageMap = Record<string, number>;

export type LanguageStat = {
  name: string;
  bytes: number;
  percent: number;
};

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getTopLanguages(limit = 5): Promise<LanguageStat[]> {
  const reposRes = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner&sort=updated`,
    {
      headers: authHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!reposRes.ok) return [];

  const repos = (await reposRes.json()) as Repo[];
  const owned = repos.filter((r) => !r.fork);

  const langResults = await Promise.allSettled(
    owned.map((r) =>
      fetch(r.languages_url, {
        headers: authHeaders(),
        next: { revalidate: REVALIDATE_SECONDS },
      }).then((res) => (res.ok ? res.json() : Promise.resolve({})) as Promise<LanguageMap>),
    ),
  );

  const totals: LanguageMap = {};
  for (const result of langResults) {
    if (result.status !== "fulfilled") continue;
    for (const [lang, bytes] of Object.entries(result.value)) {
      totals[lang] = (totals[lang] ?? 0) + bytes;
    }
  }

  const totalBytes = Object.values(totals).reduce((a, b) => a + b, 0);
  if (totalBytes === 0) return [];

  return Object.entries(totals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: (bytes / totalBytes) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}
