import { db } from "./database.ts";

export function getResult(playerSlot: number, radiantWin: boolean): "win" | "loss" {
  const isRadiant = playerSlot < 128;
    if (isRadiant === radiantWin) {
    return "win";
    } else {
    return "loss";
    }
  
}

export async function fetchMatchesPage(accountId: number, offset: number) {
  const limit = 100;
  const url = `https://api.opendota.com/api/players/${accountId}/matches?limit=${limit}&offset=${offset}&date=730`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("Rate limited by OpenDota (HTTP 429)");
  }
  if (!response.ok) {
    throw new Error(`OpenDota returned status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response: matches is not an array");
  }

  return data;
}

export function toMatchRow(match: any, accountId: number) {
  return {
    $account_id: accountId,
    $match_id: match.match_id,
    $player_slot: match.player_slot,
    $radiant_win: match.radiant_win ? 1 : 0,
    $duration: match.duration ?? null,
    $game_mode: match.game_mode ?? null,
    $lobby_type: match.lobby_type ?? null,
    $hero_id: match.hero_id ?? null,
    $start_time: match.start_time,
    $version: match.version ?? null,
    $kills: match.kills ?? null,
    $deaths: match.deaths ?? null,
    $assists: match.assists ?? null,
    $skill: match.skill ?? null,
    $average_rank: match.average_rank ?? null,
    $leaver_status: match.leaver_status ?? null,
    $party_size: match.party_size ?? null,
    $hero_variant: match.hero_variant ?? null,
    $result: getResult(match.player_slot, match.radiant_win),
    $imported_at: Date.now(),
  };
}

export async function fetchAllNewMatches(accountId: number) {
  const limit = 100;
  const collected: any[] = [];
  let offset = 0;

  const twoYearsAgoSec = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);

  const row = db.query(`
  SELECT match_id
  FROM matches
  WHERE account_id = $accountId
  ORDER BY start_time DESC
  LIMIT 1
    `).get({ $accountId: accountId });

const newestStoredId = row ? (row as any).match_id : null;

  while (true) {
    const page = await fetchMatchesPage(accountId, offset);

    let reachedBoundary = false;
    let reachedKnown = false;
    for (const match of page) {
      if (match.match_id === newestStoredId) {
        reachedKnown = true;
        break;
      }
      if (match.start_time < twoYearsAgoSec) {
        reachedBoundary = true;
        break;
      }
      collected.push(match);
    }

    if (reachedKnown) break;
    if (reachedBoundary) break;
    if (page.length < limit) break;

    offset += page.length;
    await Bun.sleep(1200);
  }

  return collected;
}

export function insertMatches(matches: any[], accountId: number) {
  const insertMatch = db.query(`
    INSERT INTO matches (
      account_id, match_id, player_slot, radiant_win, duration, game_mode,
      lobby_type, hero_id, start_time, version, kills, deaths, assists, skill,
      average_rank, leaver_status, party_size, hero_variant, result, imported_at
    ) VALUES (
      $account_id, $match_id, $player_slot, $radiant_win, $duration, $game_mode,
      $lobby_type, $hero_id, $start_time, $version, $kills, $deaths, $assists, $skill,
      $average_rank, $leaver_status, $party_size, $hero_variant, $result, $imported_at
    )
    ON CONFLICT(account_id, match_id) DO NOTHING
  `);

  const runInsert = db.transaction((rows: any[]) => {
    for (const match of rows) {
      insertMatch.run(toMatchRow(match, accountId));
    }
  });

  runInsert(matches);
  return matches.length;
}

export async function importMatches(accountId: number): Promise<number> {
  const collected = await fetchAllNewMatches(accountId);
  const count = insertMatches(collected, accountId);
  return count;
}