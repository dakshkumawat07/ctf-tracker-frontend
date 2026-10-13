import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { deleteEvent, getErrorMessage, getEvents } from "../api/client";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteErrors, setDeleteErrors] = useState({});

  async function fetchEvents(cancelled = () => false) {
    setLoading(true);
    setError("");

    try {
      const data = await getEvents();

      if (!cancelled()) {
        setEvents(data);
      }
    } catch (err) {
      if (!cancelled()) {
        setError(getErrorMessage(err));
      }
    } finally {
      if (!cancelled()) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetchEvents(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(eventId) {
    if (!window.confirm("Delete this event and all its challenges?")) {
      return;
    }

    setDeletingId(eventId);
    setDeleteErrors((current) => ({ ...current, [eventId]: "" }));

    try {
      await deleteEvent(eventId);
      setEvents((current) =>
        current.filter((event) => event.id !== eventId)
      );
    } catch (err) {
      setDeleteErrors((current) => ({
        ...current,
        [eventId]: getErrorMessage(err),
      }));
    } finally {
      setDeletingId(null);
    }
  }

  function formatEventDetails(event) {
    const details = [event.platform];

    if (event.event_date) {
      details.push(
        new Date(`${event.event_date}T00:00:00`).toLocaleDateString()
      );
    }

    return details.filter(Boolean).join(" · ");
  }

  return (
    <div className="stack">
      <div className="row">
        <h1>My CTF events</h1>
        <button onClick={() => navigate("/events/new")}>Add event</button>
      </div>

      {loading && (
        <p>
          <span className="spinner"></span> Loading events...
        </p>
      )}

      {!loading && error && (
        <div className="stack">
          <p className="error">{error}</p>
          <div className="actions">
            <button className="secondary" onClick={() => fetchEvents()}>
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="muted">No events yet. Add your first CTF event.</p>
      )}

      {!loading &&
        !error &&
        events.map((event) => (
          <div className="card" key={event.id}>
            <div className="row">
              <div className="stack">
                <h3>
                  <Link to={`/events/${event.id}`}>{event.name}</Link>
                </h3>
                {formatEventDetails(event) && (
                  <p className="muted">{formatEventDetails(event)}</p>
                )}
              </div>

              <div className="actions">
                <Link to={`/events/${event.id}`}>View</Link>
                <button
                  className="secondary"
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="danger"
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                >
                  {deletingId === event.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {deleteErrors[event.id] && (
              <p className="error">{deleteErrors[event.id]}</p>
            )}
          </div>
        ))}
    </div>
  );
}
