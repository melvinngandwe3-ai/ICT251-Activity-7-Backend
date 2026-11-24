const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file.");
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

module.exports = pool;