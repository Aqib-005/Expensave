import React, { useState, useEffect } from "react";
import config from "./config.json";
import '../styles/budgetForm.css';

const categories = [
  "Groceries",
  "Transport",
  "Dining",
  "Rent",
  "Entertainment",
  "Other",
];

function BudgetForm({ userId, budget, onClose, onSubmit }) {
  const API_URL = config.API_URL;
  const [category, setCategory] = useState(categories[0]);
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [isRecurring, setIsRecurring] = useState(false);

  // If editing, prefill the form with budget values
  useEffect(() => {
    if (budget) {
      setCategory(budget.category || categories[0]);
      setLimit(budget.limit_amount || budget.limit || "");
      setPeriod(budget.period || "monthly");
      setIsRecurring(budget.is_recurring || false);
    }
  }, [budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const payload = {
      user_id: userId,
      category,
      limit_amount: parseFloat(limit),
      period,
      start_date: budget?.start_date || startDate,
      end_date: budget?.end_date || endDate,
      is_recurring: isRecurring,
    };

    try {
      let url = `${API_URL}/budgets`;
      let method = "POST";

      if (budget) {
        // Editing an existing budget
        url = `${API_URL}/budgets/${budget.budgetid}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const savedBudget = await res.json();
      onSubmit(savedBudget);
      onClose();
    } catch (err) {
      console.error("Error saving budget:", err);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>{budget ? "Edit Budget" : "Add Budget"}</h3>
        <form onSubmit={handleSubmit}>
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label>Limit</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            required
          />

          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="monthly">Monthly</option>
          </select>

          <label>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            Make this budget recurring
          </label>

          <div className="popup-actions">
            <button type="submit">
              {budget ? "Update" : "Save"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetForm;

