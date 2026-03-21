import express from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import { analyzeImage, detectIssue } from "../services/aiService.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname || "").slice(0, 8) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    return cb(null, true);
  }
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.post("/diagnose", upload.single("image"), async (req, res) => {
  let imagePath = "";
  try {
    const description = String(req.body?.description || "").trim();
    imagePath = req.file?.path || "";

    if (!description && !imagePath) {
      return res.status(400).json({
        success: false,
        message: "Provide at least a description or an image."
      });
    }

    let caption = "";
    if (imagePath) {
      try {
        caption = await analyzeImage(imagePath);
      } catch (imageError) {
        console.warn("Image analysis warning:", imageError.message);
        if (!description) {
          throw new Error("Image could not be analyzed. Add description and try again.");
        }
      }
    }

    const mergedText = `${caption} ${description}`.trim();
    const result = detectIssue(mergedText);

    return res.json({
      success: true,
      caption,
      ...result
    });
  } catch (error) {
    const rawMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "AI analysis failed";
    const missingToken = /HF_TOKEN is missing/i.test(rawMessage);
    const needsDescription = /add description/i.test(rawMessage);
    const clientMessage = missingToken
      ? "Image analysis is unavailable right now. Add a text description and try again."
      : rawMessage;
    const statusCode = missingToken || needsDescription ? 400 : 500;

    console.error("Diagnosis route error:", rawMessage);
    return res.status(statusCode).json({
      success: false,
      message: clientMessage || "AI analysis failed",
      error: rawMessage
    });
  } finally {
    if (imagePath) {
      try {
        await fs.unlink(imagePath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
});

export default router;
