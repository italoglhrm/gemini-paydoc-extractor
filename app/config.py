"""Settings (design D7). Invalid or missing configuration stops the app at startup (R10)."""

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ConfigError(RuntimeError):
    """Raised at startup when the environment is not usable."""


def _describe(err: dict) -> str:
    if err["type"] == "missing":
        return "is not set"
    if err["type"] == "string_too_short":
        return "must not be empty"
    return err["msg"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str = Field(min_length=1)
    gemini_model: str = "gemini-3.5-flash-lite"
    max_upload_mb: int = Field(default=10, gt=0)
    low_confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def _strip_key(cls, value: object) -> object:
        # Whitespace-only counts as missing.
        return value.strip() if isinstance(value, str) else value

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


def load_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as exc:
        problems = "\n".join(
            f"  - {'.'.join(str(p) for p in err['loc']).upper()}: {_describe(err)}"
            for err in exc.errors()
        )
        raise ConfigError(
            f"Invalid configuration:\n{problems}\n"
            "Copy .env.example to .env and set GEMINI_API_KEY."
        ) from None
