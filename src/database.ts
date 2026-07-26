import {Database} from "bun:sqlite"

export const db = new Database("data.sqlite")

db.run("PRAGMA journal_mode = WAL;");

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        passwordHash  TEXT NOT NULL,
        createdAt INTEGER NOT NULL
    )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telegram TEXT,
    email TEXT,
    message TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )

`)

db.run(`
  CREATE TABLE IF NOT EXISTS heroes(
  id  INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  localized_name TEXT NOT NULL,
  primary_attr TEXT NOT NULL,
  attack_type TEXT NOT NULL,
  last_synced INTEGER NOT NULL
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS hero_roles(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hero_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  FOREIGN KEY (hero_id) REFERENCES heroes(id)
  )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS matches (
  match_id INTEGER NOT NULL,
  player_slot INTEGER NOT NULL,
  radiant_win INTEGER NOT NULL,
  duration INTEGER,
  game_mode INTEGER,
  lobby_type INTEGER,
  hero_id INTEGER,
  start_time INTEGER NOT NULL,
  version INTEGER,
  kills INTEGER,
  deaths INTEGER,
  assists INTEGER,
  skill INTEGER,
  average_rank INTEGER,
  leaver_status INTEGER,
  party_size INTEGER,
  hero_variant INTEGER,
  account_id INTEGER NOT NULL,
  result TEXT NOT NULL,
  imported_at INTEGER NOT NULL,
  PRIMARY KEY (account_id, match_id)
  )
  `)

console.log("Data base connected!");