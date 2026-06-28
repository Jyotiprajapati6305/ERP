import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/business-setup");
    } catch {
      setError("Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 p-8">
        <h1 className="mb-6 text-xl font-semibold">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-black underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
