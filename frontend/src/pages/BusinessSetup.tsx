import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "@/lib/api";

const BUSINESS_TYPES = [
  "gift_shop", "grocery_store", "bakery", "restaurant", "clothing_store",
  "electronics_shop", "pharmacy", "salon", "manufacturer", "wholesaler",
  "service_business", "freelancer", "digital_agency", "interior_designer",
  "event_planner", "online_seller", "other",
];

const WIZARD_QUESTIONS: { key: keyof WizardAnswers; label: string }[] = [
  { key: "sells_products", label: "Do you sell physical products?" },
  { key: "has_physical_inventory", label: "Do you have physical inventory?" },
  { key: "sells_online", label: "Do you sell online?" },
  { key: "has_employees", label: "Do you have employees?" },
  { key: "wants_billing_pos", label: "Do you want billing/POS?" },
  { key: "purchases_from_suppliers", label: "Do you purchase from suppliers?" },
  { key: "needs_accounting", label: "Do you need accounting?" },
  { key: "wants_ai_assistance", label: "Do you want AI assistance?" },
];

interface WizardAnswers {
  sells_products: boolean;
  has_physical_inventory: boolean;
  sells_online: boolean;
  has_employees: boolean;
  wants_billing_pos: boolean;
  purchases_from_suppliers: boolean;
  needs_accounting: boolean;
  wants_ai_assistance: boolean;
}

const STEP_COUNT = 4;

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
    number_of_employees: "",
    country: "",
    state: "",
    city: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers>({
    sells_products: false,
    has_physical_inventory: false,
    sells_online: false,
    has_employees: false,
    wants_billing_pos: false,
    purchases_from_suppliers: false,
    needs_accounting: false,
    wants_ai_assistance: false,
  });

  function toggleAnswer(key: keyof WizardAnswers) {
    setWizardAnswers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function finish() {
    setError(null);
    setLoading(true);
    try {
      await api.post("/businesses", {
        business_name: form.business_name,
        industry_type: form.industry_type,
        gst_number: form.gst_number || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        number_of_employees: form.number_of_employees ? Number(form.number_of_employees) : null,
        country: form.country || null,
        state: form.state || null,
        city: form.city || null,
        currency: form.currency,
        timezone: form.timezone,
        wizard_answers: wizardAnswers,
      });
      navigate("/dashboard");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Could not create business");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 p-8">
        <h1 className="mb-1 text-xl font-semibold">Set up your business</h1>
        <p className="mb-6 text-sm text-gray-500">
          Step {step} of {STEP_COUNT}
        </p>

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
              placeholder="Business logo URL (optional)"
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
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, industry_type: type })}
                  className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                    form.industry_type === type
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {type.replace("_", " ")}
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
            <input
              type="number"
              min={0}
              placeholder="Number of employees"
              value={form.number_of_employees}
              onChange={(e) => setForm({ ...form, number_of_employees: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Currency (e.g. INR)"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <input
              placeholder="Time zone (e.g. Asia/Kolkata)"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="w-full rounded-xl border border-gray-300 py-2 text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">A few questions to set up your dashboard</p>
            <div className="space-y-2">
              {WIZARD_QUESTIONS.map((q) => (
                <label key={q.key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={wizardAnswers[q.key]}
                    onChange={() => toggleAnswer(q.key)}
                  />
                  {q.label}
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(3)}
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
