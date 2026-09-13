from langchain_pinecone import PineconeVectorStore

from services.embeddings import get_embeddings
from utils.config import PINECONE_API_KEY, PINECONE_INDEX_NAME


def get_vector_store():
    embeddings = get_embeddings()

    return PineconeVectorStore(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings,
        pinecone_api_key=PINECONE_API_KEY,
    )