import { io } from "socket.io-client";
import { BASE_URL } from "../config";
import { isLoggedIn } from "./authHelper";

export let socket;

export const initiateSocketConnection = () => {
  const user = isLoggedIn();
  
  socket = io(BASE_URL, {
    auth: {
      token: user?.token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
