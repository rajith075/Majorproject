# ==========================================================
# RAG Document Loader
# ==========================================================
#
# Loads medical knowledge documents from the RAG knowledge
# base.
#
# Supported for now:
# .txt
# .md
#
# ==========================================================

from pathlib import Path


class DocumentLoader:

    def __init__(self):

        # --------------------------------------------------
        # Project Root
        # --------------------------------------------------

        self.base_dir = Path(__file__).resolve().parents[3]

        # --------------------------------------------------
        # Medical Knowledge Directory
        # --------------------------------------------------

        self.knowledge_dir = (
            self.base_dir
            / "data"
            / "medical_knowledge"
        )

    # ======================================================
    # Load Documents
    # ======================================================

    def load_documents(self):

        documents = []

        if not self.knowledge_dir.exists():

            raise FileNotFoundError(
                f"Medical knowledge directory not found:\n"
                f"{self.knowledge_dir}"
            )

        # --------------------------------------------------
        # Find TXT and Markdown files
        # --------------------------------------------------

        files = list(
            self.knowledge_dir.rglob("*.txt")
        )

        files += list(
            self.knowledge_dir.rglob("*.md")
        )

        # --------------------------------------------------
        # Read Documents
        # --------------------------------------------------

        for file_path in files:

            try:

                content = file_path.read_text(
                    encoding="utf-8"
                ).strip()

                if not content:
                    continue

                # ------------------------------------------
                # Category
                # ------------------------------------------

                category = file_path.parent.name

                documents.append({

                    "text": content,

                    "source": file_path.name,

                    "category": category,

                    "path": str(file_path),

                })

            except Exception as e:

                print(
                    f"⚠️ Failed to load "
                    f"{file_path}: {e}"
                )

        return documents


# ==========================================================
# Singleton
# ==========================================================

document_loader = DocumentLoader()