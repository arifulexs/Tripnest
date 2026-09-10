import mongoose from "mongoose";
import { nanoid } from "nanoid";

const { Schema } = mongoose;

/* ---------- Itinerary ---------- */
const itineraryItemSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  period: { type: String, enum: ["morning", "afternoon", "evening", "night"], default: "morning" },
  type: { type: String, enum: ["place", "activity", "restaurant", "free"], default: "activity" },
  title: { type: String, required: true },
  notes: { type: String, default: "" },
  durationMinutes: { type: Number, default: 60 },
  order: { type: Number, default: 0 },
  lat: Number,
  lng: Number,
  address: String,
});

const itineraryDaySchema = new Schema({
  dayNumber: { type: Number, required: true },
  date: Date,
  items: [itineraryItemSchema],
});

/* ---------- Places (saved on the map) ---------- */
const placeSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["attraction", "restaurant", "hotel", "shopping", "nature", "other"],
    default: "other",
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: String,
  notes: String,
  savedAt: { type: Date, default: Date.now },
});

/* ---------- Budget ---------- */
const expenseSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  category: {
    type: String,
    enum: ["transportation", "hotel", "food", "activities", "shopping", "tickets", "misc"],
    default: "misc",
  },
  amount: { type: Number, required: true },
  note: String,
  date: { type: Date, default: Date.now },
  paidBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const budgetCategorySchema = new Schema({
  name: {
    type: String,
    enum: ["transportation", "hotel", "food", "activities", "shopping", "tickets", "misc"],
    required: true,
  },
  planned: { type: Number, default: 0 },
});

/* ---------- Transportation ---------- */
const transportSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  mode: { type: String, enum: ["flight", "train", "bus", "car", "taxi", "walking"], default: "flight" },
  from: String,
  to: String,
  departTime: Date,
  arriveTime: Date,
  bookingRef: String,
  cost: { type: Number, default: 0 },
  notes: String,
});

/* ---------- Accommodation ---------- */
const accommodationSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  name: { type: String, required: true },
  address: String,
  checkIn: Date,
  checkOut: Date,
  price: { type: Number, default: 0 },
  bookingRef: String,
  contact: String,
  notes: String,
  lat: Number,
  lng: Number,
});

/* ---------- Packing ---------- */
const packingItemSchema = new Schema({
  id: { type: String, default: () => nanoid(8) },
  category: { type: String, default: "Essentials" },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
});

/* ---------- Members ---------- */
const memberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "editor"], default: "editor" },
});

/* ---------- Trip ---------- */
const tripSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
    inviteCode: { type: String, unique: true, default: () => nanoid(10) },

    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    travelers: { type: Number, default: 1 },
    tripType: { type: String, enum: ["solo", "couple", "friends", "family"], default: "solo" },
    coverPhoto: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "upcoming", "ongoing", "completed"], default: "draft" },

    itinerary: [itineraryDaySchema],
    places: [placeSchema],

    budget: {
      currency: { type: String, default: "USD" },
      categories: { type: [budgetCategorySchema], default: [] },
      expenses: { type: [expenseSchema], default: [] },
    },

    transportation: [transportSchema],
    accommodation: [accommodationSchema],
    packing: [packingItemSchema],

    stats: {
      distanceKm: { type: Number, default: 0 },
      photos: { type: Number, default: 0 },
      steps: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

tripSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Trip", tripSchema);
