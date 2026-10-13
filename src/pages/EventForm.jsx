import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createEvent,
  getErrorMessage,
  getEvent,
  updateEvent,
} from "../api/client";

export default function EventForm() {
  const { id } = useParams();

  return <EventFormFields key={id ?? "new"} id={id} />;
}

function EventFormFields({ id }) {
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [url, setUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      return undefined;
    }

    let cancelled = false;

    async function loadEvent() {
      try {
        const event = await getEvent(id);

        if (!cancelled) {
          setName(event.name || "");
          setPlatform(event.platform || "");
          setEventDate(event.event_date || "");
          setUrl(event.url || "");
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextFieldErrors = {};
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      nextFieldErrors.name = "Name is required.";
    }

    if (
      trimmedUrl &&
      !trimmedUrl.startsWith("http://") &&
      !trimmedUrl.startsWith("https://")
    ) {
      nextFieldErrors.url = "URL must start with http:// or https://.";
    }

    setFieldErrors(nextFieldErrors);
    setSaveError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    const data = {
      name: trimmedName,
      platform: platform.trim(),
      event_date: eventDate || null,
      url: trimmedUrl,
    };

    setIsSaving(true);

    try {
      if (isEditMode) {
        await updateEvent(id, data);
      } else {
        await createEvent(data);
      }

      navigate("/events");
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <p>
        <span className="spinner"></span> Loading event...
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="stack">
        <p className="error">{loadError}</p>
        <p>
          <Link to="/events">Back to events</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <form className="stack" onSubmit={handleSubmit} noValidate>
        <h1>{isEditMode ? "Edit event" : "Add event"}</h1>

        <div className="stack">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {fieldErrors.name && <p className="error">{fieldErrors.name}</p>}
        </div>

        <div className="stack">
          <label htmlFor="platform">Platform</label>
          <input
            id="platform"
            name="platform"
            type="text"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
          />
        </div>

        <div className="stack">
          <label htmlFor="event_date">Event date</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </div>

        <div className="stack">
          <label htmlFor="url">URL</label>
          <input
            id="url"
            name="url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          {fieldErrors.url && <p className="error">{fieldErrors.url}</p>}
        </div>

        {saveError && <p className="error">{saveError}</p>}

        <div className="actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          <Link className="secondary" to="/events">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
