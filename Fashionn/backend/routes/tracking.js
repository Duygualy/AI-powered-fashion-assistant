const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.post("/price-tracking", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id, min_price, max_price } = req.body;

  try {
    await pool.query(
      "INSERT INTO price_tracking (user_id, product_id, min_price, max_price) VALUES (?, ?, ?, ?)",
      [userId, product_id, min_price, max_price]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/stock-tracking", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id, availability } = req.body;

  const validStocks = ["in_stock", "out_of_stock", "low_on_stock"];
  if (!validStocks.includes(availability)) {
    return res.status(400).json({ error: "Invalid or missing availability value." });
  }

  try {
    await pool.query(
      "INSERT INTO stock_tracking (user_id, product_id, last_known_stock) VALUES (?, ?, ?)",
      [userId, product_id, availability]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/stock-tracking/:product_id/stop", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.product_id;

  try {
    await pool.query(
      "DELETE FROM stock_tracking WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/price-tracking/:product_id/stop", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.product_id;


  try {
    const [result] = await pool.query(
      "DELETE FROM price_tracking WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/tracking/delete-all/:product_id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.product_id;

  try {
    await pool.query("DELETE FROM stock_tracking WHERE user_id = ? AND product_id = ?", [userId, productId]);
    await pool.query("DELETE FROM price_tracking WHERE user_id = ? AND product_id = ?", [userId, productId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Tracking couldn't deleted" });
  }
});

module.exports = router;