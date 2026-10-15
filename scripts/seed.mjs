import { config } from "dotenv";

config({ path: ".env.local" });

const port = process.env.PORT || "3000";
const token = process.env.SEED_TOKEN || "";
const url = `http://localhost:${port}/api/seed`;

const response = await fetch(url, {
  headers: token ? { "x-seed-token": token } : {},
});

const body = await response.text();
console.log(`[seed] ${response.status} ${url}`);
console.log(body);

if (!response.ok) {
  process.exitCode = 1;
}
