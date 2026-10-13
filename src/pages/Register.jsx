import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getErrorMessage, register } from "../api/client";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextFieldErrors = {};

    if (!username.trim()) {
      nextFieldErrors.username = "Username is required.";
    }

    if (password.length < 6) {
      nextFieldErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextFieldErrors);
    setError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register(username, password, email);
      navigate("/login", {
        state: { message: "Account created. Please log in." },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container">
      <div className="card stack">
        <h1>Create an account</h1>

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
              required
            />
            {fieldErrors.username && (
              <p className="error">{fieldErrors.username}</p>
            )}
          </div>

          <div className="stack">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="stack">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            {fieldErrors.password && (
              <p className="error">{fieldErrors.password}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
