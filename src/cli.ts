import { syncHeroes, HEROES_SYNC_CRON } from "./heroes.ts";
import { importMatches, getTopHeroes, hasAnyMatches } from "./matches.ts";
import { upsertAccount, getAccount, getAccountPeriodSummary } from "./accounts.ts";
import { rankHeroPool, formatDuration } from "./heropool.ts";


interface Profile {
  personaname: string;
}

interface PlayerResponse {
  profile: Profile | null;
}

interface WinLoss {
  win: number;
  lose: number;
}

interface TotalsEntry {
  field: string;
  sum: number;
}


async function main() {

const command = Bun.argv[2];

if(command==="analyze-account"){

const accountId = Bun.argv[3];

const id = Number(accountId);   
const isValid = !Number.isNaN(id) && Number.isInteger(id) && id>0;

if (!isValid) {
  console.error("Usage: bun run ./src/cli.ts analyze-account <account-id>");
  process.exit(1);
}



try{
const imported = await importMatches(id);
console.log(`Match history: ${imported} new matches imported`);
const profilePromise = fetch(`https://api.opendota.com/api/players/${id}`);
const wlPromise = fetch(`https://api.opendota.com/api/players/${id}/wl`);
const totalsPromise = fetch(`https://api.opendota.com/api/players/${id}/totals`);

const [profileResponse, wlResponse, totalsResponse] = await Promise.all([
  profilePromise,
  wlPromise,
  totalsPromise,
]);

if (profileResponse.status === 429 || wlResponse.status === 429 || totalsResponse.status === 429) {
  console.error("Rate limited by OpenDota (HTTP 429). Wait and try again.");
  process.exit(1);
}

if (!profileResponse.ok || !wlResponse.ok || !totalsResponse.ok) {
  console.error("OpenDota returned an error response");
  process.exit(1);
}

const [profileData, wlData, totalsData] = await Promise.all([
  profileResponse.json() as Promise<PlayerResponse>,
  wlResponse.json() as Promise<WinLoss>,
  totalsResponse.json() as Promise<TotalsEntry[]>,
]);

if (!profileData.profile) {
  console.error("Profile is unavailable (private or does not exist)");
  process.exit(1);
}



const nickname = profileData.profile.personaname;

upsertAccount(id, nickname, null);

const wins = wlData.win;
const losses = wlData.lose;
const killsEntry = totalsData.find((item) => item.field === "kills");
const deathsEntry = totalsData.find((item) => item.field === "deaths");
const assistsEntry = totalsData.find((item) => item.field === "assists");

if (!killsEntry || !deathsEntry || !assistsEntry) {
  console.error("Player totals are unavailable");
  process.exit(1);
}

const killsEntrySum = killsEntry.sum;
const deathsEntrySum = deathsEntry.sum;
const assistsEntrySum = assistsEntry.sum;
const totalGames = wins + losses;



let winRate;
if (totalGames === 0) {
  winRate = "0.00";}
    else {
  winRate =(wins / totalGames * 100).toFixed(2);
}

console.log(`
Account:${id}
Nickname:${nickname}
Wins:${wins}
Losses:${losses}
Win rate:${winRate}%
Kills:${killsEntrySum}
Assists:${assistsEntrySum}
Deaths:${deathsEntrySum}
`);
} catch(error){
    console.error("Failed to fetch or parse data from OpenDota");
    console.error(error);
    process.exit(1);
}
} else if (command ==="sync-heroes") {
        await syncHeroes();
        process.exit(0);
}
else if (command === "schedule-heroes") {
    console.log("Starting scheduled heroes sync worker");

    process.on("SIGINT", () => {
    console.log("Shutting down heroes sync worker");
    process.exit(0);
  });

  

    let isSyncing = false;

    async function runOnce() {
    if (isSyncing) {
        console.log("Sync already running, skipping this tick");
        return;
    }
    isSyncing = true;
    try {
        await syncHeroes();
    } finally {
        isSyncing = false;
    }
    }

    await runOnce();

Bun.cron(HEROES_SYNC_CRON, async () => {
  await runOnce();
});
}

else if (command === "top-heroes") {
  const accountId = Bun.argv[3];
  const daysArg = Bun.argv[4];

  const id = Number(accountId);
  const days = Number(daysArg);
  const allowedDays = [7, 30, 60, 90, 160, 365];

  const idValid = !Number.isNaN(id) && Number.isInteger(id) && id > 0;
  const daysValid = allowedDays.includes(days);

  if (!idValid || !daysValid) {
    console.error("Usage: bun run ./src/cli.ts top-heroes <account-id> <7|30|60|90|160|365>");
    process.exit(1);
  }

const topHeroes = getTopHeroes(id, days);

if (topHeroes.length === 0) {
  if (!hasAnyMatches(id)) {
    console.error(`No match history for account ${id}. Run: bun run ./src/cli.ts analyze-account ${id}`);
    process.exit(1);
  } else {
    console.log(`No matches in the last ${days} days for account ${id}.`);
    process.exit(0);
  }
}

console.log(`\nTop heroes for account ${id} — last ${days} days\n`);

topHeroes.forEach((hero: any, index: number) => {
  const name = hero.localized_name ?? `Unknown hero (${hero.hero_id})`;
  const winRate = (hero.wins / hero.games * 100).toFixed(2);
  const losses = hero.games - hero.wins;
  console.log(`${index + 1}. ${name} — ${hero.wins} wins / ${losses} losses / ${hero.games} games (${winRate}%)`);
});

}

else if (command === "best-hero-pool") {
  const accountId = Bun.argv[3];
  const daysArg = Bun.argv[4];

  const id = Number(accountId);
  const idValid = !Number.isNaN(id) && Number.isInteger(id) && id > 0;


  const days = daysArg === undefined ? 180 : Number(daysArg);
  const daysValid = Number.isInteger(days) && days >= 1 && days <= 730;

  if (!idValid || !daysValid) {
    console.error("Usage: bun run ./src/cli.ts best-hero-pool <account-id> [days: 1-730, default: 180]");
    process.exit(1);
  }


  const account = getAccount(id) as any;
  if (!account) {
    console.error(`Account ${id} has not been analyzed. Run: bun run ./src/cli.ts analyze-account ${id}`);
    process.exit(1);
  }


  if (!hasAnyMatches(id)) {
    console.error(`No match history for account ${id}. Run: bun run ./src/cli.ts analyze-account ${id}`);
    process.exit(1);
  }

  const ranked = rankHeroPool(id, days) as any[];
  const summary = getAccountPeriodSummary(id, days) as any;

  const eligibleCount = ranked.length;

  const sGames = summary.games ?? 0;
  const sWins = summary.wins ?? 0;
  const sLosses = sGames - sWins;
  const sWinRate = sGames > 0 ? (sWins / sGames * 100).toFixed(2) : "0.00";

  console.log(`\nBest hero pool for ${account.nickname} (${id}) — last ${days} days`);
  console.log(`Cached: ${sGames} games · ${sWins}W / ${sLosses}L · ${sWinRate}% WR · ${eligibleCount} eligible heroes\n`);

  function printLeaderboard(title: string, sortFn: (a: any, b: any) => number, format: (h: any) => string) {
    console.log(title);
    const top = [...ranked].sort(sortFn).slice(0, 5);
    top.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.localized_name} — ${format(h)}`);
    });
    console.log("");
  }

  printLeaderboard(
    "Fastest winning heroes (>10 min)",
    (a, b) => (a.avgFastWinDuration ?? Infinity) - (b.avgFastWinDuration ?? Infinity),
    (h) => h.avgFastWinDuration !== null ? `${formatDuration(h.avgFastWinDuration)} avg (${h.fastWinCount} wins)` : "N/A"
  );

  printLeaderboard(
    "Overall KDA",
    (a, b) => b.overallKda - a.overallKda,
    (h) => `${h.overallKda.toFixed(2)} KDA`
  );

  printLeaderboard(
    "KDA in wins",
    (a, b) => (b.winKda ?? -Infinity) - (a.winKda ?? -Infinity),
    (h) => h.winKda !== null ? `${h.winKda.toFixed(2)} KDA` : "N/A"
  );

  printLeaderboard(
    "Hero win rate",
    (a, b) => b.winRate - a.winRate,
    (h) => `${h.winRate.toFixed(2)}%`
  );

  console.log("Recommended hero pool\n");
  const pool = ranked.slice(0, 5);
  pool.forEach((h, i) => {
    const winKdaStr = h.winKda !== null ? `${h.winKda.toFixed(2)} win KDA` : "N/A win KDA";
    const speedStr = h.avgFastWinDuration !== null ? `${formatDuration(h.avgFastWinDuration)} avg winning time (${h.fastWinCount})` : "N/A winning time";
    console.log(`${i + 1}. ${h.localized_name} — score ${h.score}`);
    console.log(`   ${h.wins}W / ${h.losses}L · ${h.winRate.toFixed(2)}% WR · ${h.overallKda.toFixed(2)} KDA · ${winKdaStr} · ${speedStr}`);
  });

  if (eligibleCount < 5) {
    console.log(`\nWarning: only ${eligibleCount} eligible heroes — need more match history for a full five-hero pool.`);
  }

}

else {
  console.error("Unknown command. Available: analyze-account, sync-heroes, schedule-heroes");
  process.exit(1);
}


}


main();