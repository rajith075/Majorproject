# ==========================================================
# RAG Embedding Service
# ==========================================================

from sentence_transformers import SentenceTransformer


class EmbeddingService:

    def __init__(self):
        # Loading SentenceTransformer can download model files.  Keep that
        # optional network work out of FastAPI import/startup so the API can
        # still run when the RAG model is not cached locally.
        self.model = None

    def _get_model(self):
        if self.model is None:
            print("Loading RAG Embedding Model...")
            # The model is part of the local backend setup. Do not contact
            # Hugging Face on every vital submission: restricted/offline
            # deployments would otherwise spend minutes retrying before the
            # AI follow-up can complete.
            self.model = SentenceTransformer(
                "all-MiniLM-L6-v2",
                local_files_only=True,
            )
            print("[OK] RAG Embedding Model Loaded")

        return self.model

    # ======================================================
    # Embed Single Text
    # ======================================================

    def embed_text(self, text):

        return self._get_model().encode(
            text,
            convert_to_numpy=True,
        )

    # ======================================================
    # Embed Documents
    # ======================================================

    def embed_documents(self, documents):

        embedded_documents = []

        for document in documents:

            embedding = self.embed_text(
                document["text"]
            )

            embedded_documents.append({

                "text": document["text"],

                "category":
                    document["category"],

                "source":
                    document["source"],

                "chunk_id":
                    document["chunk_id"],

                "embedding":
                    embedding,

            })

        return embedded_documents


# ==========================================================
# Singleton
# ==========================================================

embedding_service = EmbeddingService()
