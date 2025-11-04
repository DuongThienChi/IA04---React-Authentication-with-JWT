import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: ReactNode;
}

export function ProtectedRoute({ redirectPath = '/login', children }: ProtectedRouteProps) {
  const { accessToken, isHydrating } = useAuth();

  if (isHydrating) {
    return <div className="page-loading">Checking session…</div>;
  }

  if (!accessToken) {
    return <Navigate to={redirectPath} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
