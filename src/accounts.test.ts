import { test, expect } from "bun:test";
import { Database } from "bun:sqlite";
import { getAccountsSummary, getAccountPeriodSummary, getAccountMatches } from "./accounts.ts";

function makeTestDb() {
  const db = new Database(":memory:");

  db.run(`
    CREATE TABLE analyzed_accounts (
      account_id INTEGER PRIMARY KEY,
      nickname TEXT NOT NULL,
      avatar TEXT,
      last_analysed INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE matches (
      account_id INTEGER NOT NULL,
      match_id INTEGER NOT NULL,
      hero_id INTEGER,
      result TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      kills INTEGER, deaths INTEGER, assists INTEGER,
      duration INTEGER, game_mode INTEGER, lobby_type INTEGER,
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

function addAccount(db: Database, accountId: number, nickname: string, lastAnalysed: number) {
  db.query(`INSERT INTO analyzed_accounts (account_id, nickname, avatar, last_analysed) VALUES ($id, $nick, null, $la)`)
    .run({ $id: accountId, $nick: nickname, $la: lastAnalysed });
}

function addMatch(db: Database, accountId: number, matchId: number, heroId: number, result: "win" | "loss", startTime: number) {
  db.query(`INSERT INTO matches (account_id, match_id, hero_id, result, start_time, kills, deaths, assists, duration, game_mode, lobby_type)
    VALUES ($a, $m, $h, $r, $s, 5, 3, 10, 1800, 22, 7)`)
    .run({ $a: accountId, $m: matchId, $h: heroId, $r: result, $s: startTime });
}

function addHero(db: Database, id: number, name: string) {
  db.query(`INSERT INTO heroes (id, localized_name) VALUES ($id, $name)`).run({ $id: id, $name: name });
}

test("getAccountsSummary returns empty when no accounts", () => {
  const db = makeTestDb();
  const result = getAccountsSummary(db) as any[];
  expect(result.length).toBe(0);
});

test("getAccountsSummary aggregates wins and games", () => {
  const db = makeTestDb();
  addAccount(db, 100, "Alice", 1000);
  const now = Math.floor(Date.now() / 1000);
  addMatch(db, 100, 1, 1, "win", now - 100);
  addMatch(db, 100, 2, 1, "win", now - 200);
  addMatch(db, 100, 3, 1, "loss", now - 300);

  const result = getAccountsSummary(db) as any[];
  expect(result.length).toBe(1);
  expect(result[0].games).toBe(3);
  expect(result[0].wins).toBe(2);
});

test("getAccountPeriodSummary counts only matches inside period", () => {
  const db = makeTestDb();
  addAccount(db, 100, "Alice", 1000);
  const now = Math.floor(Date.now() / 1000);

  addMatch(db, 100, 1, 1, "win", now - 5 * 24 * 60 * 60);
  addMatch(db, 100, 2, 1, "loss", now - 10 * 24 * 60 * 60);

  addMatch(db, 100, 3, 1, "win", now - 40 * 24 * 60 * 60);

  const summary = getAccountPeriodSummary(100, 30, db) as any;
  expect(summary.games).toBe(2);
  expect(summary.wins).toBe(1);
});

test("getAccountMatches returns newest first", () => {
  const db = makeTestDb();
  addAccount(db, 100, "Alice", 1000);
  const now = Math.floor(Date.now() / 1000);

  addMatch(db, 100, 1, 1, "win", now - 300);
  addMatch(db, 100, 2, 1, "win", now - 100);
  addMatch(db, 100, 3, 1, "win", now - 200);

  const matches = getAccountMatches(100, 30, db) as any[];

  expect(matches.map((m) => m.match_id)).toEqual([2, 3, 1]);
});

test("getAccountMatches keeps match when hero missing from cache", () => {
  const db = makeTestDb();
  addAccount(db, 100, "Alice", 1000);
  const now = Math.floor(Date.now() / 1000);

  addMatch(db, 100, 1, 999, "win", now - 100);

  const matches = getAccountMatches(100, 30, db) as any[];
  expect(matches.length).toBe(1);
  expect(matches[0].localized_name).toBe(null);
});

test("getAccountMatches caps at 100 but summary counts all", () => {
  const db = makeTestDb();
  addAccount(db, 100, "Alice", 1000);
  const now = Math.floor(Date.now() / 1000);

  for (let i = 1; i <= 150; i++) {
    addMatch(db, 100, i, 1, "win", now - i * 60);
  }

  const matches = getAccountMatches(100, 30, db) as any[];
  const summary = getAccountPeriodSummary(100, 30, db) as any;

  expect(matches.length).toBe(100);
  expect(summary.games).toBe(150);
});