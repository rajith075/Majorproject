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
        # Based on the current FAISS results, the previous
        # value of 0.75 was rejecting the nearest results.
        #
        # Current nearest result observed:
        # 0.8616
        #
        # --------------------------------------------------

        self.default_max_distance = 1.0

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

            print(
                "[RAG DEBUG] Empty query received."
            )

            return []

        # --------------------------------------------------
        # Validate top_k
        # --------------------------------------------------

        if top_k <= 0:

            print(
                "[RAG DEBUG] Invalid top_k:",
                top_k,
            )

            return []

        # --------------------------------------------------
        # Use Default Distance Threshold
        # --------------------------------------------------

        if max_distance is None:

            max_distance = (
                self.default_max_distance
            )

        # --------------------------------------------------
        # Normalize Category
        # --------------------------------------------------

        if category:

            category = (
                str(category)
                .strip()
                .lower()
            )

        # ==================================================
        # DEBUG - Retrieval Request
        # ==================================================

        print("=" * 70)
        print("[RAG DEBUG] RETRIEVAL STARTED")
        print("-" * 70)
        print(
            "[RAG DEBUG] Query:",
            query,
        )
        print(
            "[RAG DEBUG] Requested Category:",
            category,
        )
        print(
            "[RAG DEBUG] Top K:",
            top_k,
        )
        print(
            "[RAG DEBUG] Maximum Distance:",
            max_distance,
        )
        print("=" * 70)

        # --------------------------------------------------
        # Convert Query into Embedding
        # --------------------------------------------------

        query_embedding = (
            self.embedding_service.embed_text(
                query
            )
        )

        # ==================================================
        # DEBUG - Embedding
        # ==================================================

        try:

            print(
                "[RAG DEBUG] Query embedding dimension:",
                query_embedding.shape[0],
            )

        except Exception:

            print(
                "[RAG DEBUG] Query embedding generated."
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
        # --------------------------------------------------

        search_k = max(
            top_k * 5,
            10,
        )

        results = self.vector_store.search(
            query_embedding,
            top_k=search_k,
        )

        # ==================================================
        # DEBUG - Raw FAISS Results
        # ==================================================

        print("=" * 70)
        print(
            "[RAG DEBUG] RAW FAISS RESULTS:",
            len(results),
        )
        print("-" * 70)

        if not results:

            print(
                "[RAG DEBUG] FAISS returned NO results."
            )

        else:

            for index, result in enumerate(
                results[:10],
                start=1,
            ):

                distance = result.get(
                    "distance",
                    float("inf"),
                )

                result_category = (
                    result.get(
                        "category",
                        "",
                    )
                )

                source = result.get(
                    "source",
                    "",
                )

                chunk_id = result.get(
                    "chunk_id",
                    "",
                )

                print(
                    f"{index}. "
                    f"distance={float(distance):.4f} | "
                    f"category={result_category} | "
                    f"source={source} | "
                    f"chunk={chunk_id}"
                )

        print("=" * 70)

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

        # ==================================================
        # DEBUG - After Distance Filtering
        # ==================================================

        print(
            "[RAG DEBUG] RESULTS AFTER DISTANCE FILTER:",
            len(relevant_results),
        )

        for result in relevant_results:

            print(
                "  "
                f"distance={float(result.get('distance', 0)):.4f} | "
                f"category={result.get('category', '')} | "
                f"source={result.get('source', '')}"
            )

        # --------------------------------------------------
        # Category Filtering
        # --------------------------------------------------
        #
        # Exact category matching is intentionally preserved
        # for now. The debug output will tell us if this is
        # the stage removing the medical knowledge.
        #
        # --------------------------------------------------

        if category:

            before_category_count = len(
                relevant_results
            )

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

            # ==================================================
            # DEBUG - Category Filtering
            # ==================================================

            print("=" * 70)
            print(
                "[RAG DEBUG] CATEGORY FILTER"
            )
            print(
                "[RAG DEBUG] Requested category:",
                category,
            )
            print(
                "[RAG DEBUG] Before category filter:",
                before_category_count,
            )
            print(
                "[RAG DEBUG] After category filter:",
                len(relevant_results),
            )

            if before_category_count > 0:

                print(
                    "[RAG DEBUG] Available categories "
                    "before filtering:"
                )

                available_categories = sorted(
                    set(
                        str(
                            result.get(
                                "category",
                                "",
                            )
                        )
                        .strip()
                        .lower()
                        for result
                        in results
                    )
                )

                for available_category in (
                    available_categories
                ):

                    print(
                        f"  - {available_category}"
                    )

            print("=" * 70)

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

        # ==================================================
        # DEBUG - Final Retrieval Results
        # ==================================================

        print("=" * 70)
        print(
            "[RAG DEBUG] FINAL RESULTS:",
            len(relevant_results),
        )

        if not relevant_results:

            print(
                "[RAG DEBUG] ❌ NO MEDICAL KNOWLEDGE "
                "SURVIVED RETRIEVAL FILTERS."
            )

        else:

            for index, result in enumerate(
                relevant_results[:top_k],
                start=1,
            ):

                print(
                    f"{index}. "
                    f"distance={float(result.get('distance', 0)):.4f} | "
                    f"category={result.get('category', '')} | "
                    f"source={result.get('source', '')} | "
                    f"chunk={result.get('chunk_id', '')}"
                )

        print("=" * 70)

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