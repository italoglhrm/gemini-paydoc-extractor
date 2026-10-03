"""Orchestration and deterministic confidence aggregation (design D3).

`overall_confidence` and `low_confidence_fields` are computed here, never by the model (R9).
"""

from typing import Protocol

from app.schemas import DocumentData, ExtractionResult, ExtractResponse

FIELD_NAMES: tuple[str, ...] = tuple(DocumentData.model_fields)


class Extractor(Protocol):
    async def extract(self, content: bytes, mime_type: str) -> ExtractionResult: ...


def summarize_confidence(result: ExtractionResult, threshold: float) -> tuple[float, list[str]]:
    """Return `(overall_confidence, low_confidence_fields)`.

    Only fields that were actually extracted count. A null already means "not determined" (R7),
    so it neither drags the average down nor is flagged as low confidence.
    """
    extracted = [
        (name, getattr(result.confidence, name))
        for name in FIELD_NAMES
        if getattr(result.data, name) is not None
    ]
    if not extracted:
        return 0.0, []
    overall = round(sum(score for _, score in extracted) / len(extracted), 3)
    low = [name for name, score in extracted if score < threshold]
    return overall, low


async def extract_document(
    extractor: Extractor, content: bytes, mime_type: str, low_confidence_threshold: float
) -> ExtractResponse:
    result = await extractor.extract(content, mime_type)
    overall, low = summarize_confidence(result, low_confidence_threshold)
    return ExtractResponse(
        **result.model_dump(),
        overall_confidence=overall,
        low_confidence_fields=low,
    )
