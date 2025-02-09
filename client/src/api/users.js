// src/api/users.js
import { BASE_URL } from "../config";

 const signup = async (user) => {
  console.log("Sending data to backend:", user); // Debugging
  try {
    const res = await fetch(`${BASE_URL}api/users/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { error: errData.error || "Registration failed." };
    }

    return await res.json(); // e.g. { token, username, userId, ... }
  } catch (err) {
    console.error("Signup error:", err);
    return { error: err.message };
  }
};

/**
 * login(user):
 * POST to /api/users/login
 * Returns JSON { token, username, userId, ... } on success or { error } on failure.
 */
 const login = async (user) => {
  try {
    const res = await fetch(`${BASE_URL}api/users/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { error: errData.error || "Login failed." };
    }

    return await res.json(); // e.g. { token, username, userId, ... }
  } catch (err) {
    console.error("Login error:", err);
    return { error: err.message };
  }
};

/**
 * getUser(params):
 * GET /api/users/:id
 * returns user info or { error }
 */
const getUser = async (params) => {
  try {
    const res = await fetch(`${BASE_URL}api/users/${params.id}`);
    if (!res.ok) {
      const errData = await res.json();
      return { error: errData.error || "Failed to get user." };
    }
    return await res.json();
  } catch (err) {
    console.error("Get user error:", err);
    return { error: err.message };
  }
};

/**
 * getRandomUsers(query):
 * GET /api/users/random?...
 */
 const getRandomUsers = async (query) => {
  try {
    const url = `${BASE_URL}api/users/random?${new URLSearchParams(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json();
      return { error: errData.error || "Failed to get random users." };
    }
    return await res.json();
  } catch (err) {
    console.error("Get random users error:", err);
    return { error: err.message };
  }
};

const updateUser = async (user, data) => {
  console.log("log user.id: ", user._id);
  try {
    const res = await fetch(`${BASE_URL}api/users/${user._id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": user.token,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { error: errData.error || "Failed to update user." };
    }
    return await res.json();
  } catch (err) {
    console.error("Update user error:", err);
    return { error: err.message };
  }
};
export { signup, login, getUser, getRandomUsers, updateUser };
