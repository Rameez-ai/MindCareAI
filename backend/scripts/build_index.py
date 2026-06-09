import os
import json
import re
import numpy as np
import sys

# Add backend to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ai.embeddings import get_embeddings_model
from app.utils.logger import logger

def clean_markdown(text: str) -> str:
    """Strip basic markdown formatting to clean the text for embedding."""
    text = re.sub(r'#+\s+', '', text)  # remove headings marker
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)  # replace links with text
    text = re.sub(r'[*_`-]', '', text)  # remove formatting characters
    return text.strip()

def chunk_text(text: str, file_name: str, chunk_size: int = 600, overlap: int = 150) -> list:
    """Split text into overlapping chunks of rough character lengths."""
    text = clean_markdown(text)
    
    # We also split by double newlines to try and preserve paragraphs
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        if len(current_chunk) + len(para) <= chunk_size:
            current_chunk += "\n\n" + para if current_chunk else para
        else:
            if current_chunk:
                chunks.append({
                    "text": current_chunk.strip(),
                    "source": file_name
                })
            # Start new chunk
            current_chunk = para
            
    if current_chunk:
        chunks.append({
            "text": current_chunk.strip(),
            "source": file_name
        })
        
    return chunks

def build_index():
    logger.info("Starting FAISS Knowledge Index Build...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kb_dir = os.path.join(base_dir, "knowledge_base")
    index_dir = os.path.join(base_dir, "faiss_index")
    
    os.makedirs(index_dir, exist_ok=True)
    
    if not os.path.exists(kb_dir):
        logger.error(f"Knowledge base directory {kb_dir} does not exist.")
        return False
        
    all_chunks = []
    
    # 1. Read files and extract chunks
    for file in os.listdir(kb_dir):
        if file.endswith(".md"):
            file_path = os.path.join(kb_dir, file)
            logger.info(f"Processing knowledge document: {file}")
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                chunks = chunk_text(content, file)
                all_chunks.extend(chunks)
                
    if not all_chunks:
        logger.error("No chunks extracted. Cannot build index.")
        return False
        
    logger.info(f"Extracted {len(all_chunks)} text chunks.")
    
    # 2. Get embeddings model
    model = get_embeddings_model()
    
    # 3. Generate embeddings
    texts = [c["text"] for c in all_chunks]
    logger.info("Computing embeddings for chunks...")
    embeddings = model.encode(texts)
    
    # Convert embeddings to float32
    embeddings = np.array(embeddings).astype('float32')
    
    # 4. Create and load FAISS Index
    import faiss
    dimension = embeddings.shape[1]
    logger.info(f"Creating FAISS L2 flat index with vector dimension: {dimension}")
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    # 5. Save index and text chunks
    index_path = os.path.join(index_dir, "index.faiss")
    chunks_path = os.path.join(index_dir, "chunks.json")
    
    faiss.write_index(index, index_path)
    with open(chunks_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)
        
    logger.info(f"FAISS index written to {index_path}")
    logger.info(f"Chunks mapping written to {chunks_path}")
    logger.info("FAISS index built successfully!")
    return True

if __name__ == "__main__":
    build_index()
