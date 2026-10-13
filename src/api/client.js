import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest =
      requestUrl.includes("auth/login") || requestUrl.includes("auth/register");

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      window.location.pathname !== "/login"
    ) {
      localStorage.clear();
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

/**
 * Log in and save the access token.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>}
 */
export async function login(username, password) {
  const response = await api.post("auth/login/", { username, password });
  localStorage.setItem("access_token", response.data.access);
  return response.data;
}

/**
 * Register a new user account.
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @returns {Promise<object>}
 */
export async function register(username, password, email) {
  const response = await api.post("auth/register/", {
    username,
    password,
    email,
  });
  return response.data;
}

/**
 * Remove the saved access token.
 * @returns {Promise<void>}
 */
export async function logout() {
  localStorage.removeItem("access_token");
}

/**
 * Check whether an access token is saved.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(localStorage.getItem("access_token"));
}

/**
 * Get all events.
 * @returns {Promise<object[]>}
 */
export async function getEvents() {
  const response = await api.get("events/");
  return response.data;
}

/**
 * Get one event.
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getEvent(id) {
  const response = await api.get(`events/${id}/`);
  return response.data;
}

/**
 * Create an event.
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createEvent(data) {
  const response = await api.post("events/", data);
  return response.data;
}

/**
 * Update an event.
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateEvent(id, data) {
  const response = await api.put(`events/${id}/`, data);
  return response.data;
}

/**
 * Delete an event.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteEvent(id) {
  await api.delete(`events/${id}/`);
}

/**
 * Get challenges, optionally filtered by query parameters.
 * @param {object} [params]
 * @returns {Promise<object[]>}
 */
export async function getChallenges(params) {
  const response = await api.get("challenges/", { params });
  return response.data;
}

/**
 * Get one challenge.
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getChallenge(id) {
  const response = await api.get(`challenges/${id}/`);
  return response.data;
}

/**
 * Create a challenge.
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createChallenge(data) {
  const response = await api.post("challenges/", data);
  return response.data;
}

/**
 * Update a challenge.
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateChallenge(id, data) {
  const response = await api.put(`challenges/${id}/`, data);
  return response.data;
}

/**
 * Delete a challenge.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteChallenge(id) {
  await api.delete(`challenges/${id}/`);
}

/**
 * Get writeups, optionally filtered by query parameters.
 * @param {object} [params]
 * @returns {Promise<object[]>}
 */
export async function getWriteups(params) {
  const response = await api.get("writeups/", { params });
  return response.data;
}

/**
 * Get one writeup.
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function getWriteup(id) {
  const response = await api.get(`writeups/${id}/`);
  return response.data;
}

/**
 * Create a writeup.
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createWriteup(data) {
  const response = await api.post("writeups/", data);
  return response.data;
}

/**
 * Update a writeup.
 * @param {number|string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateWriteup(id, data) {
  const response = await api.put(`writeups/${id}/`, data);
  return response.data;
}

/**
 * Delete a writeup.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteWriteup(id) {
  await api.delete(`writeups/${id}/`);
}

/**
 * Return a readable message from an API or network error.
 * @param {Error|object} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error.response) {
    return "Cannot reach the server. Please try again in a moment.";
  }

  const data = error.response.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const fieldErrors = Object.entries(data)
      .flatMap(([field, messages]) => {
        const values = Array.isArray(messages) ? messages : [messages];
        return values.map((message) => `${field}: ${message}`);
      })
      .join(" ");

    if (fieldErrors) {
      return fieldErrors;
    }
  }

  return error.message || "Something went wrong.";
}

