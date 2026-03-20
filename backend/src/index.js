require("dotenv").config();

const cors = require("cors");
const express = require("express");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "backend" });
});

app.get("/api/hello", async (_req, res) => {
  try {
    const result = await pool.query("select 'Hello World' as message");
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Database query failed",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
