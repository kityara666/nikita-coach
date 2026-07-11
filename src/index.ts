import { serve } from "bun";
import index from "./index.html";
import { appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";

function escapeCSV(text: string) {
  const str = String(text);
  const safeStr = str.replaceAll('"', '""');
  return `"${safeStr}"`;
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

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({ message: `Hello, ${name}!` });
    },

    "/api/contact": {
      async POST(req) {
        const body = await req.json();

        const name = body.name || "";
        const tgaccount = body.tgaccount || "";
        const email = body.email || "";
        const message = body.message || "";

        if (
          name === "" ||
          tgaccount === "" ||
          email === "" ||
          !email.includes('@') ||
          message.length < 10
        ) {
          return Response.json({ error: "Bad request. Invalid data." }, { status: 400 });
        }

        console.log("The data has been verified:", { name, tgaccount, email, message });

        const filePath = "submissions.csv";
        if (!existsSync(filePath)) {
          await appendFile(filePath, "Name,Telegram,Email,Message\n");
        }
        const newRow = `${escapeCSV(name)},${escapeCSV(tgaccount)},${escapeCSV(email)},${escapeCSV(message)}\n`;
        await appendFile(filePath, newRow);

        return Response.json({ success: true, message: "The form reached the server!" });
      }
    },

  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);