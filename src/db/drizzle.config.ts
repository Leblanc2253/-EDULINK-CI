import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.SQL_HOST as string,
    user: process.env.SQL_ADMIN_USER as string,
    password: process.env.SQL_ADMIN_PASSWORD as string,
    database: process.env.SQL_DB_NAME as string,
    ssl: false,
  },
});
