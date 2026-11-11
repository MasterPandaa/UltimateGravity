# Vectorless Tree-of-Thought RAG Architecture

> Architectural reference adopted from `VectifyAI/PageIndex`. Replaces traditional chunk-and-embed vector search with hierarchical semantic tree parsing and LLM reasoning traversal.

---

## 1. Core Thesis & Problem Statement
* **Traditional Chunk-and-Embed RAG Flaws**:
  - Arbitrary chunk boundaries (e.g. 500-1000 tokens) break cross-sentence context and split tables.
  - Vector cosine similarity retrieves text that *sounds* semantically related, not necessarily the exact logical answer.
  - High operational complexity: Vector database clusters (Pinecone, Milvus, Chroma) require maintenance, re-indexing, and embedding drift mitigation.
* **Vectorless Tree Architecture**:
  - Replicates human document navigation (reading the Table of Contents $\to$ locating the chapter $\to$ scanning the section $\to$ reading the specific page).
  - Uses 0 vector embeddings and 0 vector databases.

---

## 2. Two-Phase Pipeline Specification

### Phase 1: Hierarchical Tree Construction
When ingesting unstructured documents (PDFs, Markdown, long HTML docs):
1. **Structural Segmentation**: Parse headers (`#`, `##`, `###`), document outlines, or PDF bookmarks.
2. **JSON Tree Schema**:
```json
{
  "doc_id": "annual_report_2026",
  "root": [
    {
      "node_id": "sec_1",
      "title": "Financial Summary",
      "page_span": [1, 15],
      "summary": "Consolidated balance sheets, revenue breakdown, and gross margin analysis.",
      "children": [
        {
          "node_id": "sec_1_1",
          "title": "Revenue by Geography",
          "page_span": [4, 6],
          "summary": "Regional performance: North America +12%, APAC +28% YoY.",
          "children": []
        }
      ]
    }
  ]
}
```

### Phase 2: Reasoning-Driven Retrieval (LLM Traversal)
1. **Root Screening**: LLM inspects top-level `summary` attributes against user query.
2. **Deterministic Pruning**: Irrelevant branches are immediately pruned (reducing search space by 80–90%).
3. **Recursive Drill-Down**: LLM descends into target child node until reaching the terminal leaf section.
4. **Context Injection**: Agent fetches the exact page span or section text with 100% preservation of original structure (tables, footnotes, citations).

---

## 3. When to Apply in Engineering Projects
* **Recommended For**: Technical whitepapers, corporate financial filings (10-K/10-Q), compliance/legal manuals, book-length documentation.
* **Implementation Options**:
  - Standalone lightweight JSON tree parser (pure Python / Node.js).
  - Open-source engine: `pip install pageindex` / `@pageindex/sdk` for complex PDF parsing.
