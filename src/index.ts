import { serve } from "bun";
import index from "./index.html";

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
          const userId = req.cookies.get("user_id");

          if (!userId) {
            return Response.json(
              { error: "Unauthorized" }, 
              { status: 401 }
            );
          }

          const users_file = Bun.file("users.json");
          const users_data = await users_file.text();
          const usersArray = JSON.parse(users_data);
          
          const userExists = usersArray.find((u: any) => u.id === userId);
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
        const matchedUser = usersArray.find((user:any) => user.username === body.username && user.password === body.password);
        if (!matchedUser) {
          return Response.json(
            { error: "Invalid username or password" }, 
            { status: 401 }
          );
        }
        req.cookies.set("user_id", matchedUser.id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60,
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