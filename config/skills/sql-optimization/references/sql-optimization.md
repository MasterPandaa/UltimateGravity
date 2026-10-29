# SQL Optimization & Multi-Dialect Reference

## 1. Query Plan Analysis Across Engines

### PostgreSQL
```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT u.id, count(o.id)
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id;
```
- **Sequential Scan (`Seq Scan`) on large tables**: Look for missing indexes on filter/join columns.
- **Nested Loop with high row count**: Check if index scan or hash join is more optimal.
- **Buffers**: Look for `Buffers: shared read` indicating cache misses.

### MySQL
```sql
EXPLAIN FORMAT=JSON
SELECT ...;
```
- Look for `Using filesort` or `Using temporary`.
- Verify `key` column is using the expected index.

### SQLite
```sql
EXPLAIN QUERY PLAN
SELECT ...;
```
- Watch out for `SCAN TABLE` (requires indexing) vs `SEARCH TABLE ... USING INDEX`.

---

## 2. Dialect Matrix Cheat Sheet

| Feature | PostgreSQL | Snowflake | BigQuery | Redshift | Databricks |
|---|---|---|---|---|---|
| **Date Trunc** | `DATE_TRUNC('month', ts)` | `DATE_TRUNC('MONTH', ts)` | `DATE_TRUNC(ts, MONTH)` | `DATE_TRUNC('month', ts)` | `DATE_TRUNC('MONTH', ts)` |
| **JSON Extract** | `col->>'field'` | `col:field::string` | `JSON_VALUE(col, '$.field')` | `JSON_EXTRACT_PATH_TEXT(col, 'field')` | `col:field` |
| **String Concat** | `a \|\| b` | `a \|\| b` or `CONCAT(a, b)` | `CONCAT(a, b)` | `a \|\| b` | `CONCAT(a, b)` |
| **Deduplication** | `DISTINCT ON (k) ...` | `QUALIFY ROW_NUMBER() ... = 1` | `QUALIFY ROW_NUMBER() ... = 1` | Subquery with `ROW_NUMBER() = 1` | `QUALIFY ROW_NUMBER() ... = 1` |

---

## 3. Correctness Verification Checklist

- [ ] Does the optimized query return identical row counts on empty/null tables?
- [ ] Are `NULL` values handled correctly in join predicates (`IS NOT DISTINCT FROM`)?
- [ ] Does the execution time improve by at least 30% without introducing memory bloat (`work_mem`)?
- [ ] Are aggregate sums/averages checked with deterministic checksums before and after?
