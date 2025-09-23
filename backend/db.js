import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL.replace(
  "db.",
  "db.ipv4.", // 👈 forces IPv4 resolution
);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;
