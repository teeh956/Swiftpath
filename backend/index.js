import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipments.js";
import pataPointsRoutes from "./routes/pataPoints.js";
import analyticsRoutes from "./routes/analytics.js";
import trackingRoutes from "./routes/tracking.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URLS = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:5173"];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      callback(null, true);
    } else {
      const allowed = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [];
      if (allowed.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "SwiftPath Backend API is running" });
});

app.use("/auth", authRoutes);
app.use("/shipments", shipmentRoutes);
app.use("/pata-points", pataPointsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/track", trackingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`SwiftPath backend running on http://localhost:${PORT}`);
});
