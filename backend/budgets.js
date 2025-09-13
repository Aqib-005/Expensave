import pool from "./db.js";
import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, category, limit_amount, period, start_date, end_date } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO budgets ("userID", category, limit_amount, period, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, category, limit_amount, period, start_date, end_date],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST /budgets error:", err);
    res.status(500).json({ error: "Failed to add budget" });
  }
});

router.get("/:userId/progress", async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const budgets = await pool.query(
      `SELECT * FROM budgets
       WHERE "userID"=$1
       AND start_date <= $2
       AND (end_date IS NULL OR end_date >= $3)`,
      [userId, endDate, startDate],
    );

    let results = [];
    for (let b of budgets.rows) {
      const spent = await pool.query(
        `SELECT COALESCE(SUM(amount),0) as total
         FROM transactions
         WHERE "userID"=$1 AND category=$2
         AND type='expense'
         AND date >= $3 AND date <= $4`,
        [userId, b.category, startDate, endDate],
      );

      results.push({
        budgetid: b.budgetid,
        category: b.category,
        limit: parseFloat(b.limit_amount),
        spent: parseFloat(spent.rows[0].total),
        remaining: parseFloat(b.limit_amount) - parseFloat(spent.rows[0].total),
      });
    }

    res.json(results);
  } catch (err) {
    console.error("GET /budgets/:userId/progress error:", err);
    res.status(500).json({ error: "Failed to fetch budget progress" });
  }
});

// Update a budget
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { category, limit_amount, period, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE budgets
       SET category=$1, limit_amount=$2, period=$3, start_date=$4, end_date=$5
       WHERE budgetid=$6 RETURNING *`,
      [category, limit_amount, period, start_date, end_date, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /budgets/:id error:", err);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

// Delete a budget
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM budgets WHERE budgetid=$1", [req.params.id]);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error("DELETE /budgets/:id error:", err);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

export default router;
