import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcrypt";
import { adminUsers, players } from "../shared/schema";
import { config } from "dotenv";

// Load .env file
config();

const { Pool } = pg;

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log("Seeding database...");

  // Create root user with secure password
  const rootPassword = "R00t@FC26!Tr4ck3r";
  const passwordHash = await bcrypt.hash(rootPassword, 10);

  try {
    await db.insert(adminUsers).values({
      username: "root",
      passwordHash,
    }).onConflictDoNothing();

    console.log(`Created root user (username: root, password: ${rootPassword})`);
  } catch (error) {
    console.log("Admin user already exists or error:", error);
  }

  // Create initial sample players
  const samplePlayers = [
    { name: "Alex", avatar: "AX" },
    { name: "Sam", avatar: "SM" },
    { name: "Jordan", avatar: "JD" },
    { name: "Taylor", avatar: "TY" },
  ];

  for (const player of samplePlayers) {
    try {
      await db.insert(players).values(player).onConflictDoNothing();
      console.log(`Created player: ${player.name}`);
    } catch (error) {
      console.log(`Player ${player.name} already exists or error:`, error);
    }
  }

  console.log("Seeding complete!");

  await pool.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
