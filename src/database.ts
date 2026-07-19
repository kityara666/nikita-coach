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

console.log("Data base connected!");