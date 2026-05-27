import express from "express";
import { users } from "../data.js";
import { authenticate, signToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  const { password: _, ...payload } = user;
  res.json({ user: payload, token });
});

router.post("/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (users.some(u => u.email === email)) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const newUser = {
    id: `merchant_${users.length + 1}`,
    email,
    password,
    name,
    role: "merchant"
  };
  users.push(newUser);

  const token = signToken(newUser);
  const { password: _, ...payload } = newUser;
  res.status(201).json({ user: payload, token });
});

router.get("/me", authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password: _, ...payload } = user;
  res.json({ user: payload });
});

export default router;
