import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  return sessionStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}
