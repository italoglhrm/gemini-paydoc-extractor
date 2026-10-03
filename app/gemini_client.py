"""Async multimodal call to Gemini (design D4).

The uploaded bytes go straight to the model as an inline `Part`; nothing is stored (R14).
Every failure mode is re-raised as `GeminiExtractionError` so the HTTP layer maps it to 502 (R11).
"""

import logging

import httpx
from google import genai
from google.genai import errors, types
from pydantic import ValidationError

from app.prompts import SYSTEM_PROMPT, USER_PROMPT
from app.schemas import ExtractionResult

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_MS = 60_000


class GeminiExtractionError(Exception):
    """The Gemini call failed or returned something unusable."""


class GeminiClient:
    def __init__(self, api_key: str, model: str) -> None:
        self._model = model
        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=REQUEST_TIMEOUT_MS),
        )

    async def extract(self, content: bytes, mime_type: str) -> ExtractionResult:
        try:
            response = await self._client.aio.models.generate_content(
                model=self._model,
                contents=[
                    types.Part.from_bytes(data=content, mime_type=mime_type),
                    USER_PROMPT,
                ],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ExtractionResult,
                    temperature=0.0,
                ),
            )
        except errors.APIError as exc:
            logger.warning("Gemini API error: code=%s status=%s", exc.code, exc.status)
            raise GeminiExtractionError(
                f"Gemini API error ({exc.code} {exc.status}): {exc.message}"
            ) from exc
        except httpx.HTTPError as exc:
            logger.warning("Gemini transport error: %s", type(exc).__name__)
            raise GeminiExtractionError(
                f"Could not reach the Gemini API ({type(exc).__name__})."
            ) from exc

        text = response.text
        if not text:
            raise GeminiExtractionError(f"Gemini returned no content ({_empty_reason(response)}).")

        try:
            return ExtractionResult.model_validate_json(text)
        except ValidationError as exc:
            logger.warning("Gemini returned a response that does not match the schema")
            raise GeminiExtractionError(
                "Gemini returned a response that does not match the expected schema: "
                f"{_summarize(exc)}"
            ) from exc

    async def aclose(self) -> None:
        await self._client.aio.aclose()


def _empty_reason(response: types.GenerateContentResponse) -> str:
    feedback = response.prompt_feedback
    if feedback and feedback.block_reason:
        return f"prompt blocked: {feedback.block_reason}"
    if response.candidates and response.candidates[0].finish_reason:
        return f"finish reason: {response.candidates[0].finish_reason}"
    return "no candidates"


def _summarize(exc: ValidationError) -> str:
    # Locations and messages only. The raw input is the model's output about a private document.
    return "; ".join(
        f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}" for err in exc.errors()[:5]
    )
