import { db } from "./database.ts";
import { serve } from "bun";
import index from "./index.html";
import {createCipheriv,  createDecipheriv,  randomBytes,} from "node:crypto";
import { getAccountsSummary, getAccount, getAccountPeriodSummary, getAccountMatches } from "./accounts.ts";

const secretString = process.env.SESSION_COOKIE_KEY;

if (!secretString) {
  throw new Error("FATAL: SESSION_COOKIE_KEY is missing in .env");
}

const SESSION_SECRET = Buffer.from(secretString, "hex")

if (SESSION_SECRET.length !== 32) {
  throw new Error("Length not 32 symbols")
}

if (!secretString) {
  throw new Error("Error")
}

console.log("Secret key loaded successfully!");

function encryptCookie(userId: string | number): string {
  const payloadObj = {
  "userId": userId,
  "exp": Date.now() + 3600000
  }

  const payloadString = JSON.stringify(payloadObj, null, 2);

  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", SESSION_SECRET, iv);

  let ciphertext = cipher.update(payloadString, "utf-8", "base64url");

  ciphertext += cipher.final("base64url");

  const authTagBuffer = cipher.getAuthTag();

  const authTagString = authTagBuffer.toString("base64url");
  
  const ivString = iv.toString("base64url");

  return `${ivString}.${ciphertext}.${authTagString}`;
}

function decryptCookie(token: string): string | number | null {
  try{
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const ivString = parts[0] as string;
    const ciphertextString = parts[1] as string;
    const authTagString = parts[2] as string;

    const iv = Buffer.from(ivString,"base64url");
    const authTag = Buffer.from(authTagString, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", SESSION_SECRET, iv);

    decipher.setAuthTag(authTag);
    let decryptedText = decipher.update(ciphertextString, "base64url", "utf8");
    decryptedText += decipher.final("utf8");
    const payload = JSON.parse(decryptedText);
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload.userId;
  } catch (error) {
    return(null);
  }
}

const server = serve({

  routes: {
    
    "/*": index,

    "/api/hello": {
      async GET() {
        return Response.json({ message: "Hello, world!", method: "GET" });
      },
      async PUT() {
        return Response.json({ message: "Hello, world!", method: "PUT" });
      },
    },

    "/api/hello/:name":{
      async GET(req) {
      const name = req.params.name;
      return Response.json({ message: `Hello, ${name}!` });
    },
  },

"/api/contact": {
      async POST(req: Request) {
        try {
          const body = await req.json();

          const insert = db.query(`
            INSERT INTO submissions (name, telegram, email, message, createdAt) 
            VALUES ($name, $telegram, $email, $message, $createdAt)
          `);

          insert.run({
            $name: body.name,
            $telegram: body.tgaccount || null,
            $email: body.email || null,
            $message: body.message,
            $createdAt: Date.now()
          });

          return Response.json({ success: true, message: "Submission saved" });

        } catch (error) {
          console.error("Failed to save submission:", error);
          
          return new Response(
            JSON.stringify({ error: "Failed to process submission due to a server error." }), 
            { 
              status: 500, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }
      }
    },

    "/api/submissions": {
      async GET(req) {
        try {
          const token = req.cookies.get("user_id");

          if (!token) {
            return Response.json(
              { error: "Unauthorized" }, 
              { status: 401 }
            );
          }
          const decryptedUserId = decryptCookie(token);

          if (!decryptedUserId) {
          return Response.json({ error: "Invalid session or token expired" }, { status: 401 });
          }

          const userExists = db.query(`
            SELECT id FROM users WHERE id = $id
          `).get({
            $id: decryptedUserId
          });
          if (!userExists) {
             return Response.json({ error: "Invalid session" }, { status: 401 });
          }

          const data = db.query(`
            SELECT 
              id, 
              name, 
              telegram AS tgaccount, 
              email, 
              message, 
              createdAt 
            FROM submissions 
            ORDER BY createdAt DESC
          `).all();
          return Response.json(data);
        } catch (error) {
          console.error("Failed to read submissions:", error);
          return new Response(
            JSON.stringify({ error: "Failed to read data" }), 
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    },

    "/api/login": {
      async POST(req) {
        try {
        const body = await req.json();
        const matchedUser = db.query(`
          SELECT * FROM users WHERE username = $username
        `).get({
          $username: body.username
        }) as any;
        if (!matchedUser) {
          return Response.json(
            { error: "Invalid username or password" }, 
            { status: 401 }
          );
        }

        const isPasswordValid = await Bun.password.verify(body.password, matchedUser.passwordHash);

        if (!isPasswordValid) {
          return Response.json(
            { error: "Invalid username or password" }, 
            { status: 401 }
          );
        }
        
        req.cookies.set("user_id", encryptCookie(matchedUser.id), {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60,
          secure: process.env.NODE_ENV === "production",
        });
        return Response.json(
          {success:"Success"},
          {status:200}
        )
        } catch(error) {console.error("Login error:", error);
        return new Response(
          JSON.stringify({ error: "Server error during login" }), 
          { status: 500 }
        );
        }
      }
  },

  "/api/logout": {
    async POST(req) {
      req.cookies.delete("user_id");
      return Response.json({ success: "Logged out" });
    }
  },

  "/api/heroes": {
    async GET() {
      try {
        const heroes = db.query(`
          SELECT id, name, localized_name, primary_attr, attack_type, last_synced
          FROM heroes
          ORDER BY localized_name ASC
        `).all();

        const roleQuery = db.query(`SELECT role FROM hero_roles WHERE hero_id = $hero_id`);

        const heroesWithRoles = heroes.map((hero: any) => {
          const roleRows = roleQuery.all({ $hero_id: hero.id }) as { role: string }[];
          const roles = roleRows.map((r) => r.role);
          return { ...hero, roles };
        });

        const lastSyncedRow = db.query(`SELECT MAX(last_synced) AS lastSynced FROM heroes`).get() as { lastSynced: string | null };
        const lastSynced = lastSyncedRow.lastSynced;

        return Response.json({
          heroes: heroesWithRoles,
          lastSynced: lastSynced,
        });
      } catch (error) {
        console.error("Failed to read heroes:", error);
        return new Response(
          JSON.stringify({ error: "Failed to read heroes" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  },

  "/api/accounts": {
  async GET() {
    try {
      const accounts = getAccountsSummary();

      const result = accounts.map((acc: any) => {
        const games = acc.games ?? 0;
        const wins = acc.wins ?? 0;
        const losses = games - wins;
        const winRate = games > 0 ? (wins / games * 100).toFixed(2) : "0.00";

        return {
          account_id: acc.account_id,
          nickname: acc.nickname,
          avatar: acc.avatar,
          cached_wins: wins,
          cached_losses: losses,
          cached_games: games,
          cached_win_rate: winRate,
          last_analysed: acc.last_analysed,
          latest_match: acc.latest_match,
        };
      });

      return Response.json({ accounts: result });
    } catch (error) {
      console.error("Failed to read accounts:", error);
      return new Response(
        JSON.stringify({ error: "Failed to read accounts" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
},


"/api/accounts/:accountId/matches": {
  async GET(req) {
    try {
      
      const accountId = Number(req.params.accountId);

      
      const url = new URL(req.url);
      const daysParam = url.searchParams.get("days");
      const days = daysParam === null ? 30 : Number(daysParam);

      
      if (!Number.isInteger(accountId) || accountId <= 0) {
        return Response.json({ error: "Invalid account id" }, { status: 400 });
      }

      
      const allowedDays = [7, 30, 60, 90, 160, 365];
      if (!allowedDays.includes(days)) {
        return Response.json({ error: "Invalid days" }, { status: 400 });
      }

   
      const account = getAccount(accountId) as any;
      if (!account) {
        return Response.json({ error: "Account not analyzed" }, { status: 404 });
      }

     
      const summary = getAccountPeriodSummary(accountId, days) as any;
      const matches = getAccountMatches(accountId, days) as any[];

      const games = summary.games ?? 0;
      const wins = summary.wins ?? 0;
      const losses = games - wins;
      const winRate = games > 0 ? (wins / games * 100).toFixed(2) : "0.00";

      return Response.json({
        account,
        days,
        summary: { wins, losses, games, win_rate: winRate },
        matches,
      });
    } catch (error) {
      console.error("Failed to read account matches:", error);
      return Response.json({ error: "Failed to read account matches" }, { status: 500 });
    }
  }
},

},





  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);