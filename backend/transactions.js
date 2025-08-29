import pool from "./db.js";
import express from "express";

const router = express.Router();

// Create transaction
router.post("/", async (req, res) => {
  const { user_id, amount, category, type, description, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions ("userID", amount, category, type, description, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, amount, category, type, description, date],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// Get all income transactions for a user
router.get("/income/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE "userID" = $1 AND type = $2',
      [userId, "income"],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch income transactions" });
  }
});

// Get all expense transactions for a user
router.get("/expenses/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE "userID" = $1 AND type = $2',
      [userId, "expense"],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch expense transactions" });
  }
});

// Update transaction
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, category, type, description, date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE transactions 
       SET amount=$1, category=$2, type=$3, description=$4, date=$5
       WHERE transactionid=$6 RETURNING *`,
      [amount, category, type, description, date, id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

router.post("/recurring", async (req, res) => {
  const {
    user_id,
    amount,
    category,
    type,
    description,
    interval,
    next_due_date,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO recurring_expenses ("userID", amount, category, type, description, interval, next_due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, amount, category, type, description, interval, next_due_date],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add recurring expense" });
  }
});

router.get("/recurring/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM recurring_expenses WHERE "userID"=$1 AND is_active=TRUE',
      [req.params.userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recurring expenses" });
  }
});

router.put("/recurring/:id", async (req, res) => {
  const { id } = req.params;
  const {
    amount,
    category,
    type,
    description,
    interval,
    next_due_date,
    is_active,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE recurring_expenses 
       SET amount=$1, category=$2, type=$3, description=$4, interval=$5, next_due_date=$6, is_active=$7
       WHERE recurringid=$8 RETURNING *`,
      [
        amount,
        category,
        type,
        description,
        interval,
        next_due_date,
        is_active,
        id,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update recurring expense" });
  }
});

router.delete("/recurring/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM recurring_expenses WHERE recurringid=$1", [
      req.params.id,
    ]);
    res.json({ message: "Recurring expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete recurring expense" });
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

router.get("/budgets/:userId", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budgets WHERE "userID"=$1', [
      req.params.userId,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budgets" });
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
