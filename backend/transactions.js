import pool from "./db.js";
import express from "express";

const router = express.Router();

// Create transaction
router.post("/transactions", async (req, res) => {
  const { user_id, amount, category, type, description, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions ("userID", amount, category, type, description, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, amount, category, type, description, date],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add transaction" });
  }
});

// Get all transactions for user
router.get("/transactions/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;

  try {
    let query = `SELECT * FROM transactions WHERE user_id = $1`;
    let values = [userId];

    if (type) {
      query += ` AND type = $2`;
      values.push(type);
    }

    query += ` ORDER BY date DESC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Update transaction
router.put("/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, category, type, description, date } = req.body;
  const result = await pool.query(
    `UPDATE transactions SET amount=$1, category=$2, type=$3, description=$4, date=$5
     WHERE "transactionID"=$6 RETURNING *`,
    [amount, category, type, description, date, id],
  );
  res.json(result.rows[0]);
});

// Delete transaction
router.delete("/transactions/:id", async (req, res) => {
  await pool.query('DELETE FROM transactions WHERE "transactionID"=$1', [
    req.params.id,
  ]);
  res.json({ message: "Deleted successfully" });
});

// Create recurring expense
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
  const result = await pool.query(
    `INSERT INTO recurring_expenses ("userID", amount, category, type, description, interval, next_due_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [user_id, amount, category, type, description, interval, next_due_date],
  );
  res.json(result.rows[0]);
});

// Get recurring
router.get("/recurring/:userId", async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM recurring_expenses WHERE "userID"=$1 AND is_active=TRUE',
    [req.params.userId],
  );
  res.json(result.rows);
});

// Update recurring
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
  const result = await pool.query(
    `UPDATE recurring_expenses SET amount=$1, category=$2, type=$3, description=$4, interval=$5, next_due_date=$6, is_active=$7
     WHERE "recurringID"=$8 RETURNING *`,
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
});

// Delete recurring
router.delete("/recurring/:id", async (req, res) => {
  await pool.query('DELETE FROM recurring_expenses WHERE "recurringID"=$1', [
    req.params.id,
  ]);
  res.json({ message: "Recurring expense deleted" });
});

// Create budget
router.post("/budgets", async (req, res) => {
  const { user_id, category, limit_amount, period, start_date, end_date } =
    req.body;
  const result = await pool.query(
    `INSERT INTO budgets ("userID", category, limit_amount, period, start_date, end_date)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [user_id, category, limit_amount, period, start_date, end_date],
  );
  res.json(result.rows[0]);
});

// Get budgets
router.get("/budgets/:userId", async (req, res) => {
  const result = await pool.query('SELECT * FROM budgets WHERE "userID"=$1', [
    req.params.userId,
  ]);
  res.json(result.rows);
});

// Update budget
router.put("/budgets/:id", async (req, res) => {
  const { id } = req.params;
  const { category, limit_amount, period, start_date, end_date } = req.body;
  const result = await pool.query(
    `UPDATE budgets SET category=$1, limit_amount=$2, period=$3, start_date=$4, end_date=$5
     WHERE "budgetID"=$6 RETURNING *`,
    [category, limit_amount, period, start_date, end_date, id],
  );
  res.json(result.rows[0]);
});

// Delete budget
router.delete("/budgets/:id", async (req, res) => {
  await pool.query('DELETE FROM budgets WHERE "budgetID"=$1', [req.params.id]);
  res.json({ message: "Budget deleted" });
});

export default router;
