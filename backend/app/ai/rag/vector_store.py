# ==========================================================
# RAG Vector Store
# ==========================================================

from pathlib import Path
import pickle

import faiss
import numpy as np


class VectorStore:

    def __init__(self):

        # ==================================================
        # Storage Directory
        # ==================================================

        self.base_dir = Path(__file__).resolve().parents[3]

        self.storage_dir = (
            self.base_dir
            / "data"
            / "vector_store"
        )

        self.storage_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.index_path = (
            self.storage_dir
            / "medical.index"
        )

        self.metadata_path = (
            self.storage_dir
            / "metadata.pkl"
        )

        self.index = None
        self.metadata = []

    # ======================================================
    # Build Index
    # ======================================================

    def build(self, embedded_documents):

        if not embedded_documents:
            raise ValueError(
                "No embedded documents provided."
            )

        embeddings = np.array(
            [
                document["embedding"]
                for document in embedded_documents
            ],
            dtype="float32",
        )

        dimension = embeddings.shape[1]

        # --------------------------------------------------
        # FAISS Index
        # --------------------------------------------------

        self.index = faiss.IndexFlatL2(
            dimension
        )

        self.index.add(
            embeddings
        )

        # --------------------------------------------------
        # Metadata
        # --------------------------------------------------

        self.metadata = []

        for document in embedded_documents:

            self.metadata.append({

                "text":
                    document["text"],

                "category":
                    document["category"],

                "source":
                    document["source"],

                "chunk_id":
                    document["chunk_id"],

            })

        # --------------------------------------------------
        # Save
        # --------------------------------------------------

        faiss.write_index(
            self.index,
            str(self.index_path),
        )

        with open(
            self.metadata_path,
            "wb",
        ) as file:

            pickle.dump(
                self.metadata,
                file,
            )

        print("✅ Vector store built")
        print(
            f"Vectors stored: {self.index.ntotal}"
        )

        return self.index

    # ======================================================
    # Load Index
    # ======================================================

    def load(self):

        if not self.index_path.exists():

            raise FileNotFoundError(
                f"Vector index not found: "
                f"{self.index_path}"
            )

        if not self.metadata_path.exists():

            raise FileNotFoundError(
                f"Vector metadata not found: "
                f"{self.metadata_path}"
            )

        self.index = faiss.read_index(
            str(self.index_path)
        )

        with open(
            self.metadata_path,
            "rb",
        ) as file:

            self.metadata = pickle.load(
                file
            )

        print("✅ Vector store loaded")
        print(
            f"Vectors available: "
            f"{self.index.ntotal}"
        )

        return self.index

    # ======================================================
    # Search
    # ======================================================

    def search(
        self,
        query_embedding,
        top_k=3,
    ):

        if self.index is None:

            self.load()

        query = np.array(
            [query_embedding],
            dtype="float32",
        )

        distances, indices = (
            self.index.search(
                query,
                min(
                    top_k,
                    self.index.ntotal,
                ),
            )
        )

        results = []

        for distance, index in zip(
            distances[0],
            indices[0],
        ):

            if index < 0:
                continue

            result = self.metadata[index].copy()

            result["distance"] = float(
                distance
            )

            results.append(result)

        return results


# ==========================================================
# Singleton
# ==========================================================

vector_store = VectorStore()