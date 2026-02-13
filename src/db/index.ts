import pg from "pg";

function getPort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const databaseUrl = process.env.DATABASE_URL;

const client = databaseUrl
  ? new pg.Client({
      connectionString: databaseUrl,
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    })
  : new pg.Client({
      user: process.env.PGUSER || "lmpladano",
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE || "codechimpdb",
      password: process.env.PGPASSWORD || "admin123",
      port: getPort(process.env.PGPORT, 5432),
    });

client
  .connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error", err));

export default client;
