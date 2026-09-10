import { useState } from "react";
import api from "../../api/client.js";

const CATEGORY_LABELS = {
  transportation: "Transportation",
  hotel: "Hotel",
  food: "Food",
  activities: "Activities",
  shopping: "Shopping",
  tickets: "Tickets",
  misc: "Miscellaneous",
};
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "BDT", "INR", "AUD", "CAD"];

function money(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount || 0);
  } catch {
    return `${amount?.toFixed?.(2) ?? 0} ${currency}`;
  }
}

export default function BudgetTab({ trip, onChange }) {
  const [expenseForm, setExpenseForm] = useState({ category: "food", amount: "", note: "" });
  const [converter, setConverter] = useState({ amount: "", from: "USD", result: null });

  const planned = trip.budget.categories.reduce((s, c) => s + (c.planned || 0), 0);
  const spent = trip.budget.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = planned - spent;
  const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
  const perPerson = trip.travelers > 0 ? spent / trip.travelers : spent;

  async function updateCategory(name, planned) {
    const categories = trip.budget.categories.map((c) => (c.name === name ? { ...c, planned } : c));
    const res = await api.patch(`/trips/${trip._id}/budget`, { categories });
    onChange(res.data.trip);
  }

  async function updateCurrency(currency) {
    const res = await api.patch(`/trips/${trip._id}/budget`, { currency });
    onChange(res.data.trip);
  }

  async function addExpense() {
    const amount = Number(expenseForm.amount);
    if (!amount || amount <= 0) return;
    const res = await api.post(`/trips/${trip._id}/budget/expenses`, { ...expenseForm, amount });
    onChange(res.data.trip);
    setExpenseForm({ category: "food", amount: "", note: "" });
  }

  async function removeExpense(id) {
    const res = await api.delete(`/trips/${trip._id}/budget/expenses/${id}`);
    onChange(res.data.trip);
  }

  async function convert() {
    const amt = Number(converter.amount);
    if (!amt) return;
    // Frankfurter — free, no API key, no request limit for reasonable use.
    const res = await fetch(
      `https://api.frankfurter.app/latest?amount=${amt}&from=${converter.from}&to=${trip.budget.currency}`
    );
    const data = await res.json();
    setConverter((c) => ({ ...c, result: data.rates?.[trip.budget.currency] }));
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-inksoft">Spent of planned</p>
            <p className="font-display text-2xl font-semibold text-ink">
              {money(spent, trip.budget.currency)}{" "}
              <span className="text-base font-body font-normal text-inksoft">
                / {money(planned, trip.budget.currency)}
              </span>
            </p>
          </div>
          <select
            className="input w-auto py-2 text-sm"
            value={trip.budget.currency}
            onChange={(e) => updateCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-mist">
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-forest"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-inksoft">
          <span>{pct}% used</span>
          <span>
            {remaining >= 0 ? "Remaining" : "Over by"} {money(Math.abs(remaining), trip.budget.currency)}
          </span>
        </div>
        <p className="mt-1 text-xs text-inksoft">
          {money(perPerson, trip.budget.currency)} per person across {trip.travelers} traveler
          {trip.travelers === 1 ? "" : "s"}
        </p>

        <h3 className="mt-6 font-display text-base font-semibold text-ink">Planned by category</h3>
        <div className="mt-3 space-y-2">
          {trip.budget.categories.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-3">
              <span className="text-sm text-ink">{CATEGORY_LABELS[c.name]}</span>
              <input
                type="number"
                className="input w-28 py-1.5 text-right text-sm"
                value={c.planned}
                onChange={(e) => updateCategory(c.name, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        <h3 className="mt-6 font-display text-base font-semibold text-ink">Expenses</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="input w-auto py-2 text-sm"
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
          >
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="input w-28 py-2 text-sm"
            placeholder="Amount"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <input
            className="input min-w-[8rem] flex-1 py-2 text-sm"
            placeholder="Note"
            value={expenseForm.note}
            onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
          />
          <button onClick={addExpense} className="btn-primary py-2 text-sm">
            Add
          </button>
        </div>

        <ul className="mt-4 divide-y divide-ink/10">
          {[...trip.budget.expenses].reverse().map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-ink">
                  {CATEGORY_LABELS[e.category]} {e.note && `· ${e.note}`}
                </p>
                <p className="text-xs text-inksoft">{new Date(e.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">{money(e.amount, trip.budget.currency)}</span>
                <button onClick={() => removeExpense(e.id)} className="text-xs text-inksoft hover:text-red-600">
                  Remove
                </button>
              </div>
            </li>
          ))}
          {trip.budget.expenses.length === 0 && (
            <li className="py-3 text-sm text-inksoft">No expenses logged yet.</li>
          )}
        </ul>
      </div>

      <div className="card h-fit">
        <h3 className="font-display text-base font-semibold text-ink">Currency converter</h3>
        <p className="mt-1 text-xs text-inksoft">Quick check against your trip currency ({trip.budget.currency}).</p>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            className="input py-2 text-sm"
            placeholder="Amount"
            value={converter.amount}
            onChange={(e) => setConverter({ ...converter, amount: e.target.value, result: null })}
          />
          <select
            className="input w-24 py-2 text-sm"
            value={converter.from}
            onChange={(e) => setConverter({ ...converter, from: e.target.value, result: null })}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button onClick={convert} className="btn-secondary mt-3 w-full text-sm">
          Convert
        </button>
        {converter.result != null && (
          <p className="mt-3 text-center font-display text-lg font-semibold text-ink">
            {money(converter.result, trip.budget.currency)}
          </p>
        )}
      </div>
    </div>
  );
}
