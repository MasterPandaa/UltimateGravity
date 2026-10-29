# Repository Asset Audit & Dependency Classification

## 1. The 4-Tier Asset Classification Matrix

| Tier | Classification | Criteria | Action |
|---|---|---|---|
| **Tier 1** | *Core Asset* | Proprietary business algorithms, unique domain logic, custom IP. | Protect, maintain high test coverage. |
| **Tier 2** | *Extract & Merge* | Copy-pasted helper functions, duplicate SDK wrappers, scattered utilities. | Extract to shared library/monorepo package. |
| **Tier 3** | *Rebuild* | Outdated hand-rolled HTTP clients, custom date parsers, obsolete polyfills. | Replace with native language/platform APIs. |
| **Tier 4** | *Deprecate* | Stale vendor forks, unused dependencies, dead prototypes. | Remove immediately to reduce attack surface. |

---

## 2. Cross-Stack Library Signatures
Audit repositories for embedded dependencies:
- **C/C++**: Embedded `sqlite3.c`, `cJSON`, `zlib`, outdated OpenSSL static builds.
- **Android/Java**: Shaded `.jar` files in `libs/`, out-of-date Gradle transitive deps.
- **iOS (Swift/Obj-C)**: Bundled `.framework` or `.xcframework` binaries without SPM provenance.
- **Web**: Vendored jQuery plugins, duplicated UI components in `src/vendor/`.
