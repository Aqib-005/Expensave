import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";

function Transactions() {
  const API_URL = config.API_URL;
  const user = useAuth();
  const [income, setincome] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchItems = (userId, type, setter) => {
    fetch(`${API_URL}/transactions/${userId}?type=${type}`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setter(data))
      .catch((error) => console.error("Error fetching items: ", error));
  };

  useEffect(() => {
    if (user) {
      fetchItems(user.id, "income", setincome);
      fetchItems(user.id, "expense", setExpenses);
    }
  }, [user]);

  if (!user) {
    return <p>Please log in to view your transactions.</p>;
  }

  return (
    <div className="transaction-page">
      <div className="income-section">
        <h3>Income</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {income.map((item) => (
              <tr key={item.id}>
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
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => (
              <tr key={item.id}>
                <td>{item.category}</td>
                <td>{item.amount}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="budget-section">
        <p> budget Placeholder </p>
      </div>
    </div>
  );
}

export default Transactions;
