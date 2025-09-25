import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "./config.json";
import { useAuth } from "./AuthContext.jsx";
import "../styles/settings.css";

function Settings() {
  const API_URL = config.API_URL;
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const checkPasswordStrength = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password) return "";
    if (password.length < 8) return "Too short";
    if (!strongRegex.test(password)) return "Weak (needs upper, lower, number & symbol)";
    return "Strong";
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          currentPassword: currentPassword || null,
          newPassword: newPassword || null,
          confirmPassword: confirmPassword || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUser(data);
      setMessage("Account updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      setUser(null);
      window.location.href = "/";
    } catch (err) {
      setMessage("Error deleting account");
    }
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>

      <form onSubmit={handleUpdate} className="settings-form">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input type="email" value={user?.email || ""} readOnly />

        <hr />

        <h3>Change Password</h3>
        <label>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
        />

        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
        />
        {passwordStrength && (
          <p
            className={`strength ${passwordStrength === "Strong" ? "strong" : "weak"
              }`}
          >
            {passwordStrength}
          </p>
        )}

        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
        />

        <div className="forgot-password-link">
          <Link to="/forgotpassword">Forgot your password?</Link>
        </div>

        <button type="submit" className="btn btn-outline">Update</button>
      </form>

      <div className="delete-section">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn btn-danger"
        >
          Delete Account
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Are you sure?</h3>
            <p>This action will permanently delete your account and all your data.</p>
            <div className="popup-actions">
              <button onClick={handleDelete} className="btn btn-danger">
                Yes, delete my account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default Settings;

