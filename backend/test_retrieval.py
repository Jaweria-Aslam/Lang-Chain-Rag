from services.vector_store import get_vector_store


vector_store = get_vector_store()

query = "What is this website about?"

results = vector_store.similarity_search(
    query,
    k=3,
)

print("\nRetrieved Documents:")
print("-" * 60)

for i, document in enumerate(results, start=1):
    print(f"\nResult {i}")
    print("Source:", document.metadata.get("source"))
    print("Content:", document.page_content[:500])