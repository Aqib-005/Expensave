import React from "react";
import "../styles/homepage.css";
import { useAuth } from "./AuthContext.jsx";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

function HomePage() {
  const { user, loading } = useAuth();

  const demoData = [
    { name: "Essentials", value: 50 },
    { name: "Wants", value: 30 },
    { name: "Savings", value: 20 },
  ];
  const COLORS = ["#0088FE", "#FF8042", "#00C49F"];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome {user ? user.username : "to Expensave"} 👋</h1>
        <p className="tagline">
          Track your money, stay on top of your budgets, and make smarter financial decisions.
        </p>
        <div className="cta-buttons">
          {user ? (
            <>
              <a className="btn btn-primary" href="/dashboard">Go to Dashboard</a>
              <a className="btn btn-outline" href="/transactions">View Transactions</a>
            </>
          ) : (
            <>
              <a href="/signup" className="btn btn-primary">Get Started</a>
              <a href="/login" className="btn btn-outline">Log In</a>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Expensave?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>💰 Track Expenses</h3>
            <p>Easily log your daily income and expenses, all in one place.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Budget Smarter</h3>
            <p>Set monthly budgets and see how much you’ve spent so far.</p>
          </div>
          <div className="feature-card">
            <h3>📈 Visual Insights</h3>
            <p>Understand your habits with charts and monthly summaries.</p>
          </div>
          <div className="feature-card">
            <h3>🎯 Stay on Track</h3>
            <p>Stay motivated and reach your savings goals faster.</p>
          </div>
        </div>
      </section>

      <section className="demo-visual">
        <h2>See where your money goes</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={demoData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {demoData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

export default HomePage;

