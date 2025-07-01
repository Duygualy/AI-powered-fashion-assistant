const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const pool = require("../db");

router.get("/saved-outfits", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [savedOutfits] = await pool.query(
      `SELECT 
         uo.id AS outfit_id,
         uo.image_url,
         uo.created_at,
         os.style_name,
         u.username,
         (
           SELECT COUNT(*) 
           FROM user_saved_outfits 
           WHERE outfit_id = uo.id AND is_saved = 1
         ) AS saved_count
       FROM user_saved_outfits uso
       JOIN user_outfits uo ON uso.outfit_id = uo.id
       LEFT JOIN outfit_styles os ON uo.id = os.outfit_id
       LEFT JOIN users u ON uo.user_id = u.id
       WHERE uso.user_id = ? AND uso.is_saved = 1
       ORDER BY uso.created_at DESC`,
      [userId]
    );

    res.status(200).json(savedOutfits);
  } catch (error) {
    console.error("Error fetching saved outfits:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;