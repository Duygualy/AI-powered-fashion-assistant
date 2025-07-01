const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const verifyToken = require("../middlewares/verifyToken");

const upload = multer({ dest: "uploads/" });

router.post("/validate", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const python = spawn("python", ["validate_outfit.py", imagePath]);
    let output = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("close", (code) => {
      const isValid = output.includes("true");
      fs.unlinkSync(imagePath); 
      res.json({ valid: isValid });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, error: "Validation error." });
  }
});

module.exports = router;
