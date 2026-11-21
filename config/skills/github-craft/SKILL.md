---
name: github-craft
description: "[GitHub Repository Launch & Growth Architect] Standardized framework for high-converting README, evergreen About, trending Topics, scannable Changelog, and GitHub Releases."
allowed-tools: run_command, read_file, edit_file
tags: [github, branding, readme, changelog, releases, seo, marketing]
---

# GitHub Craft: Repository Launch & Conversion Engine

Standardized playbook for transforming developer repositories into high-credibility, trending, and reproducible open-source assets.

## 1. The 6 Repository Pillars
Every public repository must align these six surfaces before launch:
1. **About**: Evergreen transformation hook, curiosity-sparking, zero volatile features (`references/about-and-topics.md`).
2. **Topics / Tags**: Curated 15–20 trending, high-intent tags for GitHub Explore & SEO (`references/about-and-topics.md`).
3. **README.md**: Author craft identity, 5-Pains comparison, audience matrix, and verified benchmarks (`references/readme-conversion-architecture.md`).
4. **CHANGELOG.md**: Dense, scannable milestone evolution with clean Mermaid timelines (`references/changelog-distillation.md`).
5. **Releases & Tags**: Semver tagging and automated GitHub release notes via `gh` CLI (`references/release-and-tagging.md`).
6. **Visuals & Badges**: 21:9 banner hierarchy and flat-square Shields.io status indicators (`references/visuals-and-badges.md`).

## 2. Standard Launch Sequence
```
Audit Codebase ──> Craft Readme ──> Write Changelog ──> Set About/Topics ──> Tag & Release
```
1. **Audit & Ground**: Scan repo via `git status`, test scripts, and benchmarks.
2. **Author Core Docs**: Draft `README.md` and `CHANGELOG.md` adhering to anti-slop standards.
3. **Sync Metadata**: Apply description and trending topics via `gh repo edit` and `gh api`.
4. **Publish Release**: Tag commit and publish formal GitHub release via `gh release create`.

## 3. Universal Launch Invariants
- **Author Identity**: Explicitly credit the engineer (`Engineered by @username`) to establish craft credibility.
- **The Iron Law of Documentation**: No unsubstantiated performance claims; every benchmark must tie to physical logs.
- **Zero Volatility in About**: Never put version numbers, temporary counts, or volatile features in the GitHub About text.
- **100% English Standard**: All repository assets (docs, releases, changelogs, comments) must be in English.
