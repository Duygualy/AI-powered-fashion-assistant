import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LogIn.css";

import user_icon from "../assets/user_icon.png";
import email_icon from "../assets/email_icon.png";
import password_icon from "../assets/password_icon.png";

const LogIn = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState("Log In");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isLoginDisabled = !email || !password;
  const isSignUpDisabled = !username || !email || !password || !confirmPassword;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      setTimeout(() => setError(""), 1500);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/home", { replace: true });
      } else {
        setError(data.error || "Login failed!");
        setTimeout(() => setError(""), 2000);
      }
      } catch (error) {
        setError("Network error!");
        setTimeout(() => setError(""), 2000);
      }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords doesn't match!");
      setTimeout(() => setError(""), 1500);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address!");
      setTimeout(() => setError(""), 1500);
      return;
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setAction("Log In");
        },2000);
      } else {
        setError(data.error || "An error occurred!");
        setTimeout(() => setError(""), 2000);
      }
    } catch (error) {
      setError("Network error!");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <>
      {error && (
        <div className="popup error-popup">
          {error}
        </div>
      )}

      {success && action === "Sign Up" && (
        <div className="popup success-popup">
          🎉 Account created successfully! <br />
          Redirecting to login page...
        </div>
      )}

      <div className="container">
        <div className="header">
          <div className="text">{action}</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          {action === "Sign Up" && (
            <div className="input">
              <img src={user_icon} alt="User Icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="input">
            <img src={email_icon} alt="Email Icon" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input">
            <img src={password_icon} alt="Password Icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {action === "Sign Up" && (
            <div className="input">
              <img src={password_icon} alt="Confirm Password Icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {action === "Log In" && (
            <>
              <div className="password-toggle">
                Forgot your password? {" "}
                <span onClick={() => navigate("/forgot-password")}> Click Here!</span>
              </div>

              <div className="signup-toggle">
                Don't have an account? {" "}
                <span onClick={() => setAction("Sign Up")}> Click Here!</span>
              </div>
            </>
          )}
        </div>

        {action === "Log In" ? (
          <button
            className="btn"
            onClick={handleLogin}
            disabled={isLoginDisabled}
          >
            Log In
          </button>
        ) : (
          <button
            className="btn"
            onClick={handleSignUp}
            disabled={isSignUpDisabled}
          >
            Sign Up
          </button>
        )}
      </div>
    </>
  );
};

export default LogIn;