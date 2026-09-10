import { useState } from "react";
import api from "../../api/client.js";
import { IconPlane } from "../../components/Icons.jsx";

const MODES = ["flight", "train", "bus", "car", "taxi", "walking"];

function empty() {
  return { mode: "flight", from: "", to: "", departTime: "", arriveTime: "", bookingRef: "", cost: "", notes: "" };
}

export default function TransportTab({ trip, onChange }) {
  const [form, setForm] = useState(empty());
  const [showForm, setShowForm] = useState(false);

  async function add() {
    if (!form.from.trim() || !form.to.trim()) return;
    const res = await api.post(`/trips/${trip._id}/transportation`, { ...form, cost: Number(form.cost) || 0 });
    onChange(res.data.trip);
    setForm(empty());
    setShowForm(false);
  }

  async function remove(id) {
    const res = await api.delete(`/trips/${trip._id}/transportation/${id}`);
    onChange(res.data.trip);
  }

  const legs = [...trip.transportation].sort(
    (a, b) => new Date(a.departTime || 0) - new Date(b.departTime || 0)
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">Getting around</h3>
        <button onClick={() => setShowForm((s) => !s)} className="btn-sun text-sm">
          + Add leg
        </button>
      </div>

      {showForm && (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-dashed border-ink/20 p-3 sm:grid-cols-2">
          <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Booking reference"
            value={form.bookingRef}
            onChange={(e) => setForm({ ...form, bookingRef: e.target.value })}
          />
          <input
            className="input"
            placeholder="From"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          />
          <input
            className="input"
            placeholder="To"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
          <div>
            <label className="label text-xs">Departs</label>
            <input
              type="datetime-local"
              className="input"
              value={form.departTime}
              onChange={(e) => setForm({ ...form, departTime: e.target.value })}
            />
          </div>
          <div>
            <label className="label text-xs">Arrives</label>
            <input
              type="datetime-local"
              className="input"
              value={form.arriveTime}
              onChange={(e) => setForm({ ...form, arriveTime: e.target.value })}
            />
          </div>
          <input
            type="number"
            className="input"
            placeholder="Cost"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
          />
          <input
            className="input"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button onClick={add} className="btn-primary text-sm sm:col-span-2">
            Save leg
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {legs.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 rounded-xl bg-mist/30 p-3">
            <div className="flex items-start gap-3">
              <IconPlane className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
              <div>
                <p className="text-sm font-medium capitalize text-ink">
                  {t.mode} · {t.from} → {t.to}
                </p>
                <p className="text-xs text-inksoft">
                  {t.departTime ? new Date(t.departTime).toLocaleString() : "No time set"}
                  {t.bookingRef && ` · Ref ${t.bookingRef}`}
                </p>
                {t.notes && <p className="text-xs text-inksoft">{t.notes}</p>}
              </div>
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 text-xs text-inksoft hover:text-red-600">
              Remove
            </button>
          </li>
        ))}
        {legs.length === 0 && <p className="text-sm text-inksoft">No transportation added yet.</p>}
      </ul>
    </div>
  );
}
