require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { pool, initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_CODE = process.env.ACCESS_CODE || "";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- proteccion simple compartida (no es un login real, solo evita que
// cualquiera que adivine la URL pueda leer o escribir tus comandos) ---
function checkAccessCode(req, res, next) {
  if (!ACCESS_CODE) return next(); // si no se configuro, la API queda abierta
  const provided = req.header("x-access-code");
  if (provided && provided === ACCESS_CODE) return next();
  return res.status(401).json({ error: "codigo_invalido" });
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/commands", checkAccessCode);

app.get("/api/commands", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM commands ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error_al_leer" });
  }
});

app.post("/api/commands", async (req, res) => {
  try {
    const { title, command, description = "", category = "Otro", tags = [] } =
      req.body || {};
    if (!title || !command) {
      return res.status(400).json({ error: "faltan_campos" });
    }
    const id = crypto.randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO commands (id, title, command, description, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, title, command, description, category, tags]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error_al_guardar" });
  }
});

app.put("/api/commands/:id", async (req, res) => {
  try {
    const { title, command, description, category, tags } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE commands SET
         title = COALESCE($1, title),
         command = COALESCE($2, command),
         description = COALESCE($3, description),
         category = COALESCE($4, category),
         tags = COALESCE($5, tags),
         updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [title, command, description, category, tags, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "no_encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error_al_actualizar" });
  }
});

app.delete("/api/commands/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM commands WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error_al_eliminar" });
  }
});

// cualquier otra ruta sirve el frontend (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Fichero escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });
