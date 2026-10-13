import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createChallenge,
  deleteChallenge,
  getChallenges,
  getErrorMessage,
  getEvent,
  updateChallenge,
} from "../api/client";

export default function EventDetail() {
  const { id } = useParams();

  return <EventDetailContent key={id} id={id} />;
}

function EventDetailContent({ id }) {
  const [event, setEvent] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("misc");
  const [points, setPoints] = useState("0");
  const [fieldErrors, setFieldErrors] = useState({});
  const [createError, setCreateError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [busyById, setBusyById] = useState({});
  const [challengeErrors, setChallengeErrors] = useState({});

  async function loadData(isCancelled = () => false) {
    setLoading(true);
    setLoadError("");

    try {
      const [eventData, challengesData] = await Promise.all([
        getEvent(id),
        getChallenges({ event: id }),
      ]);

      if (!isCancelled()) {
        setEvent(eventData);
        setChallenges(challengesData);
      }
    } catch (err) {
      if (!isCancelled()) {
        setLoadError(getErrorMessage(err));
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadData(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddChallenge(event) {
    event.preventDefault();

    const nextFieldErrors = {};
    const parsedPoints = Number(points);

    if (!title.trim()) {
      nextFieldErrors.title = "Title is required.";
    }

    if (
      !points.trim() ||
      !Number.isInteger(parsedPoints) ||
      parsedPoints < 0
    ) {
      nextFieldErrors.points = "Points must be 0 or more.";
    }

    setFieldErrors(nextFieldErrors);
    setCreateError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsAdding(true);

    try {
      const challenge = await createChallenge({
        event: Number(id),
        title: title.trim(),
        category,
        points: parsedPoints,
      });

      setChallenges((current) => [...current, challenge]);
      setTitle("");
      setCategory("misc");
      setPoints("0");
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggleSolved(challenge) {
    setBusyById((current) => ({ ...current, [challenge.id]: "saving" }));
    setChallengeErrors((current) => ({ ...current, [challenge.id]: "" }));

    try {
      const updatedChallenge = await updateChallenge(challenge.id, {
        event: challenge.event,
        title: challenge.title,
        category: challenge.category,
        points: challenge.points,
        solved: !challenge.solved,
      });

      setChallenges((current) =>
        current.map((item) =>
          item.id === challenge.id ? updatedChallenge : item
        )
      );
    } catch (err) {
      setChallengeErrors((current) => ({
        ...current,
        [challenge.id]: getErrorMessage(err),
      }));
    } finally {
      setBusyById((current) => ({ ...current, [challenge.id]: null }));
    }
  }

  async function handleDeleteChallenge(challengeId) {
    if (!window.confirm("Delete this challenge and its writeups?")) {
      return;
    }

    setBusyById((current) => ({ ...current, [challengeId]: "deleting" }));
    setChallengeErrors((current) => ({ ...current, [challengeId]: "" }));

    try {
      await deleteChallenge(challengeId);
      setChallenges((current) =>
        current.filter((challenge) => challenge.id !== challengeId)
      );
    } catch (err) {
      setChallengeErrors((current) => ({
        ...current,
        [challengeId]: getErrorMessage(err),
      }));
    } finally {
      setBusyById((current) => ({ ...current, [challengeId]: null }));
    }
  }

  if (loading) {
    return (
      <p>
        <span className="spinner"></span> Loading...
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="stack">
        <p className="error">{loadError}</p>
        <div className="actions">
          <button className="secondary" onClick={() => loadData()}>
            Try again
          </button>
          <Link to="/events">← All events</Link>
        </div>
      </div>
    );
  }

  const solvedChallenges = challenges.filter((challenge) => challenge.solved);
  const solvedPoints = solvedChallenges.reduce(
    (total, challenge) => total + challenge.points,
    0
  );

  const eventDetails = [
    event.platform,
    event.event_date &&
      new Date(`${event.event_date}T00:00:00`).toLocaleDateString(),
  ].filter(Boolean);

  return (
    <div className="stack">
      <Link to="/events">← All events</Link>

      <div className="stack">
        <div className="row">
          <h1>{event.name}</h1>
          <Link to={`/events/${id}/edit`}>Edit event</Link>
        </div>

        {(eventDetails.length > 0 || event.url) && (
          <p className="muted">
            {eventDetails.join(" · ")}
            {eventDetails.length > 0 && event.url ? " · " : ""}
            {event.url && (
              <a href={event.url} target="_blank" rel="noreferrer">
                {event.url}
              </a>
            )}
          </p>
        )}

        <p className="muted">
          {solvedChallenges.length} of {challenges.length} solved ·{" "}
          {solvedPoints} points
        </p>
      </div>

      <div className="card">
        <form className="stack" onSubmit={handleAddChallenge} noValidate>
          <h2>Add challenge</h2>

          <div className="stack">
            <label htmlFor="challenge-title">Title</label>
            <input
              id="challenge-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {fieldErrors.title && (
              <p className="error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="stack">
            <label htmlFor="challenge-category">Category</label>
            <select
              id="challenge-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="web">Web</option>
              <option value="crypto">Crypto</option>
              <option value="pwn">Pwn</option>
              <option value="reverse">Reverse</option>
              <option value="forensics">Forensics</option>
              <option value="misc">Misc</option>
            </select>
          </div>

          <div className="stack">
            <label htmlFor="challenge-points">Points</label>
            <input
              id="challenge-points"
              type="number"
              min="0"
              value={points}
              onChange={(event) => setPoints(event.target.value)}
            />
            {fieldErrors.points && (
              <p className="error">{fieldErrors.points}</p>
            )}
          </div>

          {createError && <p className="error">{createError}</p>}

          <div className="actions">
            <button type="submit" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add challenge"}
            </button>
          </div>
        </form>
      </div>

      {challenges.length === 0 ? (
        <p className="muted">No challenges yet. Add one above.</p>
      ) : (
        challenges.map((challenge) => {
          const busyState = busyById[challenge.id];

          return (
            <div className="card" key={challenge.id}>
              <div className="row">
                <div className="stack">
                  <h3>
                    <Link to={`/challenges/${challenge.id}`}>
                      {challenge.title}
                    </Link>
                  </h3>
                  <p className="muted">
                    {challenge.category} · {challenge.points} points
                  </p>
                  <span
                    className={
                      challenge.solved ? "badge solved" : "badge unsolved"
                    }
                  >
                    {challenge.solved ? "Solved" : "Unsolved"}
                  </span>
                </div>

                <div className="actions">
                  <button
                    className="secondary"
                    disabled={Boolean(busyState)}
                    onClick={() => handleToggleSolved(challenge)}
                  >
                    {busyState === "saving"
                      ? "Saving..."
                      : challenge.solved
                        ? "Mark unsolved"
                        : "Mark solved"}
                  </button>
                  <button
                    className="danger"
                    disabled={Boolean(busyState)}
                    onClick={() => handleDeleteChallenge(challenge.id)}
                  >
                    {busyState === "deleting" ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>

              {challengeErrors[challenge.id] && (
                <p className="error">{challengeErrors[challenge.id]}</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
