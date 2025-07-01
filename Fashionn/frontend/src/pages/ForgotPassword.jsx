import React, { useState } from "react";
import "../style/ForgotPassword.css"; 
import email_icon from "../assets/email_icon.png"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setShowPopup(true);
    setMessage("Sending request..."); 
    setError("");

    try {
        const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message);
            setError("");
        } else {
            setError(data.error || "There is an error!");
            setMessage("");
        }

    } catch (error) {
        setError("Network error!");
        setMessage("");
    }

    setTimeout(() => setShowPopup(false), 3000);
};


  return (
    <div className="container">
      <div className="forgot-header">
        <h2 className="forgot-text">Reset Password</h2>
        <div className="forgot-underline"></div>
      </div>

      <form onSubmit={handleSubmit} className="inputs">
        <div className="input">
          <img src={email_icon} alt="Email Icon" className="email-icon" />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn" disabled={!email.trim()}>
          Reset
        </button>
      </form>

      {showPopup && (message || error) && (
        <div className={`popupt ${message ? "success-popupt" : "error-popupt"}`}>
        {message || error}
      </div>
      )}

    </div>
  );
};

export default ForgotPassword;