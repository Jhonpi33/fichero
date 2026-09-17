const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.warn(
    "[fichero] Aviso: no se encontro DATABASE_URL en las variables de entorno."
  );
}

// Render (y la mayoria de proveedores en la nube) requieren SSL, pero con
// un certificado que Node no valida por defecto. rejectUnauthorized:false
// es el ajuste estandar recomendado por Render para Postgres administrado.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com")
      ? { rejectUnauthorized: false }
      : process.env.PGSSLMODE === "disable"
      ? false
      : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS commands (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      command TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'Otro',
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

module.exports = { pool, initDb };
