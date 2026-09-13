from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from services.vector_store import get_vector_store
from utils.config import GEMINI_API_KEY


prompt = ChatPromptTemplate.from_template(
    """
You are a helpful AI knowledge assistant.

Answer the user's question using ONLY the provided context.

If the answer cannot be found in the context, say:
"I couldn't find that information in the provided knowledge."

Do not invent or assume information.

Context:
{context}

Question:
{question}

Answer:
"""
)


llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
)


def ask_rag(question: str):
    vector_store = get_vector_store()

    documents = vector_store.similarity_search(
        question,
        k=4,
    )

    if not documents:
        return {
            "answer": "I couldn't find relevant information.",
            "sources": [],
        }

    context = "\n\n".join(
        document.page_content
        for document in documents
    )

    chain = prompt | llm | StrOutputParser()

    answer = chain.invoke(
        {
            "context": context,
            "question": question,
        }
    )

    sources = []
    seen_urls = set()

    for document in documents:
        url = document.metadata.get("source", "")

        if url and url not in seen_urls:
            sources.append(
                {
                    "title": document.metadata.get(
                        "title",
                        url,
                    ),
                    "url": url,
                    "content": document.page_content[:300],
                }
            )

            seen_urls.add(url)

    return {
        "answer": answer,
        "sources": sources,
    }