import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";

function Transactions() {
  const API_URL = config.API_URL;
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchIncome = (userId) => {
    fetch(`${API_URL}/transactions/income/${userId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setIncome(data))
      .catch((error) => console.error("Error fetching income: ", error));
  };

  const fetchExpenses = (userId) => {
    fetch(`${API_URL}/transactions/expenses/${userId}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setExpenses(data))
      .catch((error) => console.error("Error fetching expenses: ", error));
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
            <table>
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item.transactionid}>
                    <td>{item.category}</td>
                    <td>{item.amount}</td>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="budget-section">
            <p>Budget Placeholder</p>
          </div>
        </>
      ) : (
        <p>Please log in to view your transactions.</p>
      )}
    </div>
  );
}

export default Transactions;

