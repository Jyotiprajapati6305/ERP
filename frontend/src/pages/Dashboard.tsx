import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  inventory: "Inventory",
  customers: "Customers",
  suppliers: "Suppliers",
  sales: "Sales",
  purchases: "Purchases",
  expenses: "Expenses",
  reports: "Reports",
  settings: "Settings",
  employees: "Employees",
  payroll: "Payroll",
  advanced_crm: "Advanced CRM",
  pos: "Billing / POS",
  ai_assistant: "AI Assistant",
  product_catalog: "Product Catalog",
  orders: "Orders",
  gift_hampers: "Gift Hampers",
  online_store: "Online Store",
  delivery_tracking: "Delivery Tracking",
  clients: "Clients",
  projects: "Projects",
  invoices: "Invoices",
  accounting: "Accounting",
};

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

interface Business {
  id: string;
  name: string;
  industry_type: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<Record<string, boolean>>(loadChecklist);
  const [business, setBusiness] = useState<Business | null>(null);
  const [modules, setModules] = useState<string[]>([]);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: businesses } = await api.get<Business[]>("/businesses");
        if (businesses.length === 0) {
          navigate("/business-setup");
          return;
        }
        const current = businesses[0];
        setBusiness(current);

        const { data: settings } = await api.get(`/businesses/${current.id}/settings`);
        const enabled = Object.entries(settings.modules_enabled as Record<string, boolean>)
          .filter(([, on]) => on)
          .map(([key]) => key);
        setModules(enabled);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  function toggleItem(key: string) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem("onboarding_checklist", JSON.stringify(next));
  }

  const doneCount = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const navModules = ["dashboard", ...modules.filter((m) => m !== "dashboard")];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-56 border-r border-gray-200 p-4">
        <p className="mb-4 px-2 text-sm font-semibold">{business?.name}</p>
        <nav className="space-y-1">
          {navModules.map((m) => (
            <button
              key={m}
              onClick={() => setActiveModule(m)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                activeModule === m ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {MODULE_LABELS[m] ?? m}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="text-lg font-semibold">{MODULE_LABELS[activeModule] ?? activeModule}</h1>
          <button onClick={logout} className="text-sm text-gray-600 underline">
            Logout
          </button>
        </div>

        {activeModule === "dashboard" ? (
          <>
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
                        <span className={checklist[item.key] ? "text-gray-400 line-through" : ""}>
                          {item.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-4">
              {navModules
                .filter((m) => m !== "dashboard")
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveModule(m)}
                    className="rounded-xl border border-gray-200 p-4 text-left hover:border-black"
                  >
                    <p className="text-sm font-medium">{MODULE_LABELS[m] ?? m}</p>
                    <p className="text-xs text-gray-500">Open module</p>
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-sm text-gray-500">
            {MODULE_LABELS[activeModule] ?? activeModule} module is enabled for your business. Functionality coming
            soon.
          </div>
        )}
      </main>
    </div>
  );
}
