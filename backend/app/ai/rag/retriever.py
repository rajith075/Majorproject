# ==========================================================
# RAG Retriever
# ==========================================================
#
# Responsible for:
#
# 1. Converting the query into an embedding
# 2. Searching the FAISS vector store
# 3. Filtering results by semantic distance
# 4. Optionally filtering by medical condition/category
# 5. Returning the most relevant medical knowledge
#
# ==========================================================

from app.ai.rag.embedding_service import embedding_service
from app.ai.rag.vector_store import vector_store


class Retriever:

    # ======================================================
    # Initialization
    # ======================================================

    def __init__(self):

        self.embedding_service = embedding_service
        self.vector_store = vector_store

        # --------------------------------------------------
        # Maximum acceptable FAISS distance
        #
        # Lower distance = more relevant.
        #
        # This is an initial threshold based on the
        # current embedding model and knowledge base.
        # --------------------------------------------------

        self.default_max_distance = 0.75

    # ======================================================
    # Retrieve Relevant Medical Knowledge
    # ======================================================

    def retrieve(
        self,
        query,
        top_k=3,
        max_distance=None,
        category=None,
    ):

        # --------------------------------------------------
        # Validate Query
        # --------------------------------------------------

        if not query or not query.strip():
            return []

        # --------------------------------------------------
        # Validate top_k
        # --------------------------------------------------

        if top_k <= 0:
            return []

        # --------------------------------------------------
        # Use Default Distance Threshold
        # --------------------------------------------------

        if max_distance is None:
            max_distance = self.default_max_distance

        # --------------------------------------------------
        # Normalize Category
        # --------------------------------------------------

        if category:

            category = (
                category
                .strip()
                .lower()
            )

        # --------------------------------------------------
        # Convert Query into Embedding
        # --------------------------------------------------

        query_embedding = (
            self.embedding_service.embed_text(
                query
            )
        )

        # --------------------------------------------------
        # Search Extra Results
        #
        # We retrieve more results than required because
        # some results may be removed by:
        #
        # 1. Distance filtering
        # 2. Category filtering
        #
        # IMPORTANT:
        #
        # We DO NOT access something like:
        #
        # self.vector_store.total_vectors
        #
        # because VectorStore does not have that property.
        #
        # VectorStore.search() already safely limits the
        # requested number using self.index.ntotal.
        # --------------------------------------------------

        search_k = max(
            top_k * 5,
            10,
        )

        results = self.vector_store.search(
            query_embedding,
            top_k=search_k,
        )

        # --------------------------------------------------
        # Distance Filtering
        # --------------------------------------------------

        relevant_results = [

            result

            for result in results

            if result.get(
                "distance",
                float("inf"),
            ) <= max_distance

        ]

        # --------------------------------------------------
        # Category Filtering
        # --------------------------------------------------
        #
        # Example:
        #
        # category="diabetes"
        #
        # Only diabetes knowledge will be returned.
        #
        # This prevents unrelated medical conditions from
        # being passed to Gemini as grounding knowledge.
        # --------------------------------------------------

        if category:

            relevant_results = [

                result

                for result
                in relevant_results

                if (
                    str(
                        result.get(
                            "category",
                            "",
                        )
                    )
                    .strip()
                    .lower()
                    == category
                )

            ]

        # --------------------------------------------------
        # Sort by Relevance
        #
        # Lower FAISS distance = more relevant.
        # --------------------------------------------------

        relevant_results.sort(

            key=lambda result:

                result.get(
                    "distance",
                    float("inf"),
                )

        )

        # --------------------------------------------------
        # Return Top-K
        # --------------------------------------------------

        return relevant_results[:top_k]

    # ======================================================
    # Build Medical Context
    # ======================================================

    def build_context(
        self,
        query,
        top_k=3,
        max_distance=None,
        category=None,
    ):

        results = self.retrieve(

            query=query,

            top_k=top_k,

            max_distance=max_distance,

            category=category,

        )

        # --------------------------------------------------
        # No Relevant Knowledge
        # --------------------------------------------------

        if not results:
            return ""

        # --------------------------------------------------
        # Build Medical Context
        # --------------------------------------------------

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