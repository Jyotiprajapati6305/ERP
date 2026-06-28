import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <button onClick={logout} className="text-sm text-gray-600 underline">
          Logout
        </button>
      </div>
      <p className="mt-6 text-sm text-gray-600">Welcome, {user?.name ?? "there"}.</p>
    </div>
  );
}
