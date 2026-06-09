import numpy as np
from app.utils.logger import logger

class MockEmbeddings:
    """Mock embeddings generator for fallback or fast testing."""
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        logger.info(f"Using Mock Embeddings (Dimension: {dimension})")

    def encode(self, texts) -> np.ndarray:
        if isinstance(texts, str):
            texts = [texts]
        # Return random but deterministic vectors
        vectors = []
        for t in texts:
            # Seed based on text hash
            np.random.seed(abs(hash(t)) % (2**31))
            v = np.random.randn(self.dimension)
            v = v / np.linalg.norm(v)  # normalize
            vectors.append(v)
        return np.array(vectors).astype('float32')

def get_embeddings_model():
    """
    Initializes and returns the sentence-transformers model.
    Falls back to MockEmbeddings if imports or load fails.
    """
    try:
        from sentence_transformers import SentenceTransformer
        # Load lightweight model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SentenceTransformer model 'all-MiniLM-L6-v2' loaded successfully.")
        return model
    except Exception as e:
        logger.error(f"Failed to load SentenceTransformer: {e}. Falling back to MockEmbeddings.")
        return MockEmbeddings()
