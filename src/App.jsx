import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Chat from "./pages/Chat.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      {/* nafs el component la tnenon, hek byemshi el animation bel tabdil */}
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <Chat />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
