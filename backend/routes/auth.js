import express from "express";
import { findUserByEmail, createUser, findUserById } from "../db.js";
import { authenticate, signToken } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  const { password: _, ...payload } = user;
  res.json({ user: payload, token });
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (await findUserByEmail(email)) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = {
    id: `merchant_${nanoid(8)}`,
    email,
    password: hashed,
    name,
    role: "merchant"
  };

  await createUser(newUser);

  const token = signToken(newUser);
  const { password: _, ...payload } = newUser;
  res.status(201).json({ user: payload, token });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password: _, ...payload } = user;
  res.json({ user: payload });
});

export default router;
