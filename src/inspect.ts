import { db } from "./database.ts";

const shared = db.query(`
  SELECT match_id, COUNT(*) AS accounts
  FROM matches
  GROUP BY match_id
  HAVING COUNT(*) > 1
  LIMIT 5
`).all();
console.log("Shared matches:", shared);