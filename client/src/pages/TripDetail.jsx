import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import Navbar from "../components/Navbar.jsx";
import { useTripSocket } from "../hooks/useSocket.js";

import ItineraryTab from "./tabs/ItineraryTab.jsx";
import MapTab from "./tabs/MapTab.jsx";
import BudgetTab from "./tabs/BudgetTab.jsx";
import TransportTab from "./tabs/TransportTab.jsx";
import AccommodationTab from "./tabs/AccommodationTab.jsx";
import PackingTab from "./tabs/PackingTab.jsx";
import ChatTab from "./tabs/ChatTab.jsx";
import StatsTab from "./tabs/StatsTab.jsx";

const TABS = [
  { key: "itinerary", label: "Itinerary" },
  { key: "map", label: "Map" },
  { key: "budget", label: "Budget" },
  { key: "transport", label: "Transport" },
  { key: "stay", label: "Stay" },
  { key: "packing", label: "Packing" },
  { key: "chat", label: "Chat" },
  { key: "stats", label: "Stats" },
];

const STATUS_OPTIONS = ["draft", "upcoming", "ongoing", "completed"];

export default function TripDetail() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState("itinerary");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/trips/${tripId}`)
      .then((res) => setTrip(res.data.trip))
      .catch((err) => setError(err.message));
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  useTripSocket(tripId, {
    "trip:updated": (updated) => {
      if (updated._id === tripId) setTrip((prev) => ({ ...prev, ...updated }));
    },
  });

  async function updateTrip(patch) {
    const res = await api.patch(`/trips/${tripId}`, patch);
    setTrip(res.data.trip);
  }

  function copyInvite() {
    const url = `${window.location.origin}/join/${trip.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <p className="mx-auto max-w-3xl px-5 py-10 text-red-600">{error}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <p className="mx-auto max-w-3xl px-5 py-10 text-inksoft">Loading trip…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{trip.title}</h1>
            <p className="mt-1 text-inksoft">{trip.destination}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={trip.status}
              onChange={(e) => updateTrip({ status: e.target.value })}
              className="input w-auto py-2 text-sm capitalize"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button onClick={copyInvite} className="btn-secondary text-sm">
              {copied ? "Link copied!" : "Invite people"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-1.5 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab-btn ${tab === t.key ? "tab-btn-active" : "tab-btn-inactive"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "itinerary" && <ItineraryTab trip={trip} onChange={setTrip} />}
          {tab === "map" && <MapTab trip={trip} onChange={setTrip} />}
          {tab === "budget" && <BudgetTab trip={trip} onChange={setTrip} />}
          {tab === "transport" && <TransportTab trip={trip} onChange={setTrip} />}
          {tab === "stay" && <AccommodationTab trip={trip} onChange={setTrip} />}
          {tab === "packing" && <PackingTab trip={trip} onChange={setTrip} />}
          {tab === "chat" && <ChatTab trip={trip} />}
          {tab === "stats" && <StatsTab trip={trip} onChange={setTrip} />}
        </div>
      </main>
    </div>
  );
}
