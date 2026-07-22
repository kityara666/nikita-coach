import { db } from "./database.ts";
   db.run("DELETE FROM hero_roles");
   db.run("DELETE FROM heroes");
   console.log("Cleared");