import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { useLogoutMutation } from '../hooks/useLogoutMutation';
import { getErrorMessage } from '../utils/error';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const logoutMutation = useLogoutMutation();

  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.me(),
    staleTime: 60_000,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div>
          <h1>Welcome{user?.displayName ? `, ${user.displayName}` : ''}</h1>
          <p className="muted">{user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </header>

      <section className="dashboard-card">
        <h2>Profile</h2>
        {userQuery.isLoading && <p>Loading profile…</p>}
        {userQuery.isError && (
          <p className="form-error">{getErrorMessage(userQuery.error)}</p>
        )}
        {userQuery.data && (
          <ul className="profile-details">
            <li>
              <strong>Email:</strong> {userQuery.data.email}
            </li>
            <li>
              <strong>Name:</strong> {userQuery.data.displayName ?? 'Not set'}
            </li>
            <li>
              <strong>User ID:</strong> {userQuery.data.id}
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
