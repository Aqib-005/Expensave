import React from "react";
import '../styles/login.css';

function Login() {
  return (
    <div className="login-content">
      <form className="login-form">
        <p className="login-intro">Please login to continue...</p>
        <div className="form-text">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="example@email.com" />
        </div>
        <div className="form-text">
          <label htmlFor="password">Password</label>
          <input type="password" placeholder="Enter your password" />
        </div>
        <button className="submit">Submit</button>
        <div className="new-user">
          Don't have an account? Sign up <a href="/signup">here</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
