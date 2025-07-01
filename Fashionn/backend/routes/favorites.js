const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.get("/favorites", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      "SELECT product_id FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    const favoriteIds = rows.map(row => row.product_id);
    res.json(favoriteIds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

module.exports = router;