import { db } from "./database";

async function migrate() {

  const usersCheck = db.query("SELECT COUNT(*) AS count FROM users").get() as any;
  const subsCheck = db.query("SELECT COUNT(*) AS count FROM submissions").get() as any;

  if (usersCheck.count > 0 || subsCheck.count > 0) {
    console.log("Database already exists");
    return;
  }

  console.log("Read JSON files");
  const oldUsers = await Bun.file("users.json").json();
  const oldSubs = await Bun.file("submissions.json").json();

  const insertUser = db.query(`
    INSERT INTO users (username, passwordHash, createdAt) 
    VALUES ($username, $passwordHash, $createdAt)
  `);
  
  const insertSub = db.query(`
    INSERT INTO submissions (name, telegram, email, message, createdAt) 
    VALUES ($name, $telegram, $email, $message, $createdAt)
  `);

  const runMigration = db.transaction((usersArray: any[], subsArray: any[]) => {
    for (const user of usersArray) {
      insertUser.run({
        $username: user.username,
        $passwordHash: user.passwordHash,
        $createdAt: user.createdAt || new Date().toISOString()
      });
    }

    for (const sub of subsArray) {
      insertSub.run({
        $name: sub.name,
        $telegram: sub.telegram || sub.tgaccount || null,
        $email: sub.email || null,
        $message: sub.message,
        $createdAt: sub.createdAt || new Date().toISOString()
      });
    }
  });

  try {
    runMigration(oldUsers, oldSubs);
    console.log("Migration done!");
  } catch (error) {
    console.error("Migration error", error);
  }
}

migrate();