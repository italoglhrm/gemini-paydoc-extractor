"""HTTP layer (design D6): routes, input validation, error mapping, fail-fast startup."""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile

from app.config import Settings, load_settings
from app.extraction_service import Extractor, extract_document
from app.gemini_client import GeminiClient, GeminiExtractionError
from app.schemas import ExtractResponse

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Raises ConfigError if GEMINI_API_KEY is missing, so the app never starts half-configured (R10).
    settings = load_settings()
    client = GeminiClient(settings.gemini_api_key, settings.gemini_model)
    app.state.settings = settings
    app.state.extractor = client
    yield
    await client.aclose()


app = FastAPI(
    title="Gemini Payment-Document Extractor",
    description="Upload an invoice, boleto, receipt or waybill; get structured JSON with per-field confidence.",
    lifespan=lifespan,
)


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_extractor(request: Request) -> Extractor:
    return request.app.state.extractor


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractResponse)
async def extract(
    # Optional in the signature so a missing part reaches our code and yields 400 (R4), not 422.
    file: UploadFile | None = File(default=None),
    settings: Settings = Depends(get_settings),
    extractor: Extractor = Depends(get_extractor),
) -> ExtractResponse:
    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded. Send it as multipart field 'file'.")

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported content type '{content_type or 'unknown'}'. Use PDF, JPEG or PNG.",
        )

    max_bytes = settings.max_upload_bytes
    content = await file.read(max_bytes + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the {settings.max_upload_mb} MB limit.",
        )

    try:
        return await extract_document(
            extractor, content, content_type, settings.low_confidence_threshold
        )
    except GeminiExtractionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
