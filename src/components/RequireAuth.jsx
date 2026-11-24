import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api.js";

// Bi checki iza el user 3emel login abl ma yfarjih el page
export default function RequireAuth({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let alive = true;
    api
      .me()
      .then((user) => alive && setState({ loading: false, user }))
      .catch(() => alive && setState({ loading: false, user: null }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) return null;
  if (!state.user) return <Navigate to="/login" replace />;
  return typeof children === "function" ? children(state.user) : children;
}
