import { useState } from "react";
import api from "../../api/client.js";

const SUGGESTED = {
  Essentials: ["Passport / ID", "Wallet", "Phone", "Charger", "Power bank"],
};

export default function PackingTab({ trip, onChange }) {
  const [form, setForm] = useState({ category: "Essentials", name: "", quantity: 1 });

  async function addItem(name = form.name, category = form.category) {
    if (!name.trim()) return;
    const res = await api.post(`/trips/${trip._id}/packing`, { name, category, quantity: form.quantity });
    onChange(res.data.trip);
    setForm({ ...form, name: "" });
  }

  async function toggle(item) {
    const res = await api.patch(`/trips/${trip._id}/packing/${item.id}`, { completed: !item.completed });
    onChange(res.data.trip);
  }

  async function remove(id) {
    const res = await api.delete(`/trips/${trip._id}/packing/${id}`);
    onChange(res.data.trip);
  }

  const byCategory = trip.packing.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});
  const categories = Object.keys(byCategory).length
    ? Object.keys(byCategory)
    : ["Essentials"];
  const total = trip.packing.length;
  const done = trip.packing.filter((i) => i.completed).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">Packing list</h3>
        {total > 0 && (
          <span className="text-sm text-inksoft">
            {done} / {total} packed
          </span>
        )}
      </div>

      {total === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <p className="w-full text-xs text-inksoft">Quick add essentials:</p>
          {SUGGESTED.Essentials.map((s) => (
            <button key={s} onClick={() => addItem(s, "Essentials")} className="btn-secondary py-1.5 text-xs">
              + {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="input min-w-[10rem] flex-1"
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <input
          className="input w-32"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          min={1}
          className="input w-20"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
        />
        <button onClick={() => addItem()} className="btn-primary text-sm">
          Add
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-wide text-sage">{cat}</p>
            <ul className="mt-2 space-y-1.5">
              {(byCategory[cat] || []).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-mist/40">
                  <label className="flex flex-1 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggle(item)}
                      className="h-4 w-4 rounded border-ink/30 accent-forest"
                    />
                    <span className={item.completed ? "text-inksoft line-through" : "text-ink"}>
                      {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                    </span>
                  </label>
                  <button onClick={() => remove(item.id)} className="text-xs text-inksoft hover:text-red-600">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
