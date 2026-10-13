import { Link, Outlet, useNavigate } from "react-router-dom";

import { logout } from "../api/client";

export default function Layout() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <header className="navbar">
        <Link to="/events">CTF Tracker</Link>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
