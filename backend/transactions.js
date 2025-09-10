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
      await ensureRecurringTransactions(userId, month, year);
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

router.get("/budgets/:userId/progress", async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  try {
    // Get all budgets for this user
    const [budgets] = await db.query("SELECT * FROM budget WHERE userID = ?", [
      userId,
    ]);

    // For each budget, calculate spent this month
    const progress = await Promise.all(
      budgets.map(async (budget) => {
        const [spentResult] = await db.query(
          `SELECT SUM(amount) AS spent 
           FROM expenses 
           WHERE userID = ? 
             AND category = ? 
             AND MONTH(date) = ? 
             AND YEAR(date) = ?`,
          [userId, budget.category, month, year],
        );

        return {
          category: budget.category,
          limit: budget.limit_amount,
          spent: spentResult[0].spent || 0,
        };
      }),
    );

    res.json(progress);
  } catch (err) {
    console.error("Error fetching budget progress:", err);
    res.status(500).json({ error: "Failed to fetch budget progress" });
  }
});

// Get expenses for a specific user (optionally filter by month/year)
router.get("/expenses/:userId", async (req, res) => {
  const { userId } = req.params;
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  try {
    if (month && year) {
      await ensureRecurringTransactions(userId, month, year);
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

// Update transaction (include recurring)
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

router.post("/budgets", async (req, res) => {
  const { user_id, category, limit_amount, period, start_date, end_date } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO budgets ("userID", category, limit_amount, period, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, category, limit_amount, period, start_date, end_date],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add budget" });
  }
});

router.get("/budgets/:userId/progress", async (req, res) => {
  const { userId } = req.params;
  const { month, year } = req.query;

  try {
    // Find budgets active in this month
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const budgets = await pool.query(
      `SELECT * FROM budgets 
       WHERE "userID"=$1 
       AND start_date <= $2 
       AND end_date >= $3`,
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budget progress" });
  }
});

router.put("/budgets/:id", async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

router.delete("/budgets/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM budgets WHERE budgetid=$1", [req.params.id]);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

export default router;
