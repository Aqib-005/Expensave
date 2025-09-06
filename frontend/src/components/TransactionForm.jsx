import React, { useState, useEffect } from "react";
import config from "./config.json";
import "../styles/transactionForm.css";

function TransactionForm({ type, userId, transaction, onClose, onSubmit }) {
  const API_URL = config.API_URL;
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
    recurring: false,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount || "",
        category: transaction.category || (type === "income" ? "Income" : ""),
        description: transaction.description || "",
        date: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : "",
        recurring: transaction.recurring || false,
      });
    }
  }, [transaction, type]);

  const categories = [
    "Groceries",
    "Transport",
    "Dining",
    "Rent",
    "Entertainment",
    "Income",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedDate = formData.date
      ? new Date(formData.date).toISOString().split("T")[0]
      : null;

    const payload = {
      user_id: userId,
      ...formData,
      date: formattedDate,
      type,
    };

    const url = transaction
      ? `${API_URL}/transactions/${transaction.transactionid}`
      : `${API_URL}/transactions`;

    const method = transaction ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((savedTransaction) => {
        onSubmit(savedTransaction);
      })
      .catch((err) => console.error("Error saving transaction:", err));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>{transaction ? `Edit ${type}` : `Add ${type}`}</h3>
        <form onSubmit={handleSubmit}>
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <label>Category</label>
          {type === "income" ? (
            <input type="text" name="category" value="Income" readOnly />
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.filter((cat) => cat !== "Income").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Netflix, Salary, Uber"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label>
            <input
              type="checkbox"
              name="recurring"
              checked={formData.recurring}
              onChange={handleChange}
            />
            Recurring
          </label>

          <button type="submit">{transaction ? "Update" : "Save"}</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;

