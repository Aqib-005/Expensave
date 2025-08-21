import React from "react";
import '../styles/signup.css'

function Signup() {
  return (
    <div className="signup-content">
      <form className="signup-form">
        <p className="signup-intro"> Create an account </p>
        <div className="form-text">
          <label htmlFor="text">Full Name</label>
          <input type="text" placeholder="e.g. John Smith" />
        </div>
        <div className="form-text">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="example@email.com" />
        </div>
        <div className="form-text">
          <label htmlFor="password">Password</label>
          <input type="password" placeholder="enter password here" />
        </div>
        <div className="form-text">
          <label htmlFor="password">Confirm Password</label>
          <input type="password" placeholder="re-type your password" />
        </div>
        <button className="submit">Submit</button>
        <div className="old-user">
          Already have an account? Log in <a href="/login">here</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
