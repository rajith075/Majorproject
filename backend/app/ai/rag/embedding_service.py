# ==========================================================
# RAG Embedding Service
# ==========================================================

from sentence_transformers import SentenceTransformer


class EmbeddingService:

    def __init__(self):

        print("=" * 60)
        print("Loading RAG Embedding Model...")
        print("=" * 60)

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        print("✅ RAG Embedding Model Loaded")

    # ======================================================
    # Embed Single Text
    # ======================================================

    def embed_text(self, text):

        return self.model.encode(
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