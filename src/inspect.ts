import { db } from "./database.ts";

console.log(db.query("SELECT name FROM sqlite_master WHERE type='index'").all());