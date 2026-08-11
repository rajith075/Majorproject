# ==========================================================
# RAG Generator
# ==========================================================
#
# Responsible for:
#
# 1. Receiving patient / AI context
# 2. Retrieving relevant medical knowledge
# 3. Building a grounded medical prompt
# 4. Sending the prompt to Gemini
# 5. Returning structured RAG explanation
# 6. Returning the retrieved knowledge sources
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

        self.gemini_service = (
            gemini_service
        )

    # ======================================================
    # Generate Medical Explanation
    # ======================================================

    def generate(
        self,
        query,
        patient_context,
        top_k=3,
    ):

        # ==================================================
        # Retrieve Medical Knowledge
        # ==================================================

        retrieved_documents = (
            self.retriever.retrieve(
                query=query,
                top_k=top_k,
            )
        )

        # ==================================================
        # No Relevant Knowledge Found
        # ==================================================

        if not retrieved_documents:

            return {

                "summary": (
                    "No relevant medical knowledge "
                    "was found for this prediction."
                ),

                "key_factors": [],

                "caregiver_guidance": [],

                "disclaimer": (
                    "This explanation is provided for "
                    "health monitoring and educational "
                    "purposes only and does not replace "
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
        # Build Grounded Prompt
        # ==================================================

        prompt = f"""
You are an AI medical explanation assistant
for an elderly-care monitoring system.

Your job is to explain an existing AI prediction
using the patient's information and the retrieved
medical knowledge.

IMPORTANT RULES:

- Do not diagnose the patient.
- Do not invent medical facts.
- Do not change or contradict the AI prediction.
- Use the retrieved medical knowledge as the
  grounding source for the explanation.
- Only make claims supported by the patient context
  or retrieved medical knowledge.
- Clearly distinguish an AI prediction from medical
  diagnosis or medical advice.
- Keep the explanation understandable for caregivers
  and family members.
- Do not recommend changing, starting, or stopping
  medication.
- Do not provide emergency treatment instructions.
- If the retrieved knowledge is insufficient,
  explicitly say so.

PATIENT / AI CONTEXT:

{patient_context}

RETRIEVED MEDICAL KNOWLEDGE:

{medical_context}

TASK:

Explain the AI prediction using the patient context
and retrieved medical knowledge.

The explanation must contain:

1. What the AI prediction indicates.
2. Which patient factors are relevant.
3. How the retrieved medical knowledge relates
   to those factors.
4. What the caregiver should pay attention to.
5. A short safety disclaimer.

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
                "summary": str(response),

                "key_factors": [],

                "caregiver_guidance": [],

                "disclaimer": (
                    "This explanation is provided "
                    "for health monitoring and "
                    "educational purposes only."
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