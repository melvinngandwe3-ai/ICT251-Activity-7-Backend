const router = require("express").Router();
const pool = require("../db");

const allowedStatuses = ["Pending", "In progress", "Completed"];

function validateRecord(body) {
  const fields = ["title", "category", "description", "status"];
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A JSON object is required.";
  }

  for (const field of fields) {
    if (typeof body[field] !== "string") {
      return `${field} must be text.`;
    }
  }

  const record = {
    title: body.title.trim(),
    category: body.category.trim(),
    description: body.description.trim(),
    status: body.status.trim()
  };

  if (record.title.length < 3 || record.title.length > 80)
    return "Title must have 3 to 80 characters.";
  if (record.category.length < 2 || record.category.length > 40)
    return "Category must have 2 to 40 characters.";
  if (record.description.length < 5 || record.description.length > 300)
    return "Description must have 5 to 300 characters.";
  if (!allowedStatuses.includes(record.status))
    return "Status must be Pending, In progress or Completed.";

  return record;
}

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });
    const result = await pool.query(
      "SELECT id, title, category, description, status FROM records WHERE id = $1", [id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const record = validateRecord(req.body);
    if (typeof record === "string") return res.status(400).json({ message: record });
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) VALUES ($1, $2, $3, $4) RETURNING id, title, category, description, status",
      [record.title, record.category, record.description, record.status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });
    const record = validateRecord(req.body);
    if (typeof record === "string") return res.status(400).json({ message: record });
    const result = await pool.query(
      "UPDATE records SET title=$1, category=$2, description=$3, status=$4 WHERE id=$5 RETURNING id, title, category, description, status",
      [record.title, record.category, record.description, record.status, id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID must be a positive whole number." });
    const result = await pool.query("DELETE FROM records WHERE id=$1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Record not found." });
    res.status(200).json({ message: "Record deleted." });
  } catch (error) { next(error); }
});

module.exports = router;