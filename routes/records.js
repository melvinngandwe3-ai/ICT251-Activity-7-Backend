const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

function validateRecord(body) {
  const fields = [
    ["title", 3, 80],
    ["category", 2, 40],
    ["description", 5, 300]
  ];

  for (const [field, min, max] of fields) {
    if (typeof body[field] !== "string") {
      return { message: field + " must be a string." };
    }
    const value = body[field].trim();
    if (value.length < min || value.length > max) {
      return { message: field + " must have " + min + " to " + max + " characters." };
    }
  }

  if (typeof body.status !== "string" || !STATUSES.includes(body.status.trim())) {
    return { message: "Status must be Pending, In progress, or Completed." };
  }

  return null;
}

function validId(rawId) {
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// GET /api/records - return all records as an array.
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return next(error);
  }
});

// GET /api/records/:id - return one record.
router.get("/:id", async (req, res, next) => {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });

  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1",
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// POST /api/records - create a record; the database generates its ID.
router.post("/", async (req, res, next) => {
  const invalid = validateRecord(req.body || {});
  if (invalid) return res.status(400).json(invalid);

  const { title, category, description, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING id, title, category, description, status",
      [title.trim(), category.trim(), description.trim(), status.trim()]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// PUT /api/records/:id - replace all four editable fields; never creates a missing record.
router.put("/:id", async (req, res, next) => {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });

  const invalid = validateRecord(req.body || {});
  if (invalid) return res.status(400).json(invalid);

  const { title, category, description, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 WHERE id = $5 RETURNING id, title, category, description, status",
      [title.trim(), category.trim(), description.trim(), status.trim(), id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/records/:id - delete an existing record.
router.delete("/:id", async (req, res, next) => {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });

  try {
    const result = await pool.query("DELETE FROM records WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Record not found." });
    return res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
