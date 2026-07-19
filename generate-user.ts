import { db } from "./src/database.ts";

const username = "admin";
const plainPassword = "password123";

async function seedUser() {
  try {
    const hash = await Bun.password.hash(plainPassword);

    db.query(`
      INSERT INTO users (username, passwordHash, createdAt)
      VALUES ($username, $passwordHash, $createdAt)
    `).run({
      $username: username,
      $passwordHash: hash,
      $createdAt: new Date().toISOString()
    });

    console.log(`User "${username}" successfully added to the database!`);
    
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      console.error(`Error: User with username "${username}" already exists.`);
    } else {
      console.error("An error occurred while creating the user:", error);
    }
  }
}

seedUser();