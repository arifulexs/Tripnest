import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { registerSockets } from "./sockets/index.js";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import chatRoutes from "./routes/chat.js";
import pollRoutes from "./routes/polls.js";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

app.set("io", io);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Tripnest API" }));

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/trips", chatRoutes);
app.use("/api/trips", pollRoutes);

// Central error handler — keeps error shape consistent for the client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong on our end." });
});

registerSockets(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Tripnest API listening on port ${PORT}`));
});
