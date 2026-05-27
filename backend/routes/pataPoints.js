import express from "express";
import { pataPoints } from "../data.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  res.json(pataPoints);
});

router.get("/:id", (req, res) => {
  const point = pataPoints.find(p => p.id === req.params.id);
  if (!point) return res.status(404).json({ message: "Pata point not found" });
  res.json(point);
});

router.post("/:id/collect/:parcelId", (req, res) => {
  const point = pataPoints.find(p => p.id === req.params.id);
  if (!point) return res.status(404).json({ message: "Pata point not found" });

  const parcel = point.parcels.find(parcel => parcel.id === req.params.parcelId);
  if (!parcel) return res.status(404).json({ message: "Parcel not found" });
  if (parcel.collected) return res.status(400).json({ message: "Parcel already collected" });

  parcel.collected = true;
  res.json({ message: "Parcel marked collected", parcel });
});

router.get("/:id/earnings", (req, res) => {
  const point = pataPoints.find(p => p.id === req.params.id);
  if (!point) return res.status(404).json({ message: "Pata point not found" });

  const collectedCount = point.parcels.filter(parcel => parcel.collected).length;
  const totalEarnings = point.earningsToday;

  res.json({ id: point.id, name: point.name, estate: point.estate, collectedCount, totalEarnings });
});

export default router;
