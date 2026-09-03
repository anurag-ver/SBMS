import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useMainContext } from "../context/MainContext";

const links = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutHandler } = useMainContext();

  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = () => {
    closeMenu();
    logoutHandler();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10"
        aria-label="Main navigation"
      >
        <Link to="/" className="flex items-center" onClick={closeMenu} aria-label="SBMS home">
          <span className="text-2xl font-extrabold tracking-[0.14em] text-[#1e2678]">SBMS</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-[#1e2678] ${
                  isActive ? "text-[#1e2678]" : "text-slate-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-[#1e2678] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#171d60] focus:outline-none focus:ring-2 focus:ring-[#1e2678] focus:ring-offset-2"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-[#1e2678] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#171d60] focus:outline-none focus:ring-2 focus:ring-[#1e2678] focus:ring-offset-2"
            >
              Log in
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-md p-2 text-[#1e2678] transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e2678] md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {isMenuOpen ? (
              <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-md px-3 py-3 text-sm font-medium transition hover:bg-slate-50 hover:text-[#1e2678] ${
                    isActive ? "bg-slate-50 text-[#1e2678]" : "text-slate-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-lg bg-[#1e2678] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#171d60]"
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-2 rounded-lg bg-[#1e2678] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#171d60]"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
