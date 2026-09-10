import { Router } from "express";
import Trip from "../models/Trip.js";
import User from "../models/User.js";
import { requireAuth, loadTripForMember } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const withTrip = loadTripForMember(Trip);

function emitTripUpdate(req, trip) {
  req.app.get("io")?.to(`trip:${trip._id}`).emit("trip:updated", trip);
}

async function populateMembers(trip) {
  await trip.populate("members.user", "name email avatarColor");
  await trip.populate("owner", "name email avatarColor");
  return trip;
}

/* ---------------------------- Trip CRUD ---------------------------- */

router.get("/", async (req, res) => {
  const trips = await Trip.find({ "members.user": req.userId })
    .sort({ updatedAt: -1 })
    .select("title destination startDate endDate tripType coverPhoto status travelers members");
  res.json({ trips });
});

router.post("/", async (req, res) => {
  const { title, destination, startDate, endDate, travelers, tripType, coverPhoto, description } = req.body;
  if (!title?.trim() || !destination?.trim()) {
    return res.status(400).json({ error: "A title and destination are required." });
  }

  const trip = await Trip.create({
    owner: req.userId,
    members: [{ user: req.userId, role: "owner" }],
    title: title.trim(),
    destination: destination.trim(),
    startDate,
    endDate,
    travelers: travelers || 1,
    tripType: tripType || "solo",
    coverPhoto: coverPhoto || "",
    description: description || "",
    status: "draft",
    budget: {
      currency: req.body.currency || "USD",
      categories: ["transportation", "hotel", "food", "activities", "shopping", "tickets", "misc"].map((name) => ({
        name,
        planned: 0,
      })),
    },
  });

  res.status(201).json({ trip });
});

router.get("/:tripId", withTrip, async (req, res) => {
  await populateMembers(req.trip);
  res.json({ trip: req.trip });
});

router.patch("/:tripId", withTrip, async (req, res) => {
  const editable = [
    "title",
    "destination",
    "startDate",
    "endDate",
    "travelers",
    "tripType",
    "coverPhoto",
    "description",
    "status",
  ];
  for (const key of editable) {
    if (key in req.body) req.trip[key] = req.body[key];
  }
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.delete("/:tripId", withTrip, async (req, res) => {
  if (req.member.role !== "owner") {
    return res.status(403).json({ error: "Only the trip owner can delete this trip." });
  }
  await req.trip.deleteOne();
  res.status(204).send();
});

router.post("/join/:inviteCode", async (req, res) => {
  const trip = await Trip.findOne({ inviteCode: req.params.inviteCode });
  if (!trip) return res.status(404).json({ error: "That invite link isn't valid." });

  const already = trip.members.some((m) => m.user.toString() === req.userId);
  if (!already) {
    trip.members.push({ user: req.userId, role: "editor" });
    await trip.save();
    const user = await User.findById(req.userId);
    req.app.get("io")?.to(`trip:${trip._id}`).emit("chat:system", {
      content: `${user.name} joined the trip`,
    });
  }
  res.json({ trip });
});

/* ---------------------------- Itinerary ---------------------------- */

router.post("/:tripId/itinerary/days", withTrip, async (req, res) => {
  const dayNumber = req.trip.itinerary.length
    ? Math.max(...req.trip.itinerary.map((d) => d.dayNumber)) + 1
    : 1;
  req.trip.itinerary.push({ dayNumber, date: req.body.date, items: [] });
  req.trip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.delete("/:tripId/itinerary/days/:dayNumber", withTrip, async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  req.trip.itinerary = req.trip.itinerary.filter((d) => d.dayNumber !== dayNumber);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

function findDay(trip, dayNumber) {
  return trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
}

router.post("/:tripId/itinerary/days/:dayNumber/items", withTrip, async (req, res) => {
  const day = findDay(req.trip, req.params.dayNumber);
  if (!day) return res.status(404).json({ error: "That day doesn't exist." });

  const { period, type, title, notes, durationMinutes, lat, lng, address } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Give this item a title." });

  day.items.push({
    period: period || "morning",
    type: type || "activity",
    title: title.trim(),
    notes: notes || "",
    durationMinutes: durationMinutes || 60,
    order: day.items.length,
    lat,
    lng,
    address,
  });
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.patch("/:tripId/itinerary/days/:dayNumber/items/:itemId", withTrip, async (req, res) => {
  const day = findDay(req.trip, req.params.dayNumber);
  const item = day?.items.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: "That itinerary item doesn't exist." });

  const editable = ["period", "type", "title", "notes", "durationMinutes", "order", "lat", "lng", "address"];
  for (const key of editable) {
    if (key in req.body) item[key] = req.body[key];
  }
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.delete("/:tripId/itinerary/days/:dayNumber/items/:itemId", withTrip, async (req, res) => {
  const day = findDay(req.trip, req.params.dayNumber);
  if (day) day.items = day.items.filter((i) => i.id !== req.params.itemId);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Places ---------------------------- */

router.post("/:tripId/places", withTrip, async (req, res) => {
  const { name, category, lat, lng, address, notes } = req.body;
  if (!name?.trim() || lat == null || lng == null) {
    return res.status(400).json({ error: "A place needs a name and a location." });
  }
  req.trip.places.push({ name: name.trim(), category: category || "other", lat, lng, address, notes });
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.delete("/:tripId/places/:placeId", withTrip, async (req, res) => {
  req.trip.places = req.trip.places.filter((p) => p.id !== req.params.placeId);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Budget ---------------------------- */

router.patch("/:tripId/budget", withTrip, async (req, res) => {
  const { currency, categories } = req.body;
  if (currency) req.trip.budget.currency = currency;
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      const existing = req.trip.budget.categories.find((c) => c.name === cat.name);
      if (existing) existing.planned = cat.planned;
    }
  }
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.post("/:tripId/budget/expenses", withTrip, async (req, res) => {
  const { category, amount, note, date } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Enter an amount greater than zero." });
  req.trip.budget.expenses.push({
    category: category || "misc",
    amount,
    note: note || "",
    date: date || Date.now(),
    paidBy: req.userId,
  });
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.delete("/:tripId/budget/expenses/:expenseId", withTrip, async (req, res) => {
  req.trip.budget.expenses = req.trip.budget.expenses.filter((e) => e.id !== req.params.expenseId);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Transportation ---------------------------- */

router.post("/:tripId/transportation", withTrip, async (req, res) => {
  req.trip.transportation.push(req.body);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.patch("/:tripId/transportation/:id", withTrip, async (req, res) => {
  const item = req.trip.transportation.find((t) => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found." });
  Object.assign(item, req.body);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.delete("/:tripId/transportation/:id", withTrip, async (req, res) => {
  req.trip.transportation = req.trip.transportation.filter((t) => t.id !== req.params.id);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Accommodation ---------------------------- */

router.post("/:tripId/accommodation", withTrip, async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: "Give this stay a name." });
  req.trip.accommodation.push(req.body);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.patch("/:tripId/accommodation/:id", withTrip, async (req, res) => {
  const item = req.trip.accommodation.find((a) => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found." });
  Object.assign(item, req.body);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.delete("/:tripId/accommodation/:id", withTrip, async (req, res) => {
  req.trip.accommodation = req.trip.accommodation.filter((a) => a.id !== req.params.id);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Packing ---------------------------- */

router.post("/:tripId/packing", withTrip, async (req, res) => {
  const { name, category, quantity } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Give this item a name." });
  req.trip.packing.push({ name: name.trim(), category: category || "Essentials", quantity: quantity || 1 });
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.status(201).json({ trip: req.trip });
});

router.patch("/:tripId/packing/:id", withTrip, async (req, res) => {
  const item = req.trip.packing.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found." });
  Object.assign(item, req.body);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

router.delete("/:tripId/packing/:id", withTrip, async (req, res) => {
  req.trip.packing = req.trip.packing.filter((p) => p.id !== req.params.id);
  await req.trip.save();
  emitTripUpdate(req, req.trip);
  res.json({ trip: req.trip });
});

/* ---------------------------- Stats ---------------------------- */

router.get("/:tripId/stats", withTrip, async (req, res) => {
  const trip = req.trip;
  const placesVisited = trip.places.length;
  const restaurants = trip.places.filter((p) => p.category === "restaurant").length;
  const spent = trip.budget.expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    stats: {
      distanceKm: trip.stats.distanceKm,
      placesVisited,
      restaurants,
      photos: trip.stats.photos,
      spent,
      currency: trip.budget.currency,
      steps: trip.stats.steps,
    },
  });
});

router.patch("/:tripId/stats", withTrip, async (req, res) => {
  const { distanceKm, photos, steps } = req.body;
  if (distanceKm != null) req.trip.stats.distanceKm = distanceKm;
  if (photos != null) req.trip.stats.photos = photos;
  if (steps != null) req.trip.stats.steps = steps;
  await req.trip.save();
  res.json({ trip: req.trip });
});

export default router;
