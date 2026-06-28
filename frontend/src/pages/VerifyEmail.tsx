import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "@/lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        if (isAxiosError(err) && err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Could not verify your account");
        }
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 p-8 text-center">
        {status === "pending" && <p className="text-sm text-gray-600">Verifying your account...</p>}
        {status === "success" && (
          <>
            <h1 className="mb-2 text-xl font-semibold">Account verified</h1>
            <p className="text-sm text-gray-600">You can now sign in to your account.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="mb-2 text-xl font-semibold">Verification failed</h1>
            <p className="text-sm text-error">{error}</p>
          </>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-black underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
