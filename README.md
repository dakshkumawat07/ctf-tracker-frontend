# 🚩 CTF Tracker

A responsive React app for tracking CTF (Capture The Flag) competitions: log the events you play, the challenges inside them, and write up how you solved each one. It consumes its own JWT-authenticated Django REST API. All data is real, with no mock arrays.

## 🌐 Live Demo
**https://ctf-tracker-frontend.vercel.app**

Register your own account on the login page to try it. Everything (register, log in, and full create / read / update / delete) runs live against a PostgreSQL database.

- **Backend repo:** [ctf-tracker-api](https://github.com/dakshkumawat07/ctf-tracker-api)
- **Backend URL:** https://ctf-tracker-api.onrender.com

> ⚠️ The backend runs on Render's free tier, which spins down after 15 minutes of inactivity. If the app has been idle, the first request can take 30–60 seconds while it wakes up.

## 📖 Project Overview
CTF players collect scattered notes across many events. This app keeps them in one place: an **event** has **challenges** (with category and points), and each challenge has **writeups** with the tools you used. A progress line on each event shows how many challenges you solved and the points earned.

## ✨ Features
- Account registration and login with JWT; protected routes redirect logged-out users to the login page
- **Events:** list, create, edit and delete
- **Challenges** inside each event: add, mark solved or unsolved with one click, delete; category and points tracked
- Live progress summary per event ("3 of 7 solved · 450 points")
- **Writeups** per challenge: add and delete, with the tools used
- Client-side form validation before any request is sent, with inline messages
- Visible **loading**, **error** (with "Try again") and **empty** states on every screen, so there are no blank pages or silent failures
- Confirmation prompts before destructive actions, and per-item busy states while saving or deleting
- Automatic redirect to login when a session expires
- Responsive layout (phone and desktop) with automatic light and dark mode

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| UI | React (Vite) |
| Routing | React Router |
| HTTP client | Axios (request and response interceptors) |
| Styling | Plain CSS with CSS variables, light and dark themes |
| State | React hooks (`useState`, `useEffect`) |
| Hosting | Vercel |
| Backend | Django REST Framework on Render ([ctf-tracker-api](https://github.com/dakshkumawat07/ctf-tracker-api)) |

## 🧭 Routes
| Path | Access | Page |
|---|---|---|
| `/login` | Public | Log in |
| `/register` | Public | Create an account |
| `/events` | Protected | List of your events |
| `/events/new` | Protected | Add an event |
| `/events/:id` | Protected | Event detail: its challenges and progress |
| `/events/:id/edit` | Protected | Edit an event |
| `/challenges/:id` | Protected | Challenge detail: its writeups |

Unknown URLs redirect to `/events`.

## ⚙️ Local Setup
The app needs the backend running. Start [ctf-tracker-api](https://github.com/dakshkumawat07/ctf-tracker-api) locally first (default `http://127.0.0.1:8000`).

```bash
git clone https://github.com/dakshkumawat07/ctf-tracker-frontend.git
cd ctf-tracker-frontend
npm install
cp .env.example .env
npm run dev
```
Open the URL Vite prints (normally `http://localhost:5173`).

> The backend only allows requests from `http://localhost:5173` by default. If Vite starts on a different port because 5173 is busy, API calls will fail with a network error. Stop whatever is using 5173 and restart.

Create a production build to check for errors:
```bash
npm run build
```

## 🔐 Environment Variables
| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the API, **including the trailing slash** | `http://127.0.0.1:8000/api/` locally, `https://ctf-tracker-api.onrender.com/api/` in production |

To point the app at a different API, change this value in `.env` locally or in the hosting dashboard. No code changes are needed. `.env` is git-ignored, and `.env.example` documents the variable.

## 🚢 Deployment
- **Frontend:** Vercel, deployed straight from this repo. `VITE_API_BASE_URL` is set in the Vercel dashboard.
- **Client-side routing:** `vercel.json` rewrites every path to `index.html`, so refreshing or opening a deep link such as `/events/3` works instead of returning a 404.
- **CORS:** the backend must list this app's exact origin (for example `https://ctf-tracker-frontend.vercel.app`, no trailing slash) in its `CORS_ALLOWED_ORIGINS`, otherwise the browser blocks every API call.

## 📁 Project Structure
```
ctf-tracker-frontend/
├── src/
│   ├── api/
│   │   └── client.js          # axios instance, interceptors, all API functions, error helper
│   ├── components/
│   │   ├── Layout.jsx         # navbar with logout + page container
│   │   └── ProtectedRoute.jsx # route guard
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── EventList.jsx
│   │   ├── EventForm.jsx      # create and edit in one component
│   │   ├── EventDetail.jsx    # challenges and progress
│   │   └── ChallengeDetail.jsx # writeups
│   ├── App.jsx                # route configuration
│   ├── main.jsx
│   └── index.css              # responsive light/dark styles
├── vercel.json
├── .env.example
└── package.json
```

## 🧠 How It Works
- **One API module.** Every request goes through a single axios instance. A request interceptor attaches the JWT from `localStorage`, and a response interceptor sends the user back to login on an expired session (while letting login and register show their own errors).
- **Friendly errors.** One `getErrorMessage` helper turns field-level API errors and unreachable-server failures into readable messages, which every page displays.
- **Route guard.** `ProtectedRoute` and `Layout` wrap all private pages, so access control and the navbar live in one place.
- **One form, two modes.** `EventForm` handles both create and edit, keyed by the route parameter so its state resets when you move between records.
- **Data safety in the UI.** The API only returns your own records, and the UI never sends empty strings for optional dates (they are sent as `null`).

## 🔒 Security Notes
- The access token is kept in `localStorage` for simplicity. That is a common tradeoff for a small app, and `httpOnly` cookies would better protect against XSS in a larger one.
- Tokens are short-lived (30 minutes), and there are no secrets in this repo. The only configuration value is the public API address.

## 🧠 Concepts Demonstrated
- Consuming a real authenticated REST API with a centralized client and interceptors
- Client-side routing with public and protected routes
- Loading, error and empty states as first-class UI states
- Client-side validation that blocks submission, plus server error display
- Reusing one component for create and edit
- Deploying a SPA with environment variables and a rewrite rule, and fixing CORS between two hosts

## 🔭 Planned Improvements
- Refresh-token handling so sessions renew automatically
- Search and filtering (by category or solved status) in the UI
- Edit screens for challenges and writeups
- Per-category statistics and charts

## 👤 Author
Daksh Kumawat — [@dakshkumawat07](https://github.com/dakshkumawat07)
