import { serve } from "bun";
import index from "./index.html";
import {createCipheriv,  createDecipheriv,  randomBytes,} from "node:crypto";
import { create } from "node:domain";

const DB_FILE = "submissions.json";
async function getSubmissionsData() {
  const file = Bun.file(DB_FILE);
  if (await file.exists()) {
    const text = await file.text();
    if (text.trim() !== "") {
      return JSON.parse(text);
    }
  }
  return [];
}


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

          const newSubmission = {
            ...body,
            createdAt: new Date().toISOString(),
          };

          let submissions = await getSubmissionsData();

          submissions.push(newSubmission);

          await Bun.write(DB_FILE, JSON.stringify(submissions, null, 2));

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

          const users_file = Bun.file("users.json");
          const users_data = await users_file.text();
          const usersArray = JSON.parse(users_data);
          
          const userExists = usersArray.find((u: any) => String(u.id) === String(decryptedUserId));
          if (!userExists) {
             return Response.json({ error: "Invalid session" }, { status: 401 });
          }

          const data = await getSubmissionsData();
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
        const users_file = "users.json"
        const users_data  = Bun.file(users_file);
        const users = await users_data.text();
        const usersArray = JSON.parse(users);
        const matchedUser = usersArray.find((user:any) => user.username === body.username);
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