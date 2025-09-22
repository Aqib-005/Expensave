import React from "react";
import "../styles/homepage.css";
import { useAuth } from "./AuthContext.jsx";

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
              <Link className="btn btn-primary" href="/dashboard">Go to Dashboard</Link>
              <Link className="btn btn-outline" href="/transactions">View Transactions</Link>
            </>
          ) : (
            <>
              <Link href="/signup" className="btn btn-primary">Get Started</Link>
              <Link href="/login" className="btn btn-outline">Log In</Link>
            </>
          )}
        </div>
      </section>

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
    </div>
  );
}

export default HomePage;

