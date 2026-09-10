import { useState } from "react";
import api from "../../api/client.js";

function empty() {
  return { name: "", address: "", checkIn: "", checkOut: "", price: "", bookingRef: "", contact: "", notes: "" };
}

export default function AccommodationTab({ trip, onChange }) {
  const [form, setForm] = useState(empty());
  const [showForm, setShowForm] = useState(false);

  async function add() {
    if (!form.name.trim()) return;
    const res = await api.post(`/trips/${trip._id}/accommodation`, { ...form, price: Number(form.price) || 0 });
    onChange(res.data.trip);
    setForm(empty());
    setShowForm(false);
  }

  async function remove(id) {
    const res = await api.delete(`/trips/${trip._id}/accommodation/${id}`);
    onChange(res.data.trip);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">Where you're staying</h3>
        <button onClick={() => setShowForm((s) => !s)} className="btn-sun text-sm">
          + Add stay
        </button>
      </div>

      {showForm && (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-dashed border-ink/20 p-3 sm:grid-cols-2">
          <input
            className="input sm:col-span-2"
            placeholder="Hotel / stay name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input sm:col-span-2"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div>
            <label className="label text-xs">Check-in</label>
            <input
              type="date"
              className="input"
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            />
          </div>
          <div>
            <label className="label text-xs">Check-out</label>
            <input
              type="date"
              className="input"
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            />
          </div>
          <input
            type="number"
            className="input"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            className="input"
            placeholder="Booking reference"
            value={form.bookingRef}
            onChange={(e) => setForm({ ...form, bookingRef: e.target.value })}
          />
          <input
            className="input"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="input"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button onClick={add} className="btn-primary text-sm sm:col-span-2">
            Save stay
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {trip.accommodation.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-mist/30 p-3">
            <div>
              <p className="text-sm font-medium text-ink">{a.name}</p>
              <p className="text-xs text-inksoft">{a.address}</p>
              <p className="text-xs text-inksoft">
                {a.checkIn ? new Date(a.checkIn).toLocaleDateString() : "—"} to{" "}
                {a.checkOut ? new Date(a.checkOut).toLocaleDateString() : "—"}
                {a.bookingRef && ` · Ref ${a.bookingRef}`}
              </p>
            </div>
            <button onClick={() => remove(a.id)} className="shrink-0 text-xs text-inksoft hover:text-red-600">
              Remove
            </button>
          </li>
        ))}
        {trip.accommodation.length === 0 && <p className="text-sm text-inksoft">No stays added yet.</p>}
      </ul>
    </div>
  );
}
