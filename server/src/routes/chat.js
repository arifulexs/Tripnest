import { Router } from "express";
import ChatMessage from "../models/ChatMessage.js";
import Trip from "../models/Trip.js";
import { requireAuth, loadTripForMember } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/:tripId/chat", loadTripForMember(Trip), async (req, res) => {
  const messages = await ChatMessage.find({ trip: req.params.tripId })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("user", "name avatarColor");
  res.json({ messages });
});

router.post("/:tripId/chat", loadTripForMember(Trip), async (req, res) => {
  const { content, type, meta } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Message can't be empty." });

  const message = await ChatMessage.create({
    trip: req.params.tripId,
    user: req.userId,
    type: type || "text",
    content: content.trim(),
    meta: meta || null,
  });
  await message.populate("user", "name avatarColor");

  req.app.get("io")?.to(`trip:${req.params.tripId}`).emit("chat:message", message);
  res.status(201).json({ message });
});

export default router;
