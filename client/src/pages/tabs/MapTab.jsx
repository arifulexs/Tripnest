import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import api from "../../api/client.js";

// Default Leaflet marker icons reference files that don't bundle well with Vite —
// point them at the CDN copies instead.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CATEGORIES = ["attraction", "restaurant", "hotel", "shopping", "nature", "other"];

function ClickToAdd({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
}

export default function MapTab({ trip, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState(null); // { lat, lng, name? }
  const [form, setForm] = useState({ name: "", category: "attraction", notes: "" });

  const center = useMemo(() => {
    const first = trip.places[0];
    return first ? [first.lat, first.lng] : [20, 0];
  }, [trip.places]);

  async function search() {
    if (!query.trim()) return;
    // Client-side geocoding via Nominatim (free, no key). For heavy production
    // traffic, proxy this through the server per Nominatim's usage policy.
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    setResults(await res.json());
  }

  function pickResult(r) {
    setPending({ lat: Number(r.lat), lng: Number(r.lon) });
    setForm({ name: r.display_name.split(",")[0], category: "attraction", notes: "" });
    setResults([]);
    setQuery("");
  }

  async function savePlace() {
    if (!pending || !form.name.trim()) return;
    const res = await api.post(`/trips/${trip._id}/places`, { ...form, lat: pending.lat, lng: pending.lng });
    onChange(res.data.trip);
    setPending(null);
    setForm({ name: "", category: "attraction", notes: "" });
  }

  async function removePlace(id) {
    const res = await api.delete(`/trips/${trip._id}/places/${id}`);
    onChange(res.data.trip);
  }

  const route = trip.places.map((p) => [p.lat, p.lng]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr,1fr]">
      <div className="card h-[420px] overflow-hidden p-0 sm:h-[520px]">
        <MapContainer center={center} zoom={trip.places.length ? 12 : 2} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToAdd onPick={(latlng) => setPending(latlng)} />
          {trip.places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon}>
              <Popup>
                <strong>{p.name}</strong>
                <br />
                <span className="capitalize">{p.category}</span>
              </Popup>
            </Marker>
          ))}
          {pending && <Marker position={[pending.lat, pending.lng]} icon={markerIcon} />}
          {route.length > 1 && <Polyline positions={route} color="#2D6A4F" dashArray="6 8" />}
        </MapContainer>
      </div>

      <div className="space-y-4">
        <div className="card">
          <label className="label">Search for a place</label>
          <div className="flex gap-2">
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Eiffel Tower…"
            />
            <button onClick={search} className="btn-secondary shrink-0 px-4 text-sm">
              Search
            </button>
          </div>
          {results.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
              {results.map((r) => (
                <li key={r.place_id}>
                  <button
                    onClick={() => pickResult(r)}
                    className="w-full truncate rounded-lg px-2 py-1.5 text-left text-inksoft hover:bg-mist/60"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-inksoft">Or tap anywhere on the map to drop a pin.</p>
        </div>

        {pending && (
          <div className="card space-y-3 border-sun">
            <p className="text-sm font-medium text-ink">Save this place</p>
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={savePlace} className="btn-primary flex-1 text-sm">
                Save place
              </button>
              <button onClick={() => setPending(null)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <p className="mb-2 text-sm font-medium text-ink">Saved places ({trip.places.length})</p>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {trip.places.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg bg-mist/30 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs capitalize text-inksoft">{p.category}</p>
                </div>
                <button onClick={() => removePlace(p.id)} className="text-xs text-inksoft hover:text-red-600">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
