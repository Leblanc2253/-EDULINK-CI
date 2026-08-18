import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import "dotenv/config";

const pool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_ADMIN_USER,
  password: process.env.SQL_ADMIN_PASSWORD,
  database: process.env.SQL_DB_NAME,
});
const db = drizzle(pool);

async function main() {
  console.log("Running migrations...");
  // Actually, drizzle-kit push is easier! Let's just run drizzle-kit push in the shell.
}
