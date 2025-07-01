const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middlewares/verifyToken");

router.get("/suggestions", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT 
        uo.id AS outfit_id,
        uo.image_url,
        uo.created_at,
        os.style_name,
        us.username,
        (
          SELECT COUNT(*) FROM user_saved_outfits so 
          WHERE so.outfit_id = uo.id AND so.is_saved = 1
        ) AS saved_count,
        IFNULL((
          SELECT is_saved FROM user_saved_outfits so 
          WHERE so.outfit_id = uo.id AND so.user_id = ?
        ), 0) AS is_saved
      FROM user_outfits uo
      JOIN outfit_styles os ON os.outfit_id = uo.id
      JOIN users us ON uo.user_id = us.id
      ORDER BY uo.created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

router.post("/outfits/:outfitId/toggle-save", verifyToken, async (req, res) => {
  const outfitId = req.params.outfitId;
  const userId = req.user.id;

  try {
    const [exists] = await db.query(
      "SELECT * FROM user_saved_outfits WHERE outfit_id = ? AND user_id = ?",
      [outfitId, userId]
    );

    if (exists.length > 0) {
      const newState = exists[0].is_saved === 1 ? 0 : 1;

      await db.query(
        "UPDATE user_saved_outfits SET is_saved = ? WHERE outfit_id = ? AND user_id = ?",
        [newState, outfitId, userId]
      );

      return res.json({
        message: newState === 1 ? "Saved" : "Removed",
        is_saved: newState,
      });
    } else {
      await db.query(
        "INSERT INTO user_saved_outfits (outfit_id, user_id, is_saved) VALUES (?, ?, 1)",
        [outfitId, userId]
      );

      return res.json({
        message: "Saved",
        is_saved: 1,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;