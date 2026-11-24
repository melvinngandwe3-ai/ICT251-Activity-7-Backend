require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pool = require("./db");

const app = express();
const rawOrigins = (process.env.CLIENT_ORIGINS || "*")
  .split(",").map(value => value.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || rawOrigins.includes("*") || rawOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "100kb" }));

const baseUrl = process.env.PUBLIC_BASE_URL || "Set PUBLIC_BASE_URL after deployment";

app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>IT Support Desk API Guide</title>
<style>
body{font:16px Arial,sans-serif;max-width:950px;margin:35px auto;padding:0 18px;color:#202938;line-height:1.55}
h1,h2{color:#153b63}table{width:100%;border-collapse:collapse;margin:15px 0}
th,td{border:1px solid #ccd5df;padding:10px;text-align:left}th{background:#e8eff6}
code,pre{background:#f1f4f7;padding:3px 6px;border-radius:4px;overflow-wrap:anywhere}
pre{padding:12px}a{color:#075eaa}
</style></head><body>
<h1>IT Support Desk Request API</h1>
<p><strong>Course:</strong> ICT251 - Activity 7 Backend Development</p>
<p><strong>Student name:</strong> Melvin Ng'andwe</p>
<p><strong>Student number:</strong> 202510639</p>
<p>This standalone API records student requests for computer, software, hardware and network support.</p>
<p><strong>API base URL:</strong> ${baseUrl}</p>
<p><a href="/health">Health check</a> | <a href="/api/records">View all records</a></p>
<h2>Available routes</h2>
<table><tr><th>Method</th><th>Route</th><th>Purpose</th></tr>
<tr><td>GET</td><td>/</td><td>Display this API guide</td></tr>
<tr><td>GET</td><td>/health</td><td>Check server and database</td></tr>
<tr><td>GET</td><td>/api/records</td><td>Read all records</td></tr>
<tr><td>GET</td><td>/api/records/:id</td><td>Read one record</td></tr>
<tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
<tr><td>PUT</td><td>/api/records/:id</td><td>Replace all four editable fields</td></tr>
<tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr></table>
<h2>Input fields</h2>
<p>Send title (3-80 characters), category (2-40), description (5-300), and status. Allowed statuses: Pending, In progress, Completed. Do not send an id; the database generates it.</p>
<h2>Example POST or PUT JSON body</h2>
<pre>{
  "title": "Cannot connect to campus Wi-Fi",
  "category": "Network",
  "description": "My device connects but cannot access the internet.",
  "status": "Pending"
}</pre>
<h2>Response codes</h2>
<p>200: successful read, update or delete. 201: record created. 400: invalid input, invalid ID or malformed JSON. 404: record or route not found. 500: unexpected server error. 503: database unavailable.</p>
<p><em>A free hosting service may pause when idle. The first request can take some time to start.</em></p>
</body></html>`);
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    return res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/records", require("./routes/records"));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((error, req, res, next) => {
  console.error(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON request body." });
  }
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ message: "Request origin is not permitted." });
  }
  return res.status(500).json({ message: "An unexpected server error occurred." });
});

async function initialiseDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  await pool.query(schema);
  await pool.query(seed);
}

const port = process.env.PORT || 3000;
if (require.main === module) {
  initialiseDatabase()
    .then(() => app.listen(port, "0.0.0.0", () => {
      console.log(`IT Support Desk API listening on port ${port}`);
    }))
    .catch(error => {
      console.error("Database setup failed:", error);
      process.exit(1);
    });
}

module.exports = app;
