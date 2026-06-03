# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-06-03

### Added
- Initial release: `shotlist` CLI and `buildShotList` / `formatShotList` /
  `listPatterns` library API.
- Concept-to-sequence engine that expands one input into an ordered, numbered
  shot list, built on [`seedance-prompt-forge`](https://github.com/thoxakihiko/seedance-prompt-forge).
- Four cinematic patterns: `ad`, `narrative`, `montage`, `reveal`.
- `--beats` to turn a list of actions into shots; `--shots` and `--duration`
  to control count and per-shot timing.
- Continuity fields (style, lighting, mood, lens, aspect) applied identically
  across every shot.
- `--json` output and a smoke test suite.
