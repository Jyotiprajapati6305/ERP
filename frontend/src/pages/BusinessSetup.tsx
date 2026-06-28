import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/api";

const INDUSTRY_TYPES = [
  "retail", "clothing", "grocery", "electronics",
  "pharmacy", "restaurant", "manufacturing", "service",
];

const DEFAULT_MODULES = [
  "dashboard", "products", "inventory", "customers",
  "suppliers", "sales", "purchases", "expenses", "reports", "settings",
];

const OPTIONAL_MODULES = ["employees", "payroll", "advanced_crm", "pos", "ai_assistant"];

export default function BusinessSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    industry_type: "",
    gst_number: "",
    phone: "",
    email: "",
    address: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [optionalModules, setOptionalModules] = useState<string[]>([]);

  function toggleModule(m: string) {
    setOptionalModules((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function finish() {
    setError(null);
    setLoading(true);
    try {
      await api.post("/businesses", {
        ...form,
        gst_number: form.gst_number || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        enabled_modules: [...DEFAULT_MODULES, ...optionalModules],
      });
      navigate("/dashboard");
    } catch {
      setError("Could not create business");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 p-8">
        <h1 className="mb-1 text-xl font-semibold">Set up your business</h1>
        <p className="mb-6 text-sm text-gray-500">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-4">
            <input
              placeholder="Business name"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="GST number (optional)"
              value={form.gst_number}
              onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Business email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!form.business_name}
              className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Select business type</p>
            <div className="grid grid-cols-2 gap-2">
              {INDUSTRY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, industry_type: type })}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                    form.industry_type === type
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="w-full rounded-xl border border-gray-300 py-2 text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.industry_type}
                className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Optional modules</p>
            <div className="grid grid-cols-2 gap-2">
              {OPTIONAL_MODULES.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleModule(m)}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                    optionalModules.includes(m)
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {m.replace("_", " ")}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-xl border border-gray-300 py-2 text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={finish}
                disabled={loading}
                className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {loading ? "Creating..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
