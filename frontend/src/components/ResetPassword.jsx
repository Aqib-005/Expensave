import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import '../styles/resetpassword.css';
import config from "./config.json";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const API_URL = config.API_URL;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('${API_URL}/auth/resetpassword', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Reset failed");
      }
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Invalid reset link</p>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <form onSubmit={handleSubmit} className="reset-card">
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="reset-input"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="reset-input"
        />
        <button type="submit" disabled={loading} className="reset-btn">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {message && <p className="reset-message">{message}</p>}
      </form>
    </div>
  );
}
export default ResetPassword;
