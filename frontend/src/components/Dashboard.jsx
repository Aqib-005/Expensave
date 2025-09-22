import React, { useEffect, useState } from "react";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

function Dashboard({ onViewTransactions }) {
  const API_URL = config.API_URL;
  const { user } = useAuth();

  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#FF4444", "#8884D8", "#82CA9D"];

  // Fetch data
  const fetchIncome = () => {
    if (!user) return;
    fetch(`${API_URL}/transactions/income/${user.userID}?month=${currentMonth}&year=${currentYear}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIncome(data))
      .catch((err) => console.error("Error fetching income:", err));
  };

  const fetchExpenses = () => {
    if (!user) return;
    fetch(`${API_URL}/transactions/expenses/${user.userID}?month=${currentMonth}&year=${currentYear}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Error fetching expenses:", err));
  };

  const fetchBudgets = () => {
    if (!user) return;
    fetch(`${API_URL}/budgets/${user.userID}/progress?month=${currentMonth}&year=${currentYear}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setBudgets(data))
      .catch((err) => console.error("Error fetching budgets:", err));
  };

  const fetchTrends = () => {
    if (!user) return;
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    Promise.all(
      months.map((m) =>
        Promise.all([
          fetch(`${API_URL}/transactions/income/${user.userID}?month=${m.month}&year=${m.year}`, { credentials: "include" })
            .then((res) => res.json())
            .catch(() => []),
          fetch(`${API_URL}/transactions/expenses/${user.userID}?month=${m.month}&year=${m.year}`, { credentials: "include" })
            .then((res) => res.json())
            .catch(() => []),
        ]).then(([inc, exp]) => ({
          name: `${new Date(m.year, m.month - 1).toLocaleString("en-US", { month: "short" })}`,
          income: inc.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
          expenses: exp.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        }))
      )
    ).then((results) => setTrendData(results));
  };

  useEffect(() => {
    fetchIncome();
    fetchExpenses();
    fetchBudgets();
    fetchTrends();
  }, [user]);

  const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;

  const categoryData = Object.values(
    expenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { name: t.category, value: 0 };
      }
      acc[t.category].value += parseFloat(t.amount || 0);
      return acc;
    }, {})
  );

  return (
    <div className="dashboard">
      {user ? (
        <>
          <div className="dashboard-header">
            <h2>Dashboard</h2>
            <Link href='/transactions' className='btn btn-outline'> View Transactions </Link>
          </div>

          <div className="dashboard-grid">
            <div className="card summary-card">
              <h3>Monthly Summary</h3>
              <p><strong>Income:</strong> ${totalIncome.toFixed(2)}</p>
              <p><strong>Expenses:</strong> ${totalExpenses.toFixed(2)}</p>
              <p><strong>Net Savings:</strong> ${netSavings.toFixed(2)}</p>
              <p><strong>Savings Rate:</strong> {totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0}%</p>
            </div>

            {/* Budgets */}
            <div className="card budgets-card">
              <h3>Budgets Progress</h3>
              {budgets.length > 0 ? (
                budgets.map((b) => {
                  const spent = b.spent ?? 0;
                  const limit = b.limit ?? b.limit_amount ?? 0;
                  const remaining = (limit - spent).toFixed(2);
                  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                  return (
                    <div key={b.budgetid} className="budget-item">
                      <p>{b.category}: ${spent.toFixed(2)} / ${limit.toFixed(2)}</p>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{
                            width: `${percent}%`,
                            backgroundColor:
                              percent < 80 ? "var(--green)" : percent < 100 ? "var(--orange)" : "var(--red)",
                          }}
                        ></div>
                      </div>
                      <small>{remaining >= 0 ? `$${remaining} left` : `Over by $${Math.abs(remaining)}`}</small>
                    </div>
                  );
                })
              ) : (
                <p>No budgets set this month.</p>
              )}
            </div>

            {/* Spending Breakdown */}
            <div className="card chart-card">
              <h3>Spending by Category</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No expenses to show.</p>
              )}
            </div>

            {/* Trends */}
            <div className="card chart-card">
              <h3>Income vs Expenses (6 months)</h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#0088FE" name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#FF4444" name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No trend data available.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  );
}

export default Dashboard;

