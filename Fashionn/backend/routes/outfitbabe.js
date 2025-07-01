const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const verifyToken = require("../middlewares/verifyToken");
const pool = require("../db");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

router.post("/upload", verifyToken, upload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const userId = req.user.id;
    const imageUrl = `/uploads/${req.files.image[0].filename}`;
    const category = req.body.category;

    const [rows] = await pool.query(
      "INSERT INTO user_outfits (user_id, image_url) VALUES (?, ?)",
      [userId, imageUrl]
    );

    const outfitId = rows.insertId;

    if (category) {
      await pool.query(
        "INSERT INTO outfit_styles (outfit_id, style_name) VALUES (?, ?)",
        [outfitId, category]
      );
    }

    const imagePath = path.join(__dirname, "..", "uploads", req.files.image[0].filename);
    const pythonProcess = spawn("python", [
        "C:\\Users\\Duygu\\Desktop\\Fashion\\backend\\FashionClip2\\add_user_outfit_embedding.py",

      outfitId,
      imagePath
    ]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Embedding stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Embedding stderr: ${data}`);
    });

    pythonProcess.on("close", async (code) => {
      console.log(`Embedding process exited with code ${code}`);
      await fetch("http://127.0.0.1:8001/refresh-user-outfits-index", {
        method: "POST"
      });

      res.status(200).json({ message: "Outfit uploaded and embedding indexed successfully!" });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});


router.get("/user-outfits", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [outfits] = await pool.query(
      `SELECT 
         uo.id AS outfit_id, 
         uo.image_url,
         uo.created_at,
         os.style_name
       FROM user_outfits uo
       LEFT JOIN outfit_styles os ON uo.id = os.outfit_id
       WHERE uo.user_id = ?
       ORDER BY uo.created_at DESC`,
      [userId]
    );    

    res.status(200).json(outfits);

  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

router.delete("/delete-outfit/:outfitId", verifyToken, async (req, res) => {
  try {
    const outfitId = req.params.outfitId;
    const userId = req.user.id;

    const [outfit] = await pool.query(
      "SELECT * FROM user_outfits WHERE id = ? AND user_id = ?",
      [outfitId, userId]
    );

    if (outfit.length === 0) {
      return res.status(404).json({ error: "Outfit not found or unauthorized." });
    }

    const imagePath = path.join(__dirname, "..", "uploads", path.basename(outfit[0].image_url));

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } 

    await pool.query(
      "DELETE FROM outfit_styles WHERE outfit_id = ?",
      [outfitId]
    );

    await pool.query(
      "DELETE FROM user_outfits WHERE id = ?",
      [outfitId]
    );

    res.status(200).json({ message: "Outfit deleted successfully!" });

  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;