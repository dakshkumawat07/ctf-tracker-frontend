import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { getErrorMessage, isAuthenticated, login } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/events" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextFieldErrors = {};

    if (!username.trim()) {
      nextFieldErrors.username = "Username is required.";
    }

    if (!password.trim()) {
      nextFieldErrors.password = "Password is required.";
    }

    setFieldErrors(nextFieldErrors);
    setError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate("/events");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <div className="card stack">
        <h1>Log in</h1>

        {location.state?.message && (
          <p className="success">{location.state.message}</p>
        )}

        {error && <p className="error">{error}</p>}

        <form className="stack" onSubmit={handleSubmit}>
          <div className="stack">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <p className="error">{fieldErrors.username}</p>
            )}
          </div>

          <div className="stack">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="error">{fieldErrors.password}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="muted">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
