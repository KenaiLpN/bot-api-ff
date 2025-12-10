import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("Conectado ao PostgreSQL com sucesso.");
});

pool.on("error", (err) => {
  console.error("Erro no pool do PostgreSQL:", err.message, err.stack);
});

export const query = (text: string, params: any[] = []) => {
  return pool.query(text, params);
};
