import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/login.css';
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = config.API_URL;
  const { setUser } = useAuth();   // ✅ get setUser from context

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to login");

      // ✅ fetch user details right after login
      const meRes = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });
      const userData = await meRes.json();

      if (meRes.ok) {
        setUser(userData);  // update context immediately
      }

      navigate("/dashboard"); // ✅ typo fixed
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-content">
      <form className="login-form" onSubmit={handleSubmit}>
        <p className="login-intro">Please login to continue...</p>

        {error && <p className="error-message">{error}</p>}

        <div className="form-text">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-text">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button className="submit" type="submit">Submit</button>

        <div className="social-login">
          <a className="social-button social-google" href="http://localhost:3000/auth/google">
            <FcGoogle size={20} /> Google
          </a>
          <a className="social-button social-github" href="http://localhost:3000/auth/github">
            <FaGithub size={20} /> GitHub
          </a>
        </div>

        <div className="new-user"><a href="/forgotpassword">Forgot Password?</a></div>
        <div className="new-user">
          Don't have an account? <a href="/signup">Sign-Up</a>
        </div>
      </form>
    </div>
  );
}

export default Login;

