import express from "express";
import { analytics } from "../data.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/dashboard", (req, res) => {
  res.json(analytics.summary);
});

router.get("/volume", (req, res) => {
  const range = Number(req.query.range) || 30;
  const sanitizedRange = Math.max(1, Math.min(range, analytics.volume.length));
  res.json(analytics.volume.slice(-sanitizedRange));
});

router.get("/zones", (req, res) => {
  res.json(analytics.zones);
});

router.get("/revenue", (req, res) => {
  res.json(analytics.revenue);
});

router.get("/all", (req, res) => {
  res.json(analytics);
});

export default router;
