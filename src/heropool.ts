import { getHeroAggregates } from "./accounts.ts";

export const MIN_GAMES_FOR_ELIGIBILITY = 5;

export function getEligibleHeroes(accountId: number, days: number, database?: any) {
  const all = getHeroAggregates(accountId, days, database) as any[];
  const eligible = all.filter((hero) => hero.games >= MIN_GAMES_FOR_ELIGIBILITY);
  return eligible;
}

export function computeMetrics(hero: any) {
  const overallKda = (hero.total_kills + hero.total_assists) / Math.max(hero.total_deaths, 1);

  const winKda = hero.wins > 0
    ? (hero.win_kills + hero.win_assists) / Math.max(hero.win_deaths, 1)
    : null;

  const winRate = hero.wins / hero.games * 100;

  const avgFastWinDuration = hero.fast_win_count > 0
    ? hero.fast_win_duration_sum / hero.fast_win_count
    : null;

  return {
    hero_id: hero.hero_id,
    localized_name: hero.localized_name ?? `Unknown hero (${hero.hero_id})`,
    games: hero.games,
    wins: hero.wins,
    losses: hero.games - hero.wins,
    overallKda,
    winKda,               
    winRate,
    fastWinCount: hero.fast_win_count,
    avgFastWinDuration,
  };
}

function assignRankPoints(
  heroes: any[],
  getValue: (h: any) => number | null,
  higherIsBetter: boolean
): Map<number, number> {
  const points = new Map<number, number>();
  const N = heroes.length;

  const available = heroes.filter((h) => getValue(h) !== null);

  const sorted = [...available].sort((a, b) => {
    const av = getValue(a)!;
    const bv = getValue(b)!;
    return higherIsBetter ? bv - av : av - bv;
  });

  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length && getValue(sorted[j]) === getValue(sorted[i])) {
      j++;
    }
    const rankPoints = N - i;
    for (let k = i; k < j; k++) {
      points.set(sorted[k].hero_id, rankPoints);
    }
    i = j;
  }

  return points;
}

export function rankHeroPool(accountId: number, days: number, database?: any) {
  const eligible = getEligibleHeroes(accountId, days, database);
  const heroes = eligible.map(computeMetrics);

  const overallKdaPoints = assignRankPoints(heroes, (h) => h.overallKda, true);
  const winKdaPoints = assignRankPoints(heroes, (h) => h.winKda, true);
  const winRatePoints = assignRankPoints(heroes, (h) => h.winRate, true);
  const speedPoints = assignRankPoints(heroes, (h) => h.avgFastWinDuration, false);

  const scored = heroes.map((h) => {
    const score =
      (overallKdaPoints.get(h.hero_id) ?? 0) +
      (winKdaPoints.get(h.hero_id) ?? 0) +
      (winRatePoints.get(h.hero_id) ?? 0) +
      (speedPoints.get(h.hero_id) ?? 0);
    return { ...h, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.games !== a.games) return b.games - a.games;
    return a.localized_name.localeCompare(b.localized_name);
  });

  return scored;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
