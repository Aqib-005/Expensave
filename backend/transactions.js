import pool from "./db.js";
import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, amount, category, type, description, date, recurring } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions ("userID", amount, category, type, description, date, recurring)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, amount, category, type, description, date, recurring || false],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST /transactions error:", err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

async function ensureRecurringTransactions(userId, month, year) {
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const existing = await pool.query(
    `SELECT * FROM transactions WHERE "userID"=$1 AND date >= $2 AND date <= $3`,
    [userId, startDate, endDate],
  );

  if (existing.rows.length === 0) {
    const recurring = await pool.query(
      `SELECT * FROM transactions WHERE "userID"=$1 AND recurring=true`,
      [userId],
    );

    for (let t of recurring.rows) {
      await pool.query(
        `INSERT INTO transactions ("userID", amount, category, type, description, date, recurring)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [userId, t.amount, t.category, t.type, t.description, startDate, true],
      );
    }
  }
}

// Get income for a specific user (optionally filter by month/year)
router.get("/income/:userId", async (req, res) => {
  const { userId } = req.params;
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  try {
    if (month && year) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (month === currentMonth && year === currentYear) {
        await ensureRecurringTransactions(userId, month, year);
      }
    }

    let query = `SELECT * FROM transactions WHERE "userID" = $1 AND type = 'income'`;
    const params = [userId];

    if (!Number.isNaN(month) && !Number.isNaN(year)) {
      // use EXTRACT so we don't rely on string formats
      query += ` AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3 ORDER BY date DESC`;
      params.push(month, year);
    } else {
      query += ` ORDER BY date DESC`;
    }

    console.log("GET /income query:", query, "params:", params);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /income error:", err);
    res.status(500).json({ error: "Failed to fetch income" });
  }
});

// Get expenses for a specific user (optionally filter by month/year)
router.get("/expenses/:userId", async (req, res) => {
  const { userId } = req.params;
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  try {
    if (month && year) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1–12
      const currentYear = now.getFullYear();

      if (month === currentMonth && year === currentYear) {
        await ensureRecurringTransactions(userId, month, year);
      }
    }

    let query = `SELECT * FROM transactions WHERE "userID" = $1 AND type = 'expense'`;
    const params = [userId];

    if (!Number.isNaN(month) && !Number.isNaN(year)) {
      query += ` AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3 ORDER BY date DESC`;
      params.push(month, year);
    } else {
      query += ` ORDER BY date DESC`;
    }

    console.log("GET /expenses query:", query, "params:", params);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Update transaction 
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, category, type, description, date, recurring } = req.body;
  try {
    const result = await pool.query(
      `UPDATE transactions 
       SET amount=$1, category=$2, type=$3, description=$4, date=$5, recurring=$6
       WHERE transactionid=$7 RETURNING *`,
      [amount, category, type, description, date, recurring || false, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /transactions/:id error:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE transactionid=$1", [
      req.params.id,
    ]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE /transactions/:id error:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
