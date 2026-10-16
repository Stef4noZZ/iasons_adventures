# Jason and the Magic Forest

A bilingual, illustrated children's storybook application inspired by the adventures of little Jason.

The project is being developed in Python with PySide6, with support for Greek and English storytelling, multiple reading modes, and future PDF book exports.

## Features

- **Bilingual interface:** Greek and English.
- **Bilingual stories:** Choose the language of the story independently from the application interface.
- **Two reading modes:**
  - `mode1` — a simple, gentle bedtime story.
  - `mode2` — a more detailed narrative.
- **16 story pages** with structured text content.
- **Page navigation** with progress indication.
- **Fullscreen reading mode.**
- **Automatic image loading** when page illustrations are available.
- **Persistent user settings:** Language preferences, reading mode, last page, and fullscreen preference.
- **Planned PDF exports:** Greek and English editions in both reading modes, formatted for a 21 × 21 cm book.

## Technology Stack

- Python
- PySide6
- ReportLab
- Pillow
- JSON for story content and metadata

## Project Structure

```text
iasons_adventures/
├── main.py
├── check_content.py
├── requirements.txt
├── README.md
├── .gitignore
├── core/
│   ├── content.py
│   └── settings.py
├── stories/
│   └── iasons_and_the_magic_forest/
│       ├── README.md
│       └── story.json
├── assets/
│   └── images/
├── config/
├── tests/
└── exports/
```

Some directories may remain empty during development and may not appear in Git until files are added.

## Requirements

- Python 3.10 or newer recommended.
- pip

## Installation

Clone the repository:

```bash
git clone https://github.com/Stef4noZZ/iasons_adventures.git
cd iasons_adventures
```

Create and activate a virtual environment.

**Windows — PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows — Command Prompt**

```bat
python -m venv .venv
.venv\Scripts\activate.bat
```

Install dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Run the Application

Start the storybook application:

```bash
python main.py
```

## Validate Story Content

Run the content validation script:

```bash
python check_content.py
```

The script checks the story metadata, page structure, translations, and required text fields. It also reports missing illustration files.

## Story Content

The story source is stored in:

`stories/iasons_and_the_magic_forest/story.json`

The JSON file contains story metadata, Greek and English text, reading modes, page