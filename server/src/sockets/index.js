import jwt from "jsonwebtoken";

/**
 * Every connected client authenticates with its JWT, then joins/leaves
 * trip rooms as it opens/closes trip screens. All real-time features
 * (live itinerary edits, chat, polls, presence) ride on `trip:<id>` rooms.
 */
export function registerSockets(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("trip:join", (tripId) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("trip:leave", (tripId) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on("trip:typing", ({ tripId, name }) => {
      socket.to(`trip:${tripId}`).emit("trip:typing", { name, userId: socket.userId });
    });
  });
}
