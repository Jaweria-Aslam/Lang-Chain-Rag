from langchain_core.documents import Document

from services.scraper import scrape_website
from services.chunker import split_text
from services.vector_store import get_vector_store


def ingest_website(url: str):
    print("\n1. Scraping website...")
    text = scrape_website(url)

    print(f"Scraped characters: {len(text)}")

    if not text.strip():
        raise ValueError("No text found on website.")

    print("\n2. Splitting text into chunks...")
    chunks = split_text(text)

    print(f"Total chunks: {len(chunks)}")

    documents = [
        Document(
            page_content=chunk,
            metadata={
                "source": url,
                "title": url,
            },
        )
        for chunk in chunks
    ]

    print("\n3. Connecting to Pinecone...")
    vector_store = get_vector_store()

    print("\n4. Uploading documents to Pinecone...")
    vector_store.add_documents(documents)

    print("\n5. Ingestion completed successfully!")

    return {
        "url": url,
        "chunks": len(documents),
    }


if __name__ == "__main__":
    url = input("Enter website URL: ").strip()

    result = ingest_website(url)

    print("\nResult:")
    print(result)