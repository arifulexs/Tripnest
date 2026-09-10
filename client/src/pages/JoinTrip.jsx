import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function JoinTrip() {
  const { inviteCode } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    setJoining(true);
    api
      .post(`/trips/join/${inviteCode}`)
      .then((res) => navigate(`/trips/${res.data.trip._id}`, { replace: true }))
      .catch((err) => setError(err.message))
      .finally(() => setJoining(false));
  }, [loading, user, inviteCode, navigate]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-5 text-center">
        <img src={logo} alt="Tripnest" className="h-12 w-12 object-contain" />
        <h1 className="font-display text-xl font-semibold text-ink">You've been invited to a trip</h1>
        <p className="text-inksoft">Log in or create an account to join it.</p>
        <div className="flex gap-3">
          <Link to="/login" state={{ redirectTo: `/join/${inviteCode}` }} className="btn-primary">
            Log in
          </Link>
          <Link to="/signup" state={{ redirectTo: `/join/${inviteCode}` }} className="btn-secondary">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream px-5 text-center">
      <img src={logo} alt="Tripnest" className="h-12 w-12 object-contain" />
      {joining && <p className="text-inksoft">Joining the trip…</p>}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
