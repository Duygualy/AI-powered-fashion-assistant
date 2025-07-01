const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "clothes_upload"); 
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/upload-home-image", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  res.json({ filename: req.file.filename });
});

module.exports = router;
