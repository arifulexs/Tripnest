import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Navbar from "../components/Navbar.jsx";

const TRIP_TYPES = ["solo", "couple", "friends", "family"];

export default function TripCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    tripType: "solo",
    description: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/trips", form);
      navigate(`/trips/${res.data.trip._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink">Plan a new trip</h1>
        <p className="mt-1 text-inksoft">Start with the basics — you can fill in everything else later.</p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-5">
          <div>
            <label className="label">Trip name</label>
            <input
              required
              className="input"
              placeholder="Golden Week in Japan"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div>
            <label className="label">Destination</label>
            <input
              required
              className="input"
              placeholder="Kyoto, Japan"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start date</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="label">End date</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Travelers</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.travelers}
                onChange={(e) => update("travelers", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Trip type</label>
              <select
                className="input"
                value={form.tripType}
                onChange={(e) => update("tripType", e.target.value)}
              >
                {TRIP_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input min-h-20"
              placeholder="What's this trip about?"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Creating…" : "Create trip"}
          </button>
        </form>
      </main>
    </div>
  );
}
