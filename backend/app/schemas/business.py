import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

DEFAULT_MODULES = [
    "dashboard", "products", "inventory", "customers",
    "suppliers", "sales", "purchases", "expenses", "reports", "settings",
]

OPTIONAL_MODULES = [
    "employees", "payroll", "advanced_crm", "pos", "ai_assistant",
    "product_catalog", "orders", "gift_hampers", "online_store",
    "delivery_tracking", "clients", "projects", "invoices", "accounting",
]

BUSINESS_TYPES = [
    "gift_shop", "grocery_store", "bakery", "restaurant", "clothing_store",
    "electronics_shop", "pharmacy", "salon", "manufacturer", "wholesaler",
    "service_business", "freelancer", "digital_agency", "interior_designer",
    "event_planner", "online_seller", "other",
]


class AIWizardAnswers(BaseModel):
    sells_products: bool = False
    has_physical_inventory: bool = False
    sells_online: bool = False
    has_employees: bool = False
    wants_billing_pos: bool = False
    purchases_from_suppliers: bool = False
    needs_accounting: bool = False
    wants_ai_assistance: bool = False


def modules_from_wizard(business_type: str, answers: AIWizardAnswers) -> list[str]:
    modules = list(DEFAULT_MODULES)

    if answers.has_physical_inventory:
        modules.append("inventory")
    if answers.purchases_from_suppliers:
        modules.append("suppliers")
    if answers.wants_billing_pos:
        modules.append("pos")
    if answers.has_employees:
        modules.append("employees")
    if answers.needs_accounting:
        modules.append("accounting")
    if answers.wants_ai_assistance:
        modules.append("ai_assistant")

    if answers.sells_online:
        modules += ["online_store", "orders", "delivery_tracking"]
    if answers.sells_products:
        modules.append("product_catalog")

    if business_type in ("freelancer", "digital_agency", "interior_designer", "event_planner", "service_business"):
        modules += ["clients", "projects", "invoices"]
    if business_type == "gift_shop":
        modules.append("gift_hampers")

    return sorted(set(modules))


class BusinessCreate(BaseModel):
    business_name: str = Field(min_length=1, max_length=255)
    logo: str | None = None
    industry_type: str
    number_of_employees: int | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    gst_number: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    wizard_answers: AIWizardAnswers = Field(default_factory=AIWizardAnswers)


class BusinessSettingsOut(BaseModel):
    ai_enabled: bool
    ai_chat_enabled: bool
    ai_insights_enabled: bool
    modules_enabled: dict[str, bool]

    model_config = {"from_attributes": True}


class BusinessOut(BaseModel):
    id: uuid.UUID
    name: str
    logo: str | None
    industry_type: str
    number_of_employees: int | None
    country: str | None
    state: str | None
    city: str | None
    gst_number: str | None
    phone: str | None
    email: str | None
    address: str | None
    currency: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}
