import { rankHeroPool } from "./heropool.ts";
const ranked = rankHeroPool(1681482891, 365) as any[];
console.log(ranked.slice(0, 5).map(h => ({ name: h.localized_name, score: h.score, wr: h.winRate.toFixed(1), kda: h.overallKda.toFixed(2) })));