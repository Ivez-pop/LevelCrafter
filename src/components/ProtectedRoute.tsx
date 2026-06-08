import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const { session } = useAuth();

  if (!session) {
    // replace avoids leaving the protected URL in history after redirecting to
    // login, so Back does not immediately bounce the user again.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
