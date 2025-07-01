const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../db.js");  
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const verifyToken = require("../middlewares/verifyToken"); 

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM users WHERE email = ? OR username = ?", [email, username]);
        if (results.length > 0) {
            return res.status(400).json({
                error: results[0].email === email 
                    ? "This e-mail is already in use!" 
                    : "This username is already in use!"
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
        res.json({ message: "Register successful!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Network error!" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (results.length === 0) {
            return res.status(401).json({ error: "User not found!" });
        }

        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Wrong password!" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ message: "Login successful!", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Network error!" });
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-ğüşıöçĞÜŞİÖÇ]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid e-mail format!" });
    }

    try {
        const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (results.length === 0) {
            return res.status(404).json({ error: "This e-mail isn't registered!" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expireTime = Math.floor((Date.now() + 3600000) / 1000);

        await db.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [resetToken, expireTime, email]);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `
                <p>Click on the link below to reset your password:</p>
                <a href="http://localhost:5173/reset-password?token=${resetToken}">Please click here!</a>
                <p>This link is valid for 1 hour.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset link has been sent to your e-mail!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error!" });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?", [token, Math.floor(Date.now() / 1000)]);
        if (results.length === 0) {
            return res.status(400).json({ error: "Token is invalid!" });
        }

        const userId = results[0].id;
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await db.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hashedPassword, userId]);
        res.json({ message: "Your password has been successfully reset!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Your password couldn't be reset!" });
    }
});

router.get("/verify", verifyToken, (req, res) => {
    res.json({ message: "Valid token!", user: req.user });
});

module.exports = router;