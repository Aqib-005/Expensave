import React, { useState, useEffect } from "react";
import config from "./config.json";
//import "../styles/budgetForm.css";

const categories = [
  "Groceries",
  "Transport",
  "Dining",
  "Rent",
  "Entertainment",
  "Income",
  "Other",
];

function BudgetForm({ userId, onClose, onSubmit }) {
  const [category, setCategory] = useState(categories[0]);
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");
  const API_URL = config.API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const newBudget = {
      user_id: userId,
      category,
      limit_amount: parseFloat(limit),
      period: "monthly",
      start_date: startDate,
      end_date: endDate,
    };

    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newBudget),
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
        <h3>Add Budget</h3>
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
            <option value="weekly">Weekly</option>
          </select>

          <div className="popup-actions">
            <button type="submit" className="add-button">Save</button>
            <button type="button" className="delete-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetForm;
