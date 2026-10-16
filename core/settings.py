
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SETTINGS_PATH = ROOT / "config" / "user_state.json"

DEFAULT_SETTINGS = {
    "ui_language": "el",
    "story_language": "el",
    "mode": "mode1",
    "last_page": 1,
    "fullscreen": False,
}


def load_settings():
    """Load saved preferences, falling back to defaults if necessary."""
    settings = DEFAULT_SETTINGS.copy()

    if not SETTINGS_PATH.is_file():
        return settings

    try:
        with SETTINGS_PATH.open("r", encoding="utf-8") as file:
            saved = json.load(file)

        if isinstance(saved, dict):
            settings.update(saved)

    except (OSError, json.JSONDecodeError):
        # Recover safely if the settings file is damaged.
        pass

    # Validate values before using them in the UI.
    if settings["ui_language"] not in ("el", "en"):
        settings["ui_language"] = "el"

    if settings["story_language"] not in ("el", "en"):
        settings["story_language"] = "el"

    if settings["mode"] not in ("mode1", "mode2"):
        settings["mode"] = "mode1"

    try:
        settings["last_page"] = max(1, int(settings["last_page"]))
    except (TypeError, ValueError):
        settings["last_page"] = 1

    settings["fullscreen"] = bool(settings["fullscreen"])

    return settings


def save_settings(settings):
    """Save preferences to the local configuration file."""
    SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)

    temporary_path = SETTINGS_PATH.with_suffix(".tmp")

    with temporary_path.open("w", encoding="utf-8") as file:
        json.dump(
            settings,
            file,
            ensure_ascii=False,
            indent=2,
        )

    temporary_path.replace(SETTINGS_PATH)
