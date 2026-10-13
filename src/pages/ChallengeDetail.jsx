import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  createWriteup,
  deleteWriteup,
  getChallenge,
  getErrorMessage,
  getWriteups,
} from "../api/client";

export default function ChallengeDetail() {
  const { id } = useParams();

  return <ChallengeDetailContent key={id} id={id} />;
}

function ChallengeDetailContent({ id }) {
  const [challenge, setChallenge] = useState(null);
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [toolsUsed, setToolsUsed] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [createError, setCreateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [writeupErrors, setWriteupErrors] = useState({});

  async function loadData(isCancelled = () => false) {
    setLoading(true);
    setLoadError("");

    try {
      const [challengeData, writeupsData] = await Promise.all([
        getChallenge(id),
        getWriteups({ challenge: id }),
      ]);

      if (!isCancelled()) {
        setChallenge(challengeData);
        setWriteups(writeupsData);
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

  async function handleAddWriteup(event) {
    event.preventDefault();

    const nextFieldErrors = {};
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      nextFieldErrors.title = "Title is required.";
    }

    if (!trimmedContent) {
      nextFieldErrors.content = "Content is required.";
    }

    setFieldErrors(nextFieldErrors);
    setCreateError("");

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    try {
      const writeup = await createWriteup({
        challenge: Number(id),
        title: trimmedTitle,
        content: trimmedContent,
        tools_used: toolsUsed.trim(),
      });

      setWriteups((current) => [writeup, ...current]);
      setTitle("");
      setContent("");
      setToolsUsed("");
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteWriteup(writeupId) {
    if (!window.confirm("Delete this writeup?")) {
      return;
    }

    setDeletingId(writeupId);
    setWriteupErrors((current) => ({ ...current, [writeupId]: "" }));

    try {
      await deleteWriteup(writeupId);
      setWriteups((current) =>
        current.filter((writeup) => writeup.id !== writeupId)
      );
    } catch (err) {
      setWriteupErrors((current) => ({
        ...current,
        [writeupId]: getErrorMessage(err),
      }));
    } finally {
      setDeletingId(null);
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
          <Link to="/events">← Back to events</Link>
        </div>
      </div>
    );
  }

  const createdDate = (value) => new Date(value).toLocaleDateString();

  return (
    <div className="stack">
      <Link to={`/events/${challenge.event}`}>← Back to event</Link>

      <div className="stack">
        <div className="row">
          <h1>{challenge.title}</h1>
          <span
            className={
              challenge.solved ? "badge solved" : "badge unsolved"
            }
          >
            {challenge.solved ? "Solved" : "Unsolved"}
          </span>
        </div>
        <p className="muted">
          {challenge.category} · {challenge.points} points ·{" "}
          {challenge.event_name}
        </p>
      </div>

      <div className="card">
        <form className="stack" onSubmit={handleAddWriteup} noValidate>
          <h2>Add writeup</h2>

          <div className="stack">
            <label htmlFor="writeup-title">Title</label>
            <input
              id="writeup-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {fieldErrors.title && (
              <p className="error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="stack">
            <label htmlFor="writeup-content">Content</label>
            <textarea
              id="writeup-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            {fieldErrors.content && (
              <p className="error">{fieldErrors.content}</p>
            )}
          </div>

          <div className="stack">
            <label htmlFor="writeup-tools">Tools used</label>
            <input
              id="writeup-tools"
              type="text"
              value={toolsUsed}
              onChange={(event) => setToolsUsed(event.target.value)}
            />
          </div>

          {createError && <p className="error">{createError}</p>}

          <div className="actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add writeup"}
            </button>
          </div>
        </form>
      </div>

      {writeups.length === 0 ? (
        <p className="muted">No writeups yet. Add your first one above.</p>
      ) : (
        writeups.map((writeup) => (
          <div className="card stack" key={writeup.id}>
            <div className="row">
              <h3>{writeup.title}</h3>
              <button
                className="danger"
                onClick={() => handleDeleteWriteup(writeup.id)}
                disabled={deletingId === writeup.id}
              >
                {deletingId === writeup.id ? "Deleting..." : "Delete"}
              </button>
            </div>

            {(writeup.tools_used || writeup.created_at) && (
              <p className="muted">
                {writeup.tools_used && `Tools: ${writeup.tools_used}`}
                {writeup.tools_used && writeup.created_at && " · "}
                {writeup.created_at && createdDate(writeup.created_at)}
              </p>
            )}

            <p className="writeup-content">{writeup.content}</p>

            {writeupErrors[writeup.id] && (
              <p className="error">{writeupErrors[writeup.id]}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
