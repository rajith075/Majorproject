# ==========================================================
# RAG Retriever
# ==========================================================

from app.ai.rag.embedding_service import embedding_service
from app.ai.rag.vector_store import vector_store


class Retriever:

    def __init__(self):

        self.embedding_service = embedding_service
        self.vector_store = vector_store

    # ======================================================
    # Retrieve Relevant Medical Knowledge
    # ======================================================

    def retrieve(
        self,
        query,
        top_k=3,
    ):

        if not query or not query.strip():

            return []

        # --------------------------------------------------
        # Convert query into embedding
        # --------------------------------------------------

        query_embedding = (
            self.embedding_service.embed_text(
                query
            )
        )

        # --------------------------------------------------
        # Search FAISS
        # --------------------------------------------------

        results = self.vector_store.search(
            query_embedding,
            top_k=top_k,
        )

        return results

    # ======================================================
    # Build Context
    # ======================================================

    def build_context(
        self,
        query,
        top_k=3,
    ):

        results = self.retrieve(
            query=query,
            top_k=top_k,
        )

        if not results:
            return ""

        context_parts = []

        for result in results:

            context_parts.append(
                result["text"]
            )

        return "\n\n".join(
            context_parts
        )


# ==========================================================
# Singleton
# ==========================================================

retriever = Retriever()