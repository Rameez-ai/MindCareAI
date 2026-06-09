import os
import json
import numpy as np
from app.ai.embeddings import get_embeddings_model
from app.utils.logger import logger

class RAGPipeline:
    def __init__(self):
        self.model = get_embeddings_model()
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.index_dir = os.path.join(self.base_dir, "faiss_index")
        self.index_path = os.path.join(self.index_dir, "index.faiss")
        self.chunks_path = os.path.join(self.index_dir, "chunks.json")
        
        self.index = None
        self.chunks = []
        self._load_index()

    def _load_index(self):
        """Loads FAISS index and chunk metadata from disk if available."""
        if not os.path.exists(self.index_path) or not os.path.exists(self.chunks_path):
            logger.warning(
                f"FAISS index files not found at {self.index_path}. "
                "RAG will operate in fallback mode. Run python scripts/build_index.py to create the index."
            )
            return

        try:
            import faiss
            self.index = faiss.read_index(self.index_path)
            with open(self.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors successfully.")
        except Exception as e:
            logger.error(f"Error loading FAISS index: {e}. RAG falling back.")
            self.index = None

    def retrieve(self, query: str, top_k: int = 2) -> str:
        """
        Embeds the query, searches FAISS, and returns the top-k matching documents.
        Returns fallback instructions if the index is missing or empty.
        """
        if not self.index or not self.chunks:
            return (
                "Focus on Cognitive Behavioral Therapy (CBT) basics: identifying negative thought loops, "
                "challenging cognitive distortions, and promoting mindful awareness of feelings."
            )

        try:
            # Embed query
            query_vector = self.model.encode([query])
            query_vector = np.array(query_vector).astype('float32')
            
            # Search FAISS index
            distances, indices = self.index.search(query_vector, top_k)
            
            retrieved_texts = []
            for i, idx in enumerate(indices[0]):
                if idx < len(self.chunks) and idx != -1:
                    chunk = self.chunks[idx]
                    retrieved_texts.append(f"[Source: {chunk['source']}]\n{chunk['text']}")
                    
            if not retrieved_texts:
                return "No matching context found."
                
            return "\n\n---\n\n".join(retrieved_texts)
        except Exception as e:
            logger.error(f"RAG retrieval error: {e}")
            return "Failed to retrieve relevant mental health guidelines."

# Instantiate pipeline singleton
rag_pipeline = RAGPipeline()

def retrieve_context(query: str, top_k: int = 2) -> str:
    """Convenience functional wrapper for retrieving context."""
    return rag_pipeline.retrieve(query, top_k)
