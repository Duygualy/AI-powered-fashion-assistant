const express = require("express");
const router = express.Router();
const pool = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.get("/notifications", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ?`,
    [userId]
  );

  res.json({ data: rows, total: count, page, totalPages: Math.ceil(count / limit) });
});


router.post("/notifications/:id/read", verifyToken, async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = ?",
    [id]
  );

  res.json({ success: true });
});

router.get("/notifications/unread-count", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );

  res.json({ count: rows[0].count });
});

module.exports = router;
