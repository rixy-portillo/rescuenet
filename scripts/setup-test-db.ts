import { config } from "dotenv";
config({ path: ".env.local" });

import { execSync } from "node:child_process";

if (!process.env.TEST_DATABASE_URL) {
  console.error("TEST_DATABASE_URL is not set in .env.local");
  process.exit(1);
}

// `db push` (rather than `migrate deploy`) both creates the database if it
// doesn't exist yet and syncs it straight to the current schema.prisma shape
// — integration tests only need the current shape, not migration history.
// prisma.config.ts loads its own DATABASE_URL from .env, so --url is used
// here to point this specific push at the test database instead.
execSync(`npx prisma db push --accept-data-loss --url "${process.env.TEST_DATABASE_URL}"`, {
  stdio: "inherit",
});
