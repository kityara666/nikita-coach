import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { getTopHeroes, hasAnyMatches } from "./matches.ts";


function makeTestDb() {
  const db = new Database(":memory:");

  db.run(`
    CREATE TABLE matches (
      account_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      player_slot INTEGER NOT NULL,
      radiant_win INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      hero_id INTEGER,
      result TEXT NOT NULL,
      imported_at INTEGER NOT NULL,
      PRIMARY KEY (account_id, match_id)
    )
  `);

  db.run(`
    CREATE TABLE heroes (
      id INTEGER PRIMARY KEY,
      localized_name TEXT NOT NULL
    )
  `);

  return db;
}


function addMatch(db: Database, accountId: number, matchId: number, heroId: number, result: "win" | "loss", startTime: number) {
  db.query(`
    INSERT INTO matches (account_id, match_id, player_slot, radiant_win, start_time, hero_id, result, imported_at)
    VALUES ($account_id, $match_id, 0, 0, $start_time, $hero_id, $result, 0)
  `).run({
    $account_id: accountId,
    $match_id: matchId,
    $start_time: startTime,
    $hero_id: heroId,
    $result: result,
  });
}


function addHero(db: Database, id: number, name: string) {
  db.query(`INSERT INTO heroes (id, localized_name) VALUES ($id, $name)`).run({ $id: id, $name: name });
}

test("ranks heroes by wins descending", () => {
  const db = makeTestDb();

  addHero(db, 1, "Anti-Mage");
  addHero(db, 2, "Axe");

  const now = Math.floor(Date.now() / 1000);

  addMatch(db, 100, 1001, 1, "win", now - 1000);
  addMatch(db, 100, 1002, 1, "win", now - 2000);
  addMatch(db, 100, 1003, 2, "win", now - 3000);

  const result = getTopHeroes(100, 30, db) as any[];

  expect(result.length).toBe(2);
  expect(result[0].localized_name).toBe("Anti-Mage");
  expect(result[1].localized_name).toBe("Axe");
});

test("ties broken by games, then name", () => {
  const db = makeTestDb();
  addHero(db, 1, "Zeus");
  addHero(db, 2, "Axe");
  addHero(db, 3, "Bane");

  const now = Math.floor(Date.now() / 1000);

  addMatch(db, 100, 1, 1, "win", now - 100);
  addMatch(db, 100, 2, 1, "loss", now - 200);
  addMatch(db, 100, 3, 1, "loss", now - 300);
  addMatch(db, 100, 4, 2, "win", now - 400);
  addMatch(db, 100, 5, 3, "win", now - 500);

  const result = getTopHeroes(100, 30, db) as any[];

  expect(result.map((h) => h.localized_name)).toEqual(["Zeus", "Axe", "Bane"]);
});

test("account with no matches at all", () => {
  const db = makeTestDb();
  expect(hasAnyMatches(999, db)).toBe(false);
  expect(getTopHeroes(999, 30, db).length).toBe(0);
});

test("account has matches but none in period", () => {
  const db = makeTestDb();
  addHero(db, 1, "Zeus");
  const now = Math.floor(Date.now() / 1000);
  addMatch(db, 100, 1, 1, "win", now - 100 * 24 * 60 * 60);

  expect(hasAnyMatches(100, db)).toBe(true);
  expect(getTopHeroes(100, 30, db).length).toBe(0);
});

test("cutoff includes matches inside and excludes outside", () => {
  const db = makeTestDb();
  addHero(db, 1, "Zeus");
  const now = Math.floor(Date.now() / 1000);
  const thirtyDays = 30 * 24 * 60 * 60;

  addMatch(db, 100, 1, 1, "win", now - 29 * 24 * 60 * 60);
  addMatch(db, 100, 2, 1, "win", now - 31 * 24 * 60 * 60);

  const result = getTopHeroes(100, 30, db) as any[];

  expect(result.length).toBe(1);
  expect(result[0].games).toBe(1);
  expect(result[0].wins).toBe(1);
});

test("keeps matches for heroes missing from cache", () => {
  const db = makeTestDb();
  const now = Math.floor(Date.now() / 1000);
  addMatch(db, 100, 1, 999, "win", now - 100);

  const result = getTopHeroes(100, 30, db) as any[];

  expect(result.length).toBe(1);
  expect(result[0].hero_id).toBe(999);
  expect(result[0].localized_name).toBe(null);
});