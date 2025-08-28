import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import config from "./config.json";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = config.API_URL;

  const validatePassword = (pwd) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(pwd);
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }


    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('${API_URL}/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      alert("Signup successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-content">
      <form className="signup-form" onSubmit={handleSubmit}>
        <p className="signup-intro">Create an account</p>

        {error && <p className="error-message">{error}</p>}

        <div className="form-text">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. John Smith"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

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
            placeholder="Enter password here"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-text">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-type your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button className="submit" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Submit"}
        </button>

        <div className="social-login">
          <a className="social-button social-google" href="http://localhost:3000/auth/google">
            <FcGoogle size={20} />
            Google
          </a>

          <a className="social-button social-github" href="http://localhost:3000/auth/github">
            <FaGithub size={20} />
            GitHub
          </a>
        </div>

        <div className="old-user">
          Already have an account? <a href="/login">Log in </a>
        </div>
      </form>
    </div>
  );
}

export default Signup;

