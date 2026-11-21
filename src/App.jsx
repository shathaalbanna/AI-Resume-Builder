import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp, AppProvider } from "./context/AppContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateCV from "./pages/CreateCV";
import CVPage from "./pages/CVPage";

function Protected({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user } = useApp();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <div dir="rtl" className="font-sans text-slate-900">
      <BrowserRouter>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/create-cv" element={<Protected><CreateCV /></Protected>} />
            <Route path="/s/:token" element={<CVPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}
