import { useState } from "react";
import api from "../../api/client.js";
import { IconMapPin } from "../../components/Icons.jsx";

const PERIODS = ["morning", "afternoon", "evening", "night"];
const TYPES = ["activity", "place", "restaurant", "free"];

function emptyForm() {
  return { period: "morning", type: "activity", title: "", notes: "", durationMinutes: 60 };
}

export default function ItineraryTab({ trip, onChange }) {
  const [openDayForm, setOpenDayForm] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [dragItem, setDragItem] = useState(null);

  async function addDay() {
    const res = await api.post(`/trips/${trip._id}/itinerary/days`, {});
    onChange(res.data.trip);
  }

  async function removeDay(dayNumber) {
    if (!confirm(`Remove Day ${dayNumber} and everything on it?`)) return;
    const res = await api.delete(`/trips/${trip._id}/itinerary/days/${dayNumber}`);
    onChange(res.data.trip);
  }

  async function addItem(dayNumber) {
    if (!form.title.trim()) return;
    const res = await api.post(`/trips/${trip._id}/itinerary/days/${dayNumber}/items`, form);
    onChange(res.data.trip);
    setForm(emptyForm());
    setOpenDayForm(null);
  }

  async function removeItem(dayNumber, itemId) {
    const res = await api.delete(`/trips/${trip._id}/itinerary/days/${dayNumber}/items/${itemId}`);
    onChange(res.data.trip);
  }

  async function reorder(dayNumber, items) {
    // Persist the new order for every item in the (small) list.
    await Promise.all(
      items.map((it, index) =>
        api.patch(`/trips/${trip._id}/itinerary/days/${dayNumber}/items/${it.id}`, { order: index })
      )
    );
  }

  function handleDrop(day, targetItem) {
    if (!dragItem || dragItem.dayNumber !== day.dayNumber) return setDragItem(null);
    const items = [...day.items].sort((a, b) => a.order - b.order);
    const fromIdx = items.findIndex((i) => i.id === dragItem.item.id);
    const toIdx = items.findIndex((i) => i.id === targetItem.id);
    if (fromIdx === -1 || toIdx === -1) return setDragItem(null);

    items.splice(toIdx, 0, items.splice(fromIdx, 1)[0]);
    const updatedTrip = {
      ...trip,
      itinerary: trip.itinerary.map((d) => (d.dayNumber === day.dayNumber ? { ...d, items } : d)),
    };
    onChange(updatedTrip);
    reorder(day.dayNumber, items);
    setDragItem(null);
  }

  const days = [...trip.itinerary].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="space-y-6">
      {days.length === 0 && (
        <div className="card py-10 text-center">
          <p className="text-inksoft">No days yet — add your first one to start building the schedule.</p>
        </div>
      )}

      {days.map((day) => {
        const items = [...day.items].sort((a, b) => a.order - b.order);
        return (
          <div key={day.dayNumber} className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Day {day.dayNumber}</h3>
              <button onClick={() => removeDay(day.dayNumber)} className="text-xs text-inksoft hover:text-red-600">
                Remove day
              </button>
            </div>

            {PERIODS.map((period) => {
              const periodItems = items.filter((i) => i.period === period);
              return (
                <div key={period} className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sage">{period}</p>
                  <div className="mt-2 space-y-2">
                    {periodItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => setDragItem({ dayNumber: day.dayNumber, item })}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(day, item)}
                        className="flex cursor-grab items-center justify-between rounded-xl border border-ink/10 bg-mist/30 px-3 py-2 active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 shrink-0 text-forest" />
                          <div>
                            <p className="text-sm font-medium text-ink">{item.title}</p>
                            {item.notes && <p className="text-xs text-inksoft">{item.notes}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(day.dayNumber, item.id)}
                          className="text-xs text-inksoft hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {openDayForm === `${day.dayNumber}-${period}` ? (
                    <div className="mt-2 space-y-2 rounded-xl border border-dashed border-ink/20 p-3">
                      <input
                        autoFocus
                        className="input"
                        placeholder="What's happening?"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value, period })}
                      />
                      <div className="flex flex-wrap gap-2">
                        <select
                          className="input w-auto py-1.5 text-xs"
                          value={form.type}
                          onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                          {TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="input w-24 py-1.5 text-xs"
                          value={form.durationMinutes}
                          onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                          placeholder="mins"
                        />
                      </div>
                      <input
                        className="input"
                        placeholder="Notes (optional)"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addItem(day.dayNumber)}
                          className="btn-primary py-1.5 text-xs"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setOpenDayForm(null)}
                          className="btn-secondary py-1.5 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setForm({ ...emptyForm(), period });
                        setOpenDayForm(`${day.dayNumber}-${period}`);
                      }}
                      className="mt-2 text-xs font-medium text-forest hover:underline"
                    >
                      + Add to {period}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <button onClick={addDay} className="btn-secondary w-full">
        + Add day {days.length > 0 ? days.length + 1 : 1}
      </button>
    </div>
  );
}
