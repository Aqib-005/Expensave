import React from "react";
import { useState } from "react";
import '../styles/forgotpassword.css';
import config from "./config.json";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = config.API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch('${API_URL}/auth/forgotpassword', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form onSubmit={handleSubmit} className="forgot-card">
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="forgot-input"
        />
        <button type="submit" disabled={loading} className="forgot-btn">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && <p className="forgot-message">{message}</p>}
      </form>
    </div>
  );
}

export default ForgotPassword;
