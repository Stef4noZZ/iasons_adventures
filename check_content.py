
from core.content import (
    ContentValidationError,
    get_page_text,
    load_story,
)


def main():
    try:
        story, warnings = load_story()

        print("Ο έλεγχος περιεχομένου ολοκληρώθηκε επιτυχώς.")
        print(f"Ιστορία: {story['title']['el']}")
        print(f"Σελίδες: {len(story['pages'])}")

        for warning in warnings:
            print(f"ΠΡΟΕΙΔΟΠΟΙΗΣΗ: {warning}")

        print("\nΔοκιμαστικό κείμενο πρώτης σελίδας:")
        print(get_page_text(story, 1, "el", "mode1"))

    except (ContentValidationError, FileNotFoundError) as error:
        print(f"ΣΦΑΛΜΑ: {error}")


if __name__ == "__main__":
    main()
