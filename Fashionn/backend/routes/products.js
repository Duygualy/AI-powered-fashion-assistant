const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.get("/products", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { category, color, min, max, name } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT 
         p.*, 
         pt.min_price,
         pt.max_price,
         pt.max_price AS target_price, 
         IF(pt.product_id IS NOT NULL, 1, 0) AS is_discount_tracked,
         IF(st.product_id IS NOT NULL, 1, 0) AS is_stock_tracked
       FROM products p
       LEFT JOIN price_tracking pt ON p.id = pt.product_id AND pt.user_id = ?
       LEFT JOIN stock_tracking st ON p.id = st.product_id AND st.user_id = ?
       WHERE 1=1
         AND (? IS NULL OR p.category = ?)
         AND (? IS NULL OR p.color = ?)
         AND (? IS NULL OR p.sale_price >= ?)
         AND (? IS NULL OR p.sale_price <= ?)
         AND (? IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', ?, '%')))
      `,
      [
        userId, userId,
        category || null, category || null,
        color || null, color || null,
        min || null, min || null,
        max || null, max || null,
        name || null, name || null
      ]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/products/favorites/:productId/toggle-favorite", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM user_favorites WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    let is_favorited = 1;

    if (rows.length > 0) {
      const current = rows[0].is_favorited === 1 ? 0 : 1;
      await pool.query(
        "UPDATE user_favorites SET is_favorited = ?, created_at = NOW() WHERE user_id = ? AND product_id = ?",
        [current, userId, productId]
      );
      is_favorited = current;
    } else {
      await pool.query(
        "INSERT INTO user_favorites (user_id, product_id, is_favorited, created_at) VALUES (?, ?, 1, NOW())",
        [userId, productId]
      );
    }

    res.json({ success: true, is_favorited });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/products/favorites/list", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      "SELECT product_id FROM user_favorites WHERE user_id = ? AND is_favorited = 1 ORDER BY created_at DESC",
      [userId]
    );

    const favoriteIds = rows.map((row) => row.product_id);
    res.json(favoriteIds);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;