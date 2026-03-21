import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import diagnoseRoute from "./routes/diagnose.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const uploadsDir = path.resolve("uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*"
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Worklow Smart Home AI Backend",
    status: "running",
    endpoints: ["/api/health", "/api/diagnose"]
  });
});

app.use("/api", diagnoseRoute);

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
