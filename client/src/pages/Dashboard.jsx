import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Navbar from "../components/Navbar.jsx";
import TripCard from "../components/TripCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/trips")
      .then((res) => setTrips(res.data.trips))
      .catch((err) => setError(err.message));
  }, []);

  const upcoming = trips?.filter((t) => t.status !== "completed") || [];
  const past = trips?.filter((t) => t.status === "completed") || [];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Hey {user?.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-inksoft">Here's everywhere you're headed.</p>
          </div>
          <Link to="/trips/new" className="btn-sun sm:hidden">
            + New trip
          </Link>
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        {trips && trips.length === 0 && (
          <div className="card mt-10 flex flex-col items-center gap-3 py-14 text-center">
            <h2 className="font-display text-xl font-semibold text-ink">No trips yet</h2>
            <p className="max-w-sm text-sm text-inksoft">
              Every trip starts as a blank page. Give yours a destination and a date to begin.
            </p>
            <Link to="/trips/new" className="btn-primary mt-3">
              Plan your first trip
            </Link>
          </div>
        )}

        {upcoming.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Upcoming & drafts</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((t) => (
                <TripCard key={t._id} trip={t} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Completed</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((t) => (
                <TripCard key={t._id} trip={t} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
