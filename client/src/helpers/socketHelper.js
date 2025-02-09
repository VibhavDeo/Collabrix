// src/helpers/socketHelper.js
import { io } from "socket.io-client";
import { isLoggedIn } from "./authHelper";

export const BASE_URL = "http://localhost:4000"; // or your actual server URL

export let socket = null;

/**
 * initiateSocketConnection():
 * - Checks localStorage user for .token
 * - If none, logs a warning (won't connect)
 * - If present, connects to server with { auth: { token } }
 */
export const initiateSocketConnection = () => {
  const user = isLoggedIn(); // e.g. { token: "...", username: "john", userId: "123" }

  if (!user || !user.token) {
    console.warn("initiateSocketConnection called without a valid token.");
    return;
  }

  // If already connected, disconnect first
  if (socket) {
    socket.disconnect();
  }

  socket = io(BASE_URL, {
    auth: {
      token: user.token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect_error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
};

/**
 * disconnectSocket():
 * Disconnects if connected
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
