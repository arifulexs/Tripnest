import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";

let sharedSocket = null;

function getSocket(token) {
  if (!sharedSocket) {
    sharedSocket = io("/", { auth: { token }, autoConnect: true });
  }
  return sharedSocket;
}

/** Joins a trip's real-time room for the lifetime of the calling component. */
export function useTripSocket(tripId, handlers = {}) {
  const { token } = useAuth();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!token || !tripId) return;
    const socket = getSocket(token);
    socket.emit("trip:join", tripId);

    const bound = {};
    for (const [event, fn] of Object.entries(handlersRef.current)) {
      bound[event] = (...args) => handlersRef.current[event]?.(...args);
      socket.on(event, bound[event]);
    }

    return () => {
      for (const event of Object.keys(bound)) socket.off(event, bound[event]);
      socket.emit("trip:leave", tripId);
    };
  }, [token, tripId]);

  return getSocket(token);
}
