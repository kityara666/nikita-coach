import { serve } from "bun";
import index from "./index.html";

const DB_FILE = "submissions.json";

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

          let submissions = [];
          const file = Bun.file(DB_FILE);

          if (await file.exists()) {
            const text = await file.text();
            if (text.trim() !== "") {
              submissions = JSON.parse(text);
            }
          }

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

  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);