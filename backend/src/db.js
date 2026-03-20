const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Keep startup explicit so misconfigured environments fail fast.
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
