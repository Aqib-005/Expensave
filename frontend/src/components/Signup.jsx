import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies
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
      navigate("/login"); // redirect after signup
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

        <div className="old-user">
          Already have an account? <a href="/login">Log in here</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;

