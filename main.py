
import sys
from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QProgressBar,
    QVBoxLayout,
    QWidget,
)

from core.content import load_story, get_page_text
from core.settings import load_settings, save_settings


ROOT = Path(__file__).resolve().parent
IMAGE_DIR = ROOT / "assets" / "images"


UI_TEXT = {
    "el": {
        "window_title": "Οι Περιπέτειες του μικρού Ιάσονα",
        "ui_language": "Γλώσσα εφαρμογής",
        "story_language": "Γλώσσα ιστορίας",
        "reading_mode": "Αφήγηση",
        "simple_mode": "Απλή αφήγηση",
        "full_mode": "Πλήρης αφήγηση",
        "previous": "← Προηγούμενη",
        "next": "Επόμενη →",
        "fullscreen": "Πλήρης οθόνη",
        "exit_fullscreen": "Έξοδος από πλήρη οθόνη",
        "illustration": "Η εικονογράφηση θα εμφανιστεί εδώ",
        "page": "Σελίδα {current} από {total}",
        "error": "Σφάλμα κατά την εκκίνηση",
    },
    "en": {
        "window_title": "The Adventures of Little Jason",
        "ui_language": "App language",
        "story_language": "Story language",
        "reading_mode": "Reading mode",
        "simple_mode": "Simple story",
        "full_mode": "Full story",
        "previous": "← Previous",
        "next": "Next →",
        "fullscreen": "Full screen",
        "exit_fullscreen": "Exit full screen",
        "illustration": "Illustration will appear here",
        "page": "Page {current} of {total}",
        "error": "Startup error",
    },
}


class StoryWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.story, self.warnings = load_story()
        self.settings = load_settings()

        total_pages = len(self.story["pages"])

        self.current_page = min(
            self.settings["last_page"],
            total_pages,
        )

        self.ui_language = self.settings["ui_language"]
        self.story_language = self.settings["story_language"]
        self.mode = self.settings["mode"]
        self.is_fullscreen = self.settings["fullscreen"]

        self.setMinimumSize(700, 650)
        self.resize(1000, 800)

        central = QWidget()
        central.setObjectName("centralWidget")
        self.setCentralWidget(central)

        layout = QVBoxLayout(central)
        layout.setContentsMargins(32, 24, 32, 24)
        layout.setSpacing(18)

        self.title_label = QLabel()
        self.title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title_label.setWordWrap(True)
        self.title_label.setObjectName("storyTitle")
        layout.addWidget(self.title_label)

        controls = QHBoxLayout()
        controls.setSpacing(12)

        self.ui_label = QLabel()
        self.ui_box = QComboBox()
        self.ui_box.addItem("Ελληνικά", "el")
        self.ui_box.addItem("English", "en")
        self.ui_box.currentIndexChanged.connect(self.change_ui_language)
        self.ui_box.setCurrentIndex(
            self.ui_box.findData(self.ui_language)
        )

        controls.addWidget(self.ui_label)
        controls.addWidget(self.ui_box)

        self.story_label = QLabel()
        self.story_box = QComboBox()
        self.story_box.addItem("Ελληνικά", "el")
        self.story_box.addItem("English", "en")
        self.story_box.currentIndexChanged.connect(
            self.change_story_language
        )
        self.story_box.setCurrentIndex(
            self.story_box.findData(self.story_language)
        )

        controls.addSpacing(12)
        controls.addWidget(self.story_label)
        controls.addWidget(self.story_box)

        self.mode_label = QLabel()
        self.mode_box = QComboBox()
        self.mode_box.addItem("Απλή αφήγηση", "mode1")
        self.mode_box.addItem("Πλήρης αφήγηση", "mode2")
        self.mode_box.currentIndexChanged.connect(self.change_mode)
        self.mode_box.setCurrentIndex(
            self.mode_box.findData(self.mode)
        )

        controls.addSpacing(12)
        controls.addWidget(self.mode_label)
        controls.addWidget(self.mode_box)
        controls.addStretch()

        layout.addLayout(controls)

        self.page_label = QLabel()
        self.page_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.page_label.setObjectName("pageLabel")
        layout.addWidget(self.page_label)

        self.progress = QProgressBar()
        self.progress.setTextVisible(False)
        self.progress.setRange(0, len(self.story["pages"]))
        self.progress.setValue(1)
        self.progress.setMaximumHeight(8)
        layout.addWidget(self.progress)

        self.image_label = QLabel()
        self.image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.image_label.setMinimumSize(300, 250)
        self.image_label.setObjectName("illustration")
        self.image_label.setScaledContents(False)
        layout.addWidget(self.image_label, stretch=3)

        self.text_label = QLabel()
        self.text_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.text_label.setWordWrap(True)
        self.text_label.setMinimumHeight(100)
        self.text_label.setObjectName("storyText")
        layout.addWidget(self.text_label, stretch=2)

        navigation = QHBoxLayout()
        navigation.setSpacing(12)

        self.previous_button = QPushButton()
        self.previous_button.clicked.connect(self.previous_page)

        self.fullscreen_button = QPushButton()
        self.fullscreen_button.clicked.connect(self.toggle_fullscreen)

        self.next_button = QPushButton()
        self.next_button.clicked.connect(self.next_page)

        navigation.addWidget(self.previous_button)
        navigation.addStretch()
        navigation.addWidget(self.fullscreen_button)
        navigation.addStretch()
        navigation.addWidget(self.next_button)

        layout.addLayout(navigation)

        self.setStyleSheet("""
            QWidget#centralWidget {
                background-color: #F8F5ED;
            }

            QLabel#storyTitle {
                color: #35483B;
                font-size: 28px;
                font-weight: 700;
                padding: 8px;
            }

            QLabel#pageLabel {
                color: #667064;
                font-size: 14px;
            }

            QLabel#illustration {
                background-color: #EEEADF;
                color: #777568;
                border: 1px solid #D6D0C1;
                border-radius: 14px;
                padding: 12px;
                font-size: 17px;
            }

            QLabel#storyText {
                color: #30352F;
                font-size: 24px;
                padding: 12px 28px;
            }

            QComboBox {
                background-color: white;
                border: 1px solid #D6D0C1;
                border-radius: 7px;
                padding: 7px;
                min-width: 100px;
            }

            QPushButton {
                background-color: #536B56;
                color: white;
                border: none;
                border-radius: 9px;
                padding: 10px 18px;
                font-size: 14px;
                min-width: 100px;
            }

            QPushButton:hover {
                background-color: #405542;
            }

            QPushButton:disabled {
                background-color: #D7D9D1;
                color: #898D83;
            }

            QProgressBar {
                background-color: #E2E0D6;
                border: none;
                border-radius: 4px;
            }

            QProgressBar::chunk {
                background-color: #B49A61;
                border-radius: 4px;
            }
        """)

        self.update_interface()

    def tr(self, key):
        return UI_TEXT[self.ui_language][key]

    def change_ui_language(self, index):
        self.ui_language = self.ui_box.currentData()
        self.update_interface()

    def change_story_language(self, index):
        self.story_language = self.story_box.currentData()
        self.update_interface()

    def change_mode(self, index):
        self.mode = self.mode_box.currentData()
        self.update_interface()

    def previous_page(self):
        if self.current_page > 1:
            self.current_page -= 1
            self.update_interface()

    def next_page(self):
        if self.current_page < len(self.story["pages"]):
            self.current_page += 1
            self.update_interface()

    def persist_settings(self):
        self.settings.update({
            "ui_language": self.ui_language,
            "story_language": self.story_language,
            "mode": self.mode,
            "last_page": self.current_page,
            "fullscreen": self.is_fullscreen,
        })

        try:
            save_settings(self.settings)
        except OSError as error:
            print(f"Could not save settings: {error}")
            
    def toggle_fullscreen(self):
        self.is_fullscreen = not self.is_fullscreen

        if self.is_fullscreen:
            self.showFullScreen()
        else:
            self.showNormal()

        self.update_interface()

    def update_interface(self):
        self.setWindowTitle(self.tr("window_title"))

        self.ui_label.setText(self.tr("ui_language") + ":")
        self.story_label.setText(self.tr("story_language") + ":")
        self.mode_label.setText(self.tr("reading_mode") + ":")

        self.mode_box.setItemText(0, self.tr("simple_mode"))
        self.mode_box.setItemText(1, self.tr("full_mode"))

        self.previous_button.setText(self.tr("previous"))
        self.next_button.setText(self.tr("next"))

        fullscreen_key = (
            "exit_fullscreen" if self.is_fullscreen else "fullscreen"
        )
        self.fullscreen_button.setText(self.tr(fullscreen_key))

        self.title_label.setText(
            self.story["title"][self.story_language]
        )

        total = len(self.story["pages"])
        self.page_label.setText(
            self.tr("page").format(
                current=self.current_page,
                total=total,
            )
        )
        self.progress.setValue(self.current_page)

        page = self.story["pages"][self.current_page - 1]
        image_name = page.get("image")
        image_path = IMAGE_DIR / image_name if image_name else None

        if image_path and image_path.is_file():
            pixmap = QPixmap(str(image_path))
            if not pixmap.isNull():
                available_size = self.image_label.size()
                scaled = pixmap.scaled(
                    available_size,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation,
                )
                self.image_label.setPixmap(scaled)
            else:
                self.image_label.setText(self.tr("illustration"))
                self.image_label.setPixmap(QPixmap())
        else:
            self.image_label.setText(self.tr("illustration"))
            self.image_label.setPixmap(QPixmap())

        self.text_label.setText(
            get_page_text(
                self.story,
                self.current_page,
                self.story_language,
                self.mode,
            )
        )

        self.previous_button.setEnabled(self.current_page > 1)
        self.next_button.setEnabled(self.current_page < total)

        self.persist_settings()

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if hasattr(self, "image_label"):
            self.update_image()

    def update_image(self):
        page = self.story["pages"][self.current_page - 1]
        image_name = page.get("image")
        image_path = IMAGE_DIR / image_name if image_name else None

        if image_path and image_path.is_file():
            pixmap = QPixmap(str(image_path))
            if not pixmap.isNull():
                self.image_label.setPixmap(
                    pixmap.scaled(
                        self.image_label.size(),
                        Qt.AspectRatioMode.KeepAspectRatio,
                        Qt.TransformationMode.SmoothTransformation,
                    )
                )

    def closeEvent(self, event):
        self.persist_settings()
        event.accept()


def main():
    app = QApplication(sys.argv)

    try:
        window = StoryWindow()
    except Exception as error:
        print(f"Application error: {error}")
        return 1

    window.show()

    if window.is_fullscreen:
        window.showFullScreen()

    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
