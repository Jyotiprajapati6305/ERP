import { useState } from "react";

import { useAuth } from "@/lib/auth";

const CHECKLIST_ITEMS = [
  { key: "company_profile", label: "Complete company profile" },
  { key: "first_product", label: "Add your first product" },
  { key: "first_customer", label: "Add your first customer" },
  { key: "supplier", label: "Add supplier" },
  { key: "first_invoice", label: "Create your first invoice" },
  { key: "invite_employees", label: "Invite employees" },
  { key: "payment_gateway", label: "Connect payment gateway" },
  { key: "ai_assistant", label: "Explore AI Assistant" },
];

function loadChecklist(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem("onboarding_checklist") ?? "{}");
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [checklist, setChecklist] = useState<Record<string, boolean>>(loadChecklist);

  function toggleItem(key: string) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem("onboarding_checklist", JSON.stringify(next));
  }

  const doneCount = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <button onClick={logout} className="text-sm text-gray-600 underline">
          Logout
        </button>
      </div>
      <p className="mt-6 text-sm text-gray-600">Welcome, {user?.name ?? "there"}.</p>

      {doneCount < CHECKLIST_ITEMS.length && (
        <div className="mt-6 max-w-md rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold">Welcome to BusinessFlow!</h2>
          <p className="mb-4 text-sm text-gray-500">
            {doneCount}/{CHECKLIST_ITEMS.length} steps complete
          </p>
          <ul className="space-y-2">
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item.key}>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[item.key])}
                    onChange={() => toggleItem(item.key)}
                  />
                  <span className={checklist[item.key] ? "text-gray-400 line-through" : ""}>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
