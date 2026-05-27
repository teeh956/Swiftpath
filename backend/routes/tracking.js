import express from "express";
import { shipments } from "../data.js";

const router = express.Router();

router.get("/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const shipment = shipments.find(s => s.id.toUpperCase() === code);
  if (!shipment) return res.status(404).json({ message: "Shipment not found" });

  res.json({
    id: shipment.id,
    status: shipment.status,
    eta: shipment.eta,
    customer: shipment.customer,
    parcel: shipment.parcel,
    rider: shipment.rider,
    updatedAt: shipment.updatedAt
  });
});

export default router;
