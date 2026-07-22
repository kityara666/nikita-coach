import {Database} from "bun:sqlite"

export const db = new Database("data.sqlite")

db.run("PRAGMA journal_mode = WAL;");

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        passwordHash  TEXT NOT NULL,
        createdAt TEXT NOT NULL
    )
`)

db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telegram TEXT,
    email TEXT,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )

`)

db.run(`
  CREATE TABLE IF NOT EXISTS heroes(
  id  INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  localized_name TEXT NOT NULL,
  primary_attr TEXT NOT NULL,
  attack_type TEXT NOT NULL,
  last_synced TEXT NOT NULL
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

console.log("Data base connected!");