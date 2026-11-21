# Enterprise & Multimodal RAG Architecture

> Architectural standards for production-grade Retrieval-Augmented Generation, hybrid search, hierarchical chunking, and multimodal document decomposition.  
> Grounded in the synthesis of `inbharatai/claude-skills` (`rag-architect`), `run-llama/llama_index`, and `HKUDS/RAG-Anything`.

---

## 1. 4-Stage Enterprise RAG Pipeline

$$\text{Document Ingestion} \longrightarrow \text{Hybrid Dense/Sparse Retrieval} \longrightarrow \text{Cross-Encoder Reranking} \longrightarrow \text{Grounded Generation}$$

### A. Chunking Strategies & Context Preservation
- **Semantic / Recursive Splitting**: Prefer recursive character splitting respecting Markdown headers and code blocks over naive character slicing.
- **Chunk Size Budget**: 512–1024 tokens per chunk with **10%–15% sliding token overlap** to eliminate boundary data loss.
- **Metadata Enrichment**: Inject document provenance (`source_url`, `doc_id`, section hierarchy header breadcrumbs) directly into chunk metadata to prevent context drift during retrieval.

### B. Hybrid Retrieval (Dense + Sparse Fusion)
- Combine dense vector semantic search (Cosine Similarity via pgvector / HNSW index) with sparse keyword search (BM25 / Postgres Full-Text Search).
- Merge candidate scores using **Reciprocal Rank Fusion (RRF)**:
  $$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)} \quad (k \approx 60)$$
- Mitigates dense retrieval blindness to exact keyword matches (IDs, error codes, specific proper nouns).

### C. Cross-Encoder Reranking Gate
- Pass top-20 to top-50 hybrid candidates through a cross-encoder reranker (e.g. Cohere Rerank / BGE-Reranker) to extract top 3–5 high-precision passages before injecting into the LLM context.

### D. Retrieval Evaluation & Quality Gates
- Continuously evaluate retrieval precision using **Recall@K**, **Precision@K**, and **Mean Reciprocal Rank (MRR)** against ground-truth QA splits.
- Reject retrieval pipelines failing minimum Recall@5 $\ge 0.85$.

---

## 2. Advanced Retrieval Invariants (LlamaIndex Patterns)

### A. Sentence Window Retrieval (Focal-Context Decoupling)
- **Problem**: Embedding large chunks (500–1000 tokens) dilutes semantic focus, while embedding small isolated sentences loses narrative context during LLM generation.
- **Mechanism**: Index and embed atomic target sentences or small paragraphs (1–2 sentences) into vector storage. Attach a surrounding context window ($k=3$ preceding and succeeding sentences) in chunk metadata.
- **Resolution**: Dense vector similarity matches the atomic target sentence, but the retrieval layer extracts and injects the expanded sentence window into the synthesis prompt.

### B. Auto-Merging Hierarchical Retriever (Child-to-Parent Quorum)
- **Hierarchy**: Parse documents into a hierarchical tree: Document $\rightarrow$ Parent Chunks (1024 tokens) $\rightarrow$ Child Chunks (128–256 tokens).
- **Ingestion**: Embed only Child Chunks in the vector index, each retaining a foreign key metadata reference `parent_id` pointing to its parent block.
- **Quorum Resolution**: During retrieval, count retrieved child chunks grouped by `parent_id`. If $\ge 50\%$ (quorum threshold) of child nodes belonging to a single parent are retrieved, collapse the individual child fragments and dynamically swap in the single, unified Parent Chunk. Prevents context fragmentation without losing granular retrieval accuracy.

---

## 3. Multimodal RAG Ingestion & Cross-Modal Grounding (`HKUDS/RAG-Anything`)

### A. Modality Decomposition Invariant
- Ingesting heterogeneous documents (technical PDFs, financial statements, scientific reports) must never flatten visual and tabular components into raw plain strings.
- Decompose incoming documents into 4 structured modality streams:
  - **Text Stream**: Semantic Markdown AST preserving heading breadcrumbs and paragraph boundaries.
  - **Table Stream**: Structured Markdown / HTML tables preserving column headers, data cells, and numeric alignments (never plain-text rows).
  - **Equation Stream**: Math expressions extracted into valid KaTeX / LaTeX syntax (`$$...$$`).
  - **Image & Chart Stream**: High-density semantic captions, axes summaries, and key takeaways generated via Vision-Language Model (VLM).

### B. Cross-Modal Co-Reference Binding
- Maintain bidirectional foreign-key metadata between text paragraphs and visual/tabular nodes:
  `{ "node_id": "table_04", "type": "table", "referenced_in": ["para_12", "para_14"], "caption": "Q3 Revenue by Region" }`
- **Dual-Retriever Resolution**: When user queries involve quantitative or trend analysis, the retriever extracts both the referring textual analysis and the bound structured table/chart caption, eliminating hallucinated data extrapolation.
