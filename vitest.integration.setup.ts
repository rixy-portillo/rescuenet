import { config } from "dotenv";
config({ path: ".env.local" });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    "TEST_DATABASE_URL is not set in .env.local. Run `npm run test:integration:setup` first."
  );
}

// src/lib/prisma.ts reads DATABASE_URL once at module load — this must run
// before any test file imports anything that transitively imports it.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
