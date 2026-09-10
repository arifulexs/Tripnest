import { useState } from "react";
import { useEffect } from "react";
import api from "../../api/client.js";
import { IconHeart, IconMapPin, IconSuitcase, IconWallet } from "../../components/Icons.jsx";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-inksoft">{label}</p>
        <p className="font-display text-lg font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function StatsTab({ trip, onChange }) {
  const [stats, setStats] = useState(null);
  const [manual, setManual] = useState({ distanceKm: trip.stats.distanceKm, photos: trip.stats.photos, steps: trip.stats.steps });
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/trips/${trip._id}/stats`)
      .then((res) => setStats(res.data.stats))
      .catch((err) => setError(err.message));
  }, [trip._id, trip.places.length, trip.budget.expenses.length]);

  async function saveManual() {
    const res = await api.patch(`/trips/${trip._id}/stats`, manual);
    onChange(res.data.trip);
  }

  const packed = trip.packing.filter((p) => p.completed).length;
  const packingLeft = trip.packing.length - packed;

  return (
    <div className="space-y-6">
      {trip.status !== "completed" && (
        <div className="card border-sun bg-sunlight/40 text-sm text-ink">
          This trip isn't marked completed yet — the recap below fills in as you go, and settles once you
          mark the trip <strong>Completed</strong> from the dropdown above.
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard icon={IconMapPin} label="Places visited" value={stats.placesVisited} />
          <StatCard icon={IconHeart} label="Restaurants" value={stats.restaurants} />
          <StatCard
            icon={IconWallet}
            label="Spent"
            value={new Intl.NumberFormat(undefined, { style: "currency", currency: stats.currency }).format(stats.spent)}
          />
          <StatCard icon={IconSuitcase} label="Packing done" value={`${packed} / ${trip.packing.length || 0}`} />
          <StatCard icon={IconMapPin} label="Distance" value={`${stats.distanceKm} km`} />
          <StatCard icon={IconHeart} label="Photos" value={stats.photos} />
        </div>
      )}

      {packingLeft > 0 && (
        <p className="text-sm text-inksoft">
          🎒 {packingLeft} item{packingLeft === 1 ? "" : "s"} still missing from your packing list.
        </p>
      )}

      <div className="card">
        <h3 className="font-display text-base font-semibold text-ink">Fill in the extras</h3>
        <p className="mt-1 text-xs text-inksoft">
          Distance, photo count, and steps aren't tracked automatically — log them here for the recap.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="label text-xs">Distance traveled (km)</label>
            <input
              type="number"
              className="input"
              value={manual.distanceKm}
              onChange={(e) => setManual({ ...manual, distanceKm: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label text-xs">Photos taken</label>
            <input
              type="number"
              className="input"
              value={manual.photos}
              onChange={(e) => setManual({ ...manual, photos: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label text-xs">Steps walked</label>
            <input
              type="number"
              className="input"
              value={manual.steps}
              onChange={(e) => setManual({ ...manual, steps: Number(e.target.value) })}
            />
          </div>
        </div>
        <button onClick={saveManual} className="btn-primary mt-4 text-sm">
          Save
        </button>
      </div>
    </div>
  );
}
