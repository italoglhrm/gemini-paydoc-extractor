"""Data models for extraction (design D2).

`ExtractionResult` is exactly what Gemini is asked to produce and doubles as its
response schema, so the field descriptions below are part of the prompt.
`ExtractResponse` adds the values the application computes itself (R9).
"""

from enum import Enum

from pydantic import BaseModel, Field, field_validator


class DocumentType(str, Enum):
    INVOICE = "invoice"
    BOLETO = "boleto"
    RECEIPT = "receipt"
    WAYBILL = "waybill"
    UNKNOWN = "unknown"


class DocumentData(BaseModel):
    """The six extracted fields. `None` means "not determined" (R7)."""

    vendor_name: str | None = Field(
        default=None, description="Name of the vendor/payee the payment is owed to."
    )
    document_number: str | None = Field(
        default=None, description="Invoice, boleto, receipt or waybill number as printed."
    )
    issue_date: str | None = Field(
        default=None, description="Date the document was issued, as YYYY-MM-DD."
    )
    due_date: str | None = Field(
        default=None, description="Payment due date, as YYYY-MM-DD."
    )
    total_amount: float | None = Field(
        default=None,
        description="Total amount due or paid, as a plain decimal number (e.g. 1234.56).",
    )
    currency: str | None = Field(
        default=None, description="ISO 4217 currency code (e.g. BRL, USD, EUR)."
    )

    @field_validator(
        "vendor_name", "document_number", "issue_date", "due_date", "currency", mode="before"
    )
    @classmethod
    def _blank_to_none(cls, value: object) -> object:
        # A model that answers "" instead of null must not leak an empty value (R7).
        if isinstance(value, str):
            return value.strip() or None
        return value

    @field_validator("currency")
    @classmethod
    def _upper_currency(cls, value: str | None) -> str | None:
        return value.upper() if value else value


class DocumentFieldConfidence(BaseModel):
    """One score per `DocumentData` field: how clearly it was stated (R8)."""

    vendor_name: float = Field(ge=0.0, le=1.0)
    document_number: float = Field(ge=0.0, le=1.0)
    issue_date: float = Field(ge=0.0, le=1.0)
    due_date: float = Field(ge=0.0, le=1.0)
    total_amount: float = Field(ge=0.0, le=1.0)
    currency: float = Field(ge=0.0, le=1.0)


class ExtractionResult(BaseModel):
    """What Gemini produces."""

    document_type: DocumentType
    data: DocumentData
    confidence: DocumentFieldConfidence


class ExtractResponse(ExtractionResult):
    """What `POST /extract` returns: the model's output plus app-computed summary (R9)."""

    overall_confidence: float = Field(ge=0.0, le=1.0)
    low_confidence_fields: list[str]
