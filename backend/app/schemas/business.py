import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

DEFAULT_MODULES = [
    "dashboard", "products", "inventory", "customers",
    "suppliers", "sales", "purchases", "expenses", "reports", "settings",
]

OPTIONAL_MODULES = ["employees", "payroll", "advanced_crm", "pos", "ai_assistant"]

INDUSTRY_TYPES = [
    "retail", "clothing", "grocery", "electronics",
    "pharmacy", "restaurant", "manufacturing", "service",
]


class BusinessCreate(BaseModel):
    business_name: str = Field(min_length=1, max_length=255)
    logo: str | None = None
    industry_type: str
    gst_number: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"
    enabled_modules: list[str] = Field(default_factory=lambda: list(DEFAULT_MODULES))


class BusinessOut(BaseModel):
    id: uuid.UUID
    name: str
    logo: str | None
    industry_type: str
    gst_number: str | None
    phone: str | None
    email: str | None
    address: str | None
    currency: str
    timezone: str
    created_at: datetime

    model_config = {"from_attributes": True}
