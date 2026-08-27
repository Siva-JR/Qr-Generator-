const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const File = require("../models/File");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileId = crypto.randomBytes(16).toString("hex");

    const newFile = await File.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileId: fileId
    });

   const fileUrl = `http://10.1.17.48:3001/uploads/${encodeURIComponent(req.file.filename)}`;

res.status(201).json({
  message: "File uploaded successfully",
  file: newFile,
  fileUrl,
});
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
router.get("/:fileId", async (req, res) => {
  try {
    const file = await File.findOne({
      fileId: req.params.fileId,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});