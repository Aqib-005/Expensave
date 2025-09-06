import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";
import TransactionForm from "./TransactionForm.jsx";
import "../styles/transactions.css";

function Transactions() {
  const API_URL = config.API_URL;
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("");
  const [editTransaction, setEditTransaction] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

    fetch(`${API_URL}/transactions/${transaction.transactionid}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          if (type === "income") {
            setIncome((prev) =>
              prev.filter((t) => t.transactionid !== transaction.transactionid)
            );
          } else {
            setExpenses((prev) =>
              prev.filter((t) => t.transactionid !== transaction.transactionid)
            );
          }
        }
        setDeleteConfirm(null);
      })
      .catch((err) => console.error("Error deleting transaction:", err));
  };

  const handleFormSubmit = (savedTransaction) => {
    if (editTransaction) {
      // Update
      if (savedTransaction.type === "income") {
        setIncome((prev) =>
          prev.map((t) =>
            t.transactionid === savedTransaction.transactionid ? savedTransaction : t
          )
        );
      } else {
        setExpenses((prev) =>
          prev.map((t) =>
            t.transactionid === savedTransaction.transactionid ? savedTransaction : t
          )
        );
      }
    } else {
      if (savedTransaction.type === "income") {
        setIncome((prev) => [...prev, savedTransaction]);
      } else {
        setExpenses((prev) => [...prev, savedTransaction]);
      }
    }
    setShowForm(false);
    setEditTransaction(null);
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
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {income.map((item, idx) => (
                  <tr
                    key={item.transactionid || idx}
                    className={`category-${item.category.toLowerCase()}`}
                  >
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(item, "income")}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(item, "income")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expenses */}
          <div className="expenses-section">
            <div className="section-header">
              <h3>Expenses</h3>
              <button className="add-button" onClick={() => handleAddButton("expense")}>
                + Add Expense
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item, idx) => (
                  <tr
                    key={item.transactionid || idx}
                    className={`category-${item.category.toLowerCase()}`}
                  >
                    <td>{item.description}</td>
                    <td>{item.amount}</td>
                    <td>{item.date ? new Date(item.date).toLocaleDateString("en-US") : "—"}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(item, "expense")}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(item, "expense")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transaction Form */}
          {showForm && (
            <TransactionForm
              type={formType}
              userId={user.userID}
              transaction={editTransaction}
              onClose={() => {
                setShowForm(false);
                setEditTransaction(null);
              }}
              onSubmit={handleFormSubmit}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="popup-overlay">
              <div className="popup-form">
                <h3>Confirm Delete</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{deleteConfirm.transaction.description}</strong>?
                </p>
                <div className="popup-actions">
                  <button className="delete-btn" onClick={confirmDelete}>
                    Confirm
                  </button>
                  <button className="add-button" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <p>Please log in to view your transactions.</p>
      )}
    </div>
  );
}

export default Transactions;

