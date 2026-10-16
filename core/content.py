
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

STORY_PATH = (
    ROOT
    / "stories"
    / "iasons_and_the_magic_forest"
    / "story.json"
)

EXPECTED_PAGE_COUNT = 16
LANGUAGES = ("el", "en")
MODES = ("mode1", "mode2")


class ContentValidationError(Exception):
    """Raised when the story content is invalid."""


def load_story(
    path: Path | None = None,
) -> tuple[dict[str, Any], list[str]]:
    """
    Load the story JSON and validate its content.

    Returns:
        A tuple containing the story data and non-fatal warnings.
    """
    story_path = path or STORY_PATH

    if not story_path.is_file():
        raise FileNotFoundError(
            f"Δεν βρέθηκε το αρχείο ιστορίας: {story_path}"
        )

    try:
        with story_path.open("r", encoding="utf-8") as file:
            story = json.load(file)
    except json.JSONDecodeError as exc:
        raise ContentValidationError(
            f"Σφάλμα JSON στη γραμμή {exc.lineno}, "
            f"στήλη {exc.colno}: {exc.msg}"
        ) from exc

    errors = []
    warnings = []

    if not isinstance(story, dict):
        raise ContentValidationError(
            "Το βασικό περιεχόμενο του JSON πρέπει να είναι αντικείμενο."
        )

    # Check essential metadata.
    for key in ("id", "version", "title", "series_title", "pages"):
        if key not in story:
            errors.append(f"Λείπει το βασικό πεδίο: {key}")

    for field in ("title", "series_title"):
        translations = story.get(field, {})
        if not isinstance(translations, dict):
            errors.append(f"Το πεδίο '{field}' πρέπει να περιέχει μεταφράσεις.")
            continue

        for language in LANGUAGES:
            value = translations.get(language)
            if not isinstance(value, str) or not value.strip():
                errors.append(
                    f"Λείπει το {language} κείμενο στο '{field}'."
                )

    pages = story.get("pages", [])
    if not isinstance(pages, list):
        errors.append("Το 'pages' πρέπει να είναι λίστα.")
        pages = []

    if len(pages) != EXPECTED_PAGE_COUNT:
        errors.append(
            f"Αναμένονται {EXPECTED_PAGE_COUNT} σελίδες, "
            f"αλλά βρέθηκαν {len(pages)}."
        )

    asset_dir_value = story.get("asset_dir", "assets/images")
    asset_dir = ROOT / asset_dir_value

    # Check the cover image.
    cover_image = story.get("cover_image")
    if not isinstance(cover_image, str) or not cover_image.strip():
        errors.append("Λείπει το πεδίο 'cover_image'.")
    elif not (asset_dir / cover_image).is_file():
        warnings.append(
            f"Δεν υπάρχει ακόμη εικόνα εξωφύλλου: "
            f"{asset_dir / cover_image}"
        )

    seen_ids = set()

    for index, page in enumerate(pages, start=1):
        if not isinstance(page, dict):
            errors.append(f"Η σελίδα {index} δεν είναι έγκυρο αντικείμενο.")
            continue

        expected_id = f"page_{index:02d}"

        page_id = page.get("id")
        if page_id != expected_id:
            errors.append(
                f"Στη θέση {index}: αναμενόταν id '{expected_id}', "
                f"βρέθηκε '{page_id}'."
            )

        if page_id in seen_ids:
            errors.append(f"Διπλό page id: '{page_id}'.")

        seen_ids.add(page_id)

        if page.get("number") != index:
            errors.append(
                f"Η σελίδα '{page_id}' πρέπει να έχει number={index}."
            )

        # Check illustration reference.
        image_name = page.get("image")
        if not isinstance(image_name, str) or not image_name.strip():
            errors.append(f"Λείπει η εικόνα στη σελίδα '{page_id}'.")
        elif not (asset_dir / image_name).is_file():
            warnings.append(
                f"Δεν υπάρχει ακόμη εικόνα για τη σελίδα "
                f"'{page_id}': {asset_dir / image_name}"
            )

        # Check both languages and both reading modes.
        text_data = page.get("text")
        if not isinstance(text_data, dict):
            errors.append(f"Λείπει το πεδίο 'text' στη σελίδα '{page_id}'.")
            continue

        for language in LANGUAGES:
            language_data = text_data.get(language)

            if not isinstance(language_data, dict):
                errors.append(
                    f"Λείπουν τα κείμενα {language} στη σελίδα '{page_id}'."
                )
                continue

            for mode in MODES:
                value = language_data.get(mode)

                if not isinstance(value, str) or not value.strip():
                    errors.append(
                        f"Λείπει το κείμενο {language}/{mode} "
                        f"στη σελίδα '{page_id}'."
                    )

    if errors:
        details = "\n".join(f"- {error}" for error in errors)
        raise ContentValidationError(
            f"Το περιεχόμενο της ιστορίας δεν είναι έγκυρο:\n{details}"
        )

    return story, warnings


def get_page_text(
    story: dict[str, Any],
    page_number: int,
    language: str = "el",
    mode: str = "mode1",
) -> str:
    """Return the text for a specific page, language and reading mode."""
    if language not in LANGUAGES:
        raise ValueError(f"Μη υποστηριζόμενη γλώσσα: {language}")

    if mode not in MODES:
        raise ValueError(f"Μη υποστηριζόμενο mode: {mode}")

    pages = story["pages"]

    if not 1 <= page_number <= len(pages):
        raise IndexError(f"Δεν υπάρχει σελίδα {page_number}.")

    return pages[page_number - 1]["text"][language][mode]
