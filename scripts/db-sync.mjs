import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const { Client } = pg;
const sqlPath = join(dirname(fileURLToPath(import.meta.url)), "db-sync.sql");
const statements = readFileSync(sqlPath, "utf8")
  .split(/;\s*$/m)
  .map((statement) => statement.replace(/--[^\n]*/g, "").trim())
  .filter((statement) => statement.length > 0);

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  for (const statement of statements) {
    await client.query(statement);
  }
  console.log(`[db-sync] applied ${statements.length} statements`);
} catch (error) {
  console.error("[db-sync] failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
