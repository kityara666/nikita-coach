import { db } from "./database.ts";
import { serve } from "bun";
import index from "./index.html";
import {createCipheriv,  createDecipheriv,  randomBytes,} from "node:crypto";
import { create } from "node:domain";

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
            $createdAt: new Date().toISOString()
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
},
  

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);