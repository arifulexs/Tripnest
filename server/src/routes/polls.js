import { Router } from "express";
import Poll from "../models/Poll.js";
import Trip from "../models/Trip.js";
import { requireAuth, loadTripForMember } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const withTrip = loadTripForMember(Trip);

router.get("/:tripId/polls", withTrip, async (req, res) => {
  const polls = await Poll.find({ trip: req.params.tripId }).sort({ createdAt: -1 });
  res.json({ polls });
});

router.post("/:tripId/polls", withTrip, async (req, res) => {
  const { question, options } = req.body;
  const cleanOptions = (options || []).map((text) => String(text).trim()).filter(Boolean);
  if (!question?.trim() || cleanOptions.length < 2) {
    return res.status(400).json({ error: "A poll needs a question and at least two options." });
  }

  const poll = await Poll.create({
    trip: req.params.tripId,
    createdBy: req.userId,
    question: question.trim(),
    options: cleanOptions.map((text) => ({ text, votes: [] })),
  });

  req.app.get("io")?.to(`trip:${req.params.tripId}`).emit("poll:created", poll);
  res.status(201).json({ poll });
});

router.post("/:tripId/polls/:pollId/vote", withTrip, async (req, res) => {
  const poll = await Poll.findOne({ _id: req.params.pollId, trip: req.params.tripId });
  if (!poll) return res.status(404).json({ error: "Poll not found." });
  if (poll.closed) return res.status(400).json({ error: "This poll is closed." });

  const { optionIndex } = req.body;
  const option = poll.options[optionIndex];
  if (!option) return res.status(400).json({ error: "That option doesn't exist." });

  // A person can only have one active vote per poll.
  for (const opt of poll.options) {
    opt.votes = opt.votes.filter((v) => v.toString() !== req.userId);
  }
  option.votes.push(req.userId);

  await poll.save();
  req.app.get("io")?.to(`trip:${req.params.tripId}`).emit("poll:updated", poll);
  res.json({ poll });
});

router.patch("/:tripId/polls/:pollId/close", withTrip, async (req, res) => {
  const poll = await Poll.findOne({ _id: req.params.pollId, trip: req.params.tripId });
  if (!poll) return res.status(404).json({ error: "Poll not found." });
  poll.closed = true;
  await poll.save();
  req.app.get("io")?.to(`trip:${req.params.tripId}`).emit("poll:updated", poll);
  res.json({ poll });
});

export default router;
