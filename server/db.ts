import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export const pool = getPool();
export const db = drizzle(pool, { schema });
