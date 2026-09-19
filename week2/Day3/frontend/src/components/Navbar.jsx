import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

const handleLogout = () => {
  logout();
  navigate("/login");
};


  const initials = user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 mx-4 mt-4 flex items-center justify-between rounded-2xl border border-white/40 bg-white/30 px-6 py-3 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🍃</span>
        <span className="text-lg font-semibold text-emerald-950">
          KanbanFlow
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-emerald-950">
            {user?.name ?? "Guest User"}
          </span>
          <span className="text-xs text-emerald-900/60">
            {user?.email ?? ""}
          </span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
          {initials}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="cursor-pointer rounded-full border border-white/50 bg-white/40 px-4 py-2 text-sm font-medium text-emerald-950 backdrop-blur-md transition duration-150 ease-out hover:bg-white/70 hover:shadow-md active:scale-95 active:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
