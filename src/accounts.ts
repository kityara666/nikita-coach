import { db } from "./database.ts";

export function upsertAccount(accountId: number, nickname: string, avatar: string | null) {
  db.query(`
    INSERT INTO analyzed_accounts (account_id, nickname, avatar, last_analysed)
    VALUES ($account_id, $nickname, $avatar, $last_analysed)
    ON CONFLICT(account_id) DO UPDATE SET
      nickname = $nickname,
      avatar = $avatar,
      last_analysed = $last_analysed
  `).run({
    $account_id: accountId,
    $nickname: nickname,
    $avatar: avatar,
    $last_analysed: Date.now(),
  });
}

export function getAccountsSummary(database = db){
    const rows = database.query(`
        SELECT
  analyzed_accounts.account_id,
  analyzed_accounts.nickname,
  analyzed_accounts.avatar,
  analyzed_accounts.last_analysed,
  COUNT(matches.match_id) AS games,
  SUM(CASE WHEN matches.result = 'win' THEN 1 ELSE 0 END) AS wins,
  MAX(matches.start_time) AS latest_match
FROM analyzed_accounts
LEFT JOIN matches ON matches.account_id = analyzed_accounts.account_id
GROUP BY analyzed_accounts.account_id
ORDER BY analyzed_accounts.last_analysed DESC
        `).all();

    return rows;
}

export function getAccountPeriodSummary(accountId: number, days: number, database=db) {
  const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

  const row = database.query(`
    SELECT
      COUNT(*) AS games,
      SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS wins
    FROM matches
    WHERE account_id = $accountId
      AND start_time >= $cutoff
  `).get({ $accountId: accountId, $cutoff: cutoff });

  return row;
}

export function getAccountMatches(accountId: number, days: number, database=db) {
  const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

  const rows = database.query(`
    SELECT
      matches.match_id,
      matches.start_time,
      matches.hero_id,
      heroes.localized_name,
      matches.result,
      matches.kills,
      matches.deaths,
      matches.assists,
      matches.duration,
      matches.game_mode,
      matches.lobby_type
    FROM matches
    LEFT JOIN heroes ON heroes.id = matches.hero_id
    WHERE matches.account_id = $accountId
      AND matches.start_time >= $cutoff
    ORDER BY matches.start_time DESC
    LIMIT 100
  `).all({ $accountId: accountId, $cutoff: cutoff });

  return rows;
}

export function getAccount(accountId: number) {
  return db.query(`
    SELECT account_id, nickname, avatar, last_analysed
    FROM analyzed_accounts
    WHERE account_id = $accountId
  `).get({ $accountId: accountId });
}
