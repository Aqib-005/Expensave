import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";
import TransactionForm from "./TransactionForm.jsx";

function Transactions() {
  const API_URL = config.API_URL;
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");

  const fetchIncome = (userId) => {
    fetch(`${API_URL}/transactions/income/${userId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setIncome(data))
      .catch((err) => console.error("Error fetching income:", err));
  };

  const fetchExpenses = (userId) => {
    fetch(`${API_URL}/transactions/expenses/${userId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Error fetching expenses:", err));
  };

  const handleAddButton = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  const handleFormSubmit = (newTransaction) => {
    if (newTransaction.type === "income") {
      setIncome((prev) => [...prev, newTransaction]);
    } else {
      setExpenses((prev) => [...prev, newTransaction]);
    }
    setShowForm(false);
  };

  useEffect(() => {
    if (user) {
      fetchIncome(user.userID);
      fetchExpenses(user.userID);
    }
  }, [user]);

  return (
    <div className="transaction-page">
      {user ? (
        <>
          <div className="income-section">
            <h3>Income</h3>
            <button className="add-button" onClick={() => handleAddButton("income")}>
              + Add Income
            </button>
            <table>
              <tbody>
                {income.map((item) => (
                  <tr key={item.transactionid}>
                    <td>{item.category}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="expenses-section">
            <h3>Expenses</h3>
            <button className="add-button" onClick={() => handleAddButton("expense")}>
              + Add Expense
            </button>
            <table>
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item, idx) => (
                  <tr key={item.transactionid || idx}>
                    <td>{item.category}</td>
                    <td>{item.amount}</td>
                    <td>
                      {item.date ? new Date(item.date).toLocaleDateString("en-US") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showForm && (
            <TransactionForm
              type={formType}
              userId={user.userID}
              onClose={() => setShowForm(false)}
              onSubmit={handleFormSubmit}
            />
          )}
        </>
      ) : (
        <p>Please log in to view your transactions.</p>
      )}
    </div>
  );
}

export default Transactions;

