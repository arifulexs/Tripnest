import { Link } from "react-router-dom";

const STATUS_STYLES = {
  draft: "bg-mist text-forest",
  upcoming: "bg-sunlight text-sun",
  ongoing: "bg-ink text-cream",
  completed: "bg-sage/30 text-forest",
};

function formatRange(start, end) {
  if (!start) return "Dates not set";
  const opts = { month: "short", day: "numeric" };
  const s = new Date(start).toLocaleDateString(undefined, opts);
  if (!end) return s;
  const e = new Date(end).toLocaleDateString(undefined, opts);
  return `${s} – ${e}`;
}

export default function TripCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip._id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className="-mx-5 -mt-5 mb-4 h-32 bg-cover bg-center"
        style={{
          backgroundImage: trip.coverPhoto
            ? `url(${trip.coverPhoto})`
            : "linear-gradient(135deg, #1B4332, #74A892)",
        }}
      />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold leading-tight text-ink">{trip.title}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[trip.status]}`}>
          {trip.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-inksoft">{trip.destination}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-inksoft">
        <span>{formatRange(trip.startDate, trip.endDate)}</span>
        <span className="capitalize">{trip.tripType} · {trip.travelers} traveler{trip.travelers === 1 ? "" : "s"}</span>
      </div>
    </Link>
  );
}
