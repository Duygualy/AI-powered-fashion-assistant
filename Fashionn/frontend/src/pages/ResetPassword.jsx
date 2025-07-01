import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../style/ResetPasword.css";

import password_icon from "../assets/password_icon.png";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match!");
            setMessage("");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Password reset successful.");
                setError("");
            } else {
                setError(data.error || "Something went wrong.");
                setMessage("");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
            setMessage("");
        }

        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
    };

    useEffect(() => {
        document.title = "🎀 AI Fashion Assistant";
    }, []);

    return (
        <div className="container">
            <div className="reset-header">
                <div className="reset-text">
                    <h2>Password Reset</h2>
                </div>
                <div className="reset-underline" />
            </div>

            <form onSubmit={handleResetPassword} className="inputs">
                <div className="input">
                    <img src={password_icon} alt="Password Icon" />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="input">
                    <img src={password_icon} alt="Password Icon" />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn">Reset</button>
            </form>

            {showPopup && (
                <div className={`popupr ${message ? "success-popupr" : "error-popupr"}`}>
                    {message || error}
                </div>
            )}
        </div>
    );
};

export default ResetPassword;