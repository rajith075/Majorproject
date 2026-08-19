# ==========================================================
# RAG Generator
# ==========================================================
#
# Responsible for:
#
# 1. Receiving patient / AI context
# 2. Retrieving relevant medical knowledge
# 3. Filtering knowledge by medical category
# 4. Building a grounded medical prompt
# 5. Sending the prompt to Gemini
# 6. Returning structured RAG explanation
# 7. Returning retrieved knowledge sources
#
# ==========================================================

from app.ai.rag.retriever import retriever
from app.ai.services.gemini_service import gemini_service


class RAGGenerator:

    # ======================================================
    # Initialization
    # ======================================================

    def __init__(self):

        self.retriever = retriever

        self.gemini_service = gemini_service

    # ======================================================
    # Generate Medical Explanation
    # ======================================================

    def generate(
        self,
        query,
        patient_context,
        top_k=3,
        category=None,
    ):

        # ==================================================
        # Normalize Category
        # ==================================================

        if category:

            category = (
                str(category)
                .strip()
                .lower()
            )

        # ==================================================
        # Retrieve Medical Knowledge
        # ==================================================

        retrieved_documents = (
            self.retriever.retrieve(
                query=query,
                top_k=top_k,
                category=category,
            )
        )

        # ==================================================
        # No Relevant Knowledge Found
        # ==================================================

        if not retrieved_documents:

            return {

                "status":
                    "insufficient_knowledge",

                "summary": (
                    "No sufficiently relevant "
                    "medical knowledge was found "
                    "for this prediction."
                ),

                "key_factors": [],

                "caregiver_guidance": [],

                "disclaimer": (
                    "This explanation is provided "
                    "for health monitoring and "
                    "educational purposes only. "
                    "It does not constitute a "
                    "medical diagnosis or replace "
                    "professional medical advice."
                ),

                "sources": [],

            }

        # ==================================================
        # Build Medical Context
        # ==================================================

        medical_context = "\n\n".join(

            document["text"]

            for document
            in retrieved_documents

        )

        # ==================================================
        # Build Source Context
        # ==================================================

        source_context = "\n".join(

            (
                f"- Category: {document['category']}\n"
                f"  Source: {document['source']}\n"
                f"  Chunk: {document['chunk_id']}"
            )

            for document
            in retrieved_documents

        )

        # ==================================================
        # Build Grounded Prompt
        # ==================================================

        prompt = f"""
You are an AI medical explanation assistant
for an elderly-care monitoring system.

Your job is to explain an EXISTING AI prediction
using the patient's information and retrieved
medical knowledge.

IMPORTANT SAFETY RULES:

- Do not diagnose the patient.
- Do not invent medical facts.
- Do not change or contradict the AI prediction.
- Use ONLY the patient context and retrieved
  medical knowledge as grounding.
- Do not make claims unsupported by the supplied
  information.
- Clearly distinguish AI prediction from medical
  diagnosis or medical advice.
- Keep the explanation understandable for caregivers
  and family members.
- Do not recommend starting, stopping, or changing
  medication.
- Do not provide emergency treatment instructions.
- If the retrieved knowledge is insufficient,
  explicitly state that.
- Focus on monitoring and communication with a
  healthcare professional when appropriate.

RAG MEDICAL CATEGORY:

{category if category else "Not specified"}

PATIENT / AI CONTEXT:

{patient_context}

RETRIEVED MEDICAL KNOWLEDGE:

{medical_context}

RETRIEVED SOURCES:

{source_context}

TASK:

Explain the AI prediction using the patient context
and the retrieved medical knowledge.

The explanation must contain:

1. What the AI prediction indicates.
2. Which patient factors are relevant.
3. How the retrieved medical knowledge relates
   to those factors.
4. What the caregiver should pay attention to.
5. A short safety disclaimer.

IMPORTANT:

The retrieved medical knowledge is the grounding
source. Do not introduce unrelated medical
conditions or unsupported medical claims.

Return ONLY valid JSON in exactly this structure:

{{
    "summary": "string",

    "key_factors": [
        "string"
    ],

    "caregiver_guidance": [
        "string"
    ],

    "disclaimer": "string"
}}
"""

        # ==================================================
        # Generate Gemini Response
        # ==================================================

        response = (
            self.gemini_service.generate(
                prompt
            )
        )

        # ==================================================
        # Ensure Structured Response
        # ==================================================

        if not isinstance(
            response,
            dict,
        ):

            response = {

                "summary":
                    str(response),

                "key_factors": [],

                "caregiver_guidance": [],

                "disclaimer": (
                    "This explanation is "
                    "provided for health "
                    "monitoring and educational "
                    "purposes only."
                ),

            }

        # ==================================================
        # Extract Generated Fields
        # ==================================================

        summary = response.get(
            "summary",
            "",
        )

        key_factors = response.get(
            "key_factors",
            [],
        )

        caregiver_guidance = response.get(
            "caregiver_guidance",
            [],
        )

        disclaimer = response.get(
            "disclaimer",
            "",
        )

        # ==================================================
        # Retrieved Sources
        # ==================================================

        sources = [

            {
                "category":
                    document["category"],

                "source":
                    document["source"],

                "chunk_id":
                    document["chunk_id"],

                "distance":
                    round(
                        float(
                            document["distance"]
                        ),
                        4,
                    ),

            }

            for document
            in retrieved_documents

        ]

        # ==================================================
        # Final RAG Result
        # ==================================================

        return {

            "status":
                "grounded",

            "summary":
                summary,

            "key_factors":
                key_factors,

            "caregiver_guidance":
                caregiver_guidance,

            "disclaimer":
                disclaimer,

            "sources":
                sources,

        }


# ==========================================================
# Singleton
# ==========================================================

rag_generator = RAGGenerator()