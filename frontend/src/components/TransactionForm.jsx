import React, { useState } from "react";
import config from "./config.json";

function TransactionForm({ type, userId, onClose, onSubmit }) {
  const API_URL = config.API_URL;
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
    recurring: false,
  });

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedDate = formData.date ? new Date(formData.date).toISOString().split("T")[0] : null;

    fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: userId,
        ...formData,
        date: formattedDate,
        type,
      }),
    })
      .then((res) => res.json())
      .then((newTransaction) => {
        onSubmit(newTransaction);
      })
      .catch((err) => console.error("Error adding transaction:", err));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>Add {type}</h3>
        <form onSubmit={handleSubmit}>
          <label typeof="price"> Amount </label>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <label typeof="category"> Category </label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <label typeof="description"> Description </label>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <label typeof="date"> Date </label>
          <input
            type="date"
            data-date=""
            data-date-form="DD MM YYYY"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <label typeof="checkbox">
            <input
              type="checkbox"
              name="recurring"
              checked={formData.recurring}
              onChange={handleChange}
            />
            Recurring
          </label>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
