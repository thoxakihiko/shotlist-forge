# Changelog

All notable changes to this project are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-09-27

### Added
- Seedance 2.5 support, now the default model (30s per generation pass).
  Seedance 2.0 remains available via `--model seedance-2.0` (15s per pass).
- Pass splitting: consecutive shots are grouped into generation passes that
  each fit the model's single-pass limit. Each shot carries a `pass` number;
  `formatShotList` prints `── Pass n/N ──` headers for multi-pass lists.
- `planPasses(shots, model)`, `getModel`, `models`, `defaultModel` exports.
- `--model` flag and tests for the new limits.

### Changed
- A single shot longer than the model's single-pass limit now throws
  (previously it was accepted silently).

### Notes
- Single-pass lists render exactly as in 0.1.0.
- Model limits live in `src/models.js` so this release works with the
  published `seedance-prompt-forge@0.1.x`.

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
