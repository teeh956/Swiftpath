import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(DB_FILE, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    throw err;
  }
}

async function writeUsers(users) {
  await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find(u => u.email === email) || null;
}

export async function findUserById(id) {
  const users = await readUsers();
  return users.find(u => u.id === id) || null;
}

export async function createUser({ id, email, password, name, role = "merchant" }) {
  const users = await readUsers();
  const user = { id, email, password, name, role };
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function listUsers() {
  return await readUsers();
}

async function seedDemoUserIfEmpty() {
  try {
    const users = await readUsers();
    if (users.length === 0 && process.env.SEED_DEMO !== "false") {
      const demoEmail = "merchant@swiftpath.ke";
      const demoPassword = "password123";
      const hashed = await bcrypt.hash(demoPassword, 10);
      const demo = {
        id: `merchant_${nanoid(8)}`,
        email: demoEmail,
        password: hashed,
        name: "Demo Merchant",
        role: "merchant"
      };
      users.push(demo);
      await writeUsers(users);
      console.log("Seeded demo user:", demoEmail);
    }
  } catch (err) {
    console.error("Error seeding demo user:", err);
  }
}

// Seed on first import
seedDemoUserIfEmpty();
