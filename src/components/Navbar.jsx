import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { initials } from "../utils/helpers";
import { useApp } from "../context/AppContext";
import { btnGhost } from "../styles";
import Logo from "../components/Logo";

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
            <span className="grid size-8 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
              {initials(user?.name)}
            </span>
            {user?.name}
          </span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={btnGhost}
          >
            <FiLogOut size={16} />
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}
