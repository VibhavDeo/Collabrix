// src/helpers/authHelper.js
import { initiateSocketConnection, disconnectSocket } from "./socketHelper";

/**
 * isLoggedIn():
 * Returns the parsed user object from localStorage, or null if not found.
 * e.g. { token: "JWT_HERE", username: "john", userId: "1234" }
 */
export const isLoggedIn = () => {
  return JSON.parse(localStorage.getItem("user")); 
};

/**
 * loginUser(user):
 * Expects an object with at least { token: "JWT_HERE" }.
 * Saves user to localStorage and initiates socket connection.
 */
export const loginUser = (user) => {
  if (!user || !user.token) {
    console.error("loginUser called without a valid user token:", user);
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));
  initiateSocketConnection();
};

/**
 * logoutUser():
 * Clears localStorage and disconnects the socket if connected.
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
  disconnectSocket();
};
