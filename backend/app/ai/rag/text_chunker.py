# ==========================================================
# RAG Text Chunker
# ==========================================================

class TextChunker:

    def __init__(
        self,
        chunk_size=500,
        chunk_overlap=100,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    # ======================================================
    # Split Text
    # ======================================================

    def split_text(self, text):

        text = text.strip()

        if not text:
            return []

        chunks = []

        start = 0
        text_length = len(text)

        while start < text_length:

            end = start + self.chunk_size

            chunk = text[start:end].strip()

            if chunk:
                chunks.append(chunk)

            if end >= text_length:
                break

            start = end - self.chunk_overlap

        return chunks

    # ======================================================
    # Process Documents
    # ======================================================

    def chunk_documents(self, documents):

        chunked_documents = []

        for document in documents:

            text = document["text"]

            chunks = self.split_text(text)

            for index, chunk in enumerate(chunks):

                chunked_documents.append({

                    "text": chunk,

                    "category":
                        document["category"],

                    "source":
                        document["source"],

                    "chunk_id":
                        index,

                })

        return chunked_documents


# ==========================================================
# Singleton
# ==========================================================

text_chunker = TextChunker()