"""Settings. Invalid or missing configuration stops the app at startup."""

import re

from pydantic import Field, ValidationError, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# scheme://host[:port], no path and no trailing slash. "*" and empty entries do not match.
_ORIGIN = re.compile(r"https?://[A-Za-z0-9.-]+(:\d{1,5})?")


class ConfigError(RuntimeError):
    """Raised at startup when the environment is not usable."""


def _describe(err: dict) -> str:
    if err["type"] == "missing":
        return "is not set"
    if err["type"] == "string_too_short":
        return "must not be empty"
    if err["type"] == "value_error":
        return err["msg"].removeprefix("Value error, ")
    return err["msg"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str = Field(min_length=1)
    gemini_model: str = "gemini-3.5-flash-lite"
    max_upload_mb: int = Field(default=10, gt=0)
    low_confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    # Comma-separated. Kept as a string so it works with any pydantic-settings version.
    cors_origins: str = "http://localhost:5173"

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def _strip_key(cls, value: object) -> object:
        # Whitespace-only counts as missing.
        return value.strip() if isinstance(value, str) else value

    @field_validator("cors_origins")
    @classmethod
    def _check_origins(cls, value: str) -> str:
        origins = [o.strip() for o in value.split(",")]
        for origin in origins:
            if not _ORIGIN.fullmatch(origin):
                raise ValueError(
                    f"{origin!r} is not a valid origin. Use scheme://host[:port] with no path "
                    "or trailing slash, separated by commas ('*' is not allowed)."
                )
        return ",".join(origins)

    @property
    def cors_origin_list(self) -> list[str]:
        return self.cors_origins.split(",")

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
            "See .env.example for the expected settings (GEMINI_API_KEY is required)."
        ) from None
