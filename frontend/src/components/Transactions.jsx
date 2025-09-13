import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";
import TransactionForm from "./TransactionForm.jsx";
import BudgetForm from "./BudgetForm.jsx";
import "../styles/transactions.css";

function Transactions() {
  const API_URL = config.API_URL;
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [editTransaction, setEditTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // works for tx + budgets

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchIncome = (userId, month, year) => {
    setIncome([]);
    const url = `${API_URL}/transactions/income/${userId}?month=${month}&year=${year}`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setIncome(data))
      .catch((err) => {
        console.error("Error fetching income:", err);
        setIncome([]);
      });
  };

  const fetchExpenses = (userId, month, year) => {
    setExpenses([]);
    const url = `${API_URL}/transactions/expenses/${userId}?month=${month}&year=${year}`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => {
        console.error("Error fetching expenses:", err);
        setExpenses([]);
      });
  };

  const fetchBudgets = (userId, month, year) => {
    fetch(`${API_URL}/budgets/${userId}/progress?month=${month}&year=${year}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setBudgets(data))
      .catch((err) => console.error("Error fetching budgets:", err));
  };

  useEffect(() => {
    if (user) {
      fetchIncome(user.userID, selectedMonth, selectedYear);
      fetchExpenses(user.userID, selectedMonth, selectedYear);
      fetchBudgets(user.userID, selectedMonth, selectedYear);
    }
  }, [user, selectedMonth, selectedYear]);

  const handleAddButton = (type) => {
    setFormType(type);
    setEditTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction, type) => {
    setFormType(type);
    setEditTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteClick = (transaction, type) => {
    setDeleteConfirm({ transaction, type });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const { transaction, type } = deleteConfirm;

    if (type === "income" || type === "expense") {
      fetch(`${API_URL}/transactions/${transaction.transactionid}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            if (type === "income") {
              setIncome((prev) => prev.filter((t) => t.transactionid !== transaction.transactionid));
            } else {
              setExpenses((prev) => prev.filter((t) => t.transactionid !== transaction.transactionid));
            }
          }
          setDeleteConfirm(null);
        })
        .catch((err) => {
          console.error("Error deleting transaction:", err);
          setDeleteConfirm(null);
        });
    }

    if (type === "budget") {
      fetch(`${API_URL}/budgets/${transaction.budgetid}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            fetchBudgets(user.userID, selectedMonth, selectedYear);
          }
          setDeleteConfirm(null);
        })
        .catch((err) => {
          console.error("Error deleting budget:", err);
          setDeleteConfirm(null);
        });
    }
  };

  const handleFormSubmit = (savedTransaction) => {
    if (editTransaction) {
      if (savedTransaction.type === "income") {
        setIncome((prev) =>
          prev.map((t) => (t.transactionid === savedTransaction.transactionid ? savedTransaction : t))
        );
      } else {
        setExpenses((prev) =>
          prev.map((t) => (t.transactionid === savedTransaction.transactionid ? savedTransaction : t))
        );
      }
    } else {
      const txDate = savedTransaction.date ? new Date(savedTransaction.date) : null;
      const txMonth = txDate ? txDate.getMonth() + 1 : null;
      const txYear = txDate ? txDate.getFullYear() : null;

      if (savedTransaction.type === "income") {
        if (!txDate || (txMonth === selectedMonth && txYear === selectedYear)) {
          setIncome((prev) => [...prev, savedTransaction]);
        }
      } else {
        if (!txDate || (txMonth === selectedMonth && txYear === selectedYear)) {
          setExpenses((prev) => [...prev, savedTransaction]);
        }
      }
    }

    setShowForm(false);
    setEditTransaction(null);
  };

  return (
    <div className="transaction-page">
      {user ? (
        <>
          {/* Month / Year Picker */}
          <div className="month-year-selector">
            <div className="selector-left">
              <h2 className="current-month" onClick={() => setShowMonthPicker(!showMonthPicker)}>
                {monthNames[selectedMonth - 1]} ⏷
              </h2>
              {showMonthPicker && (
                <div className="month-dropdown">
                  {monthNames.map((m, idx) => (
                    <div
                      key={m}
                      className={`month-option ${idx + 1 === selectedMonth ? "active" : ""}`}
                      onClick={() => {
                        setSelectedMonth(idx + 1);
                        setShowMonthPicker(false);
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="selector-right">
              <h2 className="current-year" onClick={() => setShowYearPicker(!showYearPicker)}>
                {selectedYear} ⏷
              </h2>
              {showYearPicker && (
                <div className="year-dropdown">
                  {Array.from({ length: 9 }, (_, i) => selectedYear - 4 + i).map((yr) => (
                    <div
                      key={yr}
                      className={`year-option ${yr === selectedYear ? "active" : ""}`}
                      onClick={() => {
                        setSelectedYear(yr);
                        setShowYearPicker(false);
                      }}
                    >
                      {yr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Income */}
          <div className="income-section">
            <div className="section-header">
              <h3>Income</h3>
              <button className="add-button" onClick={() => handleAddButton("income")}>
                + Add Income
              </button>
            </div>
            <table>
              <thead>
                <tr><th>Description</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {income.map((item, idx) => (
                  <tr key={item.transactionid || idx}>
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(item, "income")}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteClick(item, "income")}>Delete</button>
                    </td>
                  </tr>
                ))}
                {income.length === 0 && <tr><td colSpan="3">No income for this month</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Expenses */}
          <div className="expenses-section">
            <div className="section-header">
              <h3>Expenses</h3>
              <button className="add-button" onClick={() => handleAddButton("expense")}>+ Add Expense</button>
            </div>
            <table>
              <thead>
                <tr><th>Description</th><th>Amount</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {expenses.map((item, idx) => (
                  <tr key={item.transactionid || idx}>
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>{item.date ? new Date(item.date).toLocaleDateString("en-US") : "—"}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(item, "expense")}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteClick(item, "expense")}>Delete</button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan="4">No expenses for this month</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Transaction Form */}
          {showForm && (
            <TransactionForm
              type={formType}
              userId={user.userID}
              transaction={editTransaction}
              onClose={() => { setShowForm(false); setEditTransaction(null); }}
              onSubmit={handleFormSubmit}
            />
          )}

          {/* Delete Confirm */}
          {deleteConfirm && (
            <div className="popup-overlay">
              <div className="popup-form">
                <h3>Confirm Delete</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteConfirm.transaction.description || deleteConfirm.transaction.category}</strong>?
                </p>
                <div className="popup-actions">
                  <button className="delete-btn" onClick={confirmDelete}>Confirm</button>
                  <button className="add-button" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Budgets */}
          <div className="budgets-section">
            <div className="section-header">
              <h3>Budgets</h3>
              <button
                className="add-button"
                onClick={() => {
                  setEditBudget(null);
                  setShowBudgetForm(true);
                }}
              >
                + Add Budget
              </button>
            </div>

            {budgets.length > 0 ? (
              <table>
                <thead>
                  <tr><th>Category</th><th>Spent</th><th>Limit</th><th>Remaining</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {budgets.map((b, idx) => (
                    <tr key={b.budgetid || `budget-${idx}`}>
                      <td>{b.category}</td>
                      <td>${(b.spent ?? 0).toFixed(2)}</td>
                      <td>${(b.limit ?? b.limit_amount ?? 0).toFixed(2)}</td>
                      <td style={{ color: (b.remaining ?? 0) < 0 ? "red" : "green" }}>
                        {(b.remaining ?? 0) >= 0
                          ? `$${(b.remaining ?? 0).toFixed(2)}`
                          : `Over by $${Math.abs(b.remaining ?? 0).toFixed(2)}`}
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditBudget(b);
                            setShowBudgetForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(b, "budget")}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No budgets set for this month.</p>
            )}

            {showBudgetForm && (
              <BudgetForm
                userId={user.userID}
                budget={editBudget}
                onClose={() => { setShowBudgetForm(false); setEditBudget(null); }}
                onSubmit={() => {
                  fetchBudgets(user.userID, selectedMonth, selectedYear);
                  setShowBudgetForm(false);
                  setEditBudget(null);
                }}
              />
            )}
          </div>
        </>
      ) : (
        <p>Please log in to view your transactions.</p>
      )}
    </div>
  );
}

export default Transactions;

