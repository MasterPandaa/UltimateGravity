---
name: sql-optimization
description: "[Multi-Dialect SQL & Query Plan Profiler] EXPLAIN ANALYZE profiling, composite index tuning, and join/CTE optimization across Postgres, MySQL, and SQLite. DO NOT USE for frontend API data fetching (use frontend-api-integration)."
---

# SQL Optimization & Query Performance

The definitive guide and workflow for diagnosing, optimizing, and verifying database query performance across relational databases and cloud data warehouses.

## 1. Non-Negotiable Verification Protocol

- **Empirical Plan Verification**: Never optimize on intuition. Always benchmark execution plans (`EXPLAIN ANALYZE`, `EXPLAIN FORMAT=JSON`, or engine equivalent).
- **Result Set Invariance**: Optimized queries must return identical row counts, column types, and deterministic ordering compared to original queries.
- **Dialect Consistency**: Adhere strictly to the syntax idioms of the target engine (PostgreSQL, MySQL, SQLite, Snowflake, BigQuery, Databricks).

## 2. Query Plan Diagnostics Checklist

| Engine | Command | Red Flags to Eliminate |
|---|---|---|
| **PostgreSQL** | `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` | `Seq Scan` on high-row tables, high `Buffers: shared read`, nested loops with high loop count. |
| **MySQL** | `EXPLAIN FORMAT=JSON` | `Using filesort`, `Using temporary`, missing keys (`key: null`). |
| **SQLite** | `EXPLAIN QUERY PLAN` | `SCAN TABLE` on large unindexed tables instead of `SEARCH TABLE ... USING INDEX`. |
| **Snowflake/BigQuery** | Profile / Execution Graph | Spilling to remote storage, excessive partitions scanned, cartesian joins. |

## 3. High-Leverage Optimization Patterns

1. **Eliminate Correlated Subqueries**: Transform scalar subqueries in `SELECT` or `WHERE` into indexed `LEFT JOIN` or window functions (`ROW_NUMBER() OVER (...)`).
2. **Selective Indexing**: Add composite B-tree indexes matching `(WHERE equality columns, JOIN columns, ORDER BY columns)`.
3. **Partition & Cluster Pruning**: Filter explicitly on partition keys (dates/timestamps) using sargable predicates (e.g. `created_at >= '2026-01-01'` instead of `DATE(created_at) = '2026-01-01'`).
4. **Pagination Optimization**: Replace `OFFSET 10000` with keyset (cursor-based) pagination (`WHERE id > :last_seen_id ORDER BY id LIMIT 50`).

## 4. References

- Detailed dialect conversions and verification checklist: `references/sql-optimization.md`
