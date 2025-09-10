import React, { useState, useEffect } from "react";
import config from "./config.json";
//import "../styles/budgetForm.css";

const categories = [
  "Groceries",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Savings",
  "Miscellaneous",
];

function BudgetForm({ userId, onClose, onSubmit }) {
  const [category, setCategory] = useState(categories[0]);
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState("monthly");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBudget = {
      userId,
      category,
      limit_amount: parseFloat(limit),
      period,
      start_date: new Date(),
      end_date: null,
    };
    onSubmit(newBudget);
    onClose();
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
