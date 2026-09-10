import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const AVATAR_COLORS = ["#2D6A4F", "#74A892", "#F0A868", "#1B4332", "#B08968"];

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: "Name, email and password are all required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password needs to be at least 6 characters." });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  });
  await user.setPassword(password);
  await user.save();

  res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  if (!user || !(await user.checkPassword(password || ""))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: user.toSafeJSON() });
});

export default router;
