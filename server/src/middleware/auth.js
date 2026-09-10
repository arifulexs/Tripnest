import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "You need to sign in to do that." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Your session expired. Sign in again." });
  }
}

/** Attaches req.trip and req.member if the user can access it; 404/403 otherwise. */
export function loadTripForMember(Trip) {
  return async function (req, res, next) {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    const member = trip.members.find((m) => m.user.toString() === req.userId);
    if (!member) return res.status(403).json({ error: "You don't have access to this trip." });

    req.trip = trip;
    req.member = member;
    next();
  };
}
