import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-9 w-9 object-contain" />
          <span className="font-display text-xl font-semibold text-ink">Tripnest</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/trips/new" className="btn-sun hidden sm:inline-flex">
            + New trip
          </Link>
          <div className="group relative">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: user?.avatarColor || "#2D6A4F" }}
            >
              {user?.name?.[0]?.toUpperCase() || "?"}
            </button>
            <div className="invisible absolute right-0 mt-2 w-44 rounded-xl border border-ink/10 bg-paper p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
              <p className="truncate px-2 py-1 text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate px-2 pb-2 text-xs text-inksoft">{user?.email}</p>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-ink hover:bg-mist/60"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
