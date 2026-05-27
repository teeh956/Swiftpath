import express from "express";
import { shipments } from "../data.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", (req, res) => {
  const merchantShipments = shipments.filter(s => s.merchantId === req.user.id);
  res.json(merchantShipments);
});

router.get("/:id", (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id && s.merchantId === req.user.id);
  if (!shipment) return res.status(404).json({ message: "Shipment not found" });
  res.json(shipment);
});

router.post("/", (req, res) => {
  const { customer, parcel, serviceTier, paymentMethod } = req.body;
  const id = `SWP-2025-${Math.floor(100000 + Math.random() * 900000)}`;
  const newShipment = {
    id,
    merchantId: req.user.id,
    customer,
    parcel,
    status: "created",
    eta: null,
    rider: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    codAmount: parcel?.value || 0,
    serviceTier,
    paymentMethod
  };
  shipments.push(newShipment);
  res.status(201).json(newShipment);
});

router.patch("/:id/status", (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id && s.merchantId === req.user.id);
  if (!shipment) return res.status(404).json({ message: "Shipment not found" });
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required" });
  shipment.status = status;
  shipment.updatedAt = new Date().toISOString();
  res.json(shipment);
});

router.put("/:id", (req, res) => {
  const shipment = shipments.find(s => s.id === req.params.id && s.merchantId === req.user.id);
  if (!shipment) return res.status(404).json({ message: "Shipment not found" });
  Object.assign(shipment, req.body, { updatedAt: new Date().toISOString() });
  res.json(shipment);
});

router.delete("/:id", (req, res) => {
  const index = shipments.findIndex(s => s.id === req.params.id && s.merchantId === req.user.id);
  if (index === -1) return res.status(404).json({ message: "Shipment not found" });
  shipments.splice(index, 1);
  res.status(204).end();
});

export default router;
