# shotlist-forge

[![npm version](https://img.shields.io/npm/v/shotlist-forge.svg)](https://www.npmjs.com/package/shotlist-forge)
[![npm downloads](https://img.shields.io/npm/dm/shotlist-forge.svg)](https://www.npmjs.com/package/shotlist-forge)
[![CI](https://github.com/thoxakihiko/shotlist-forge/actions/workflows/ci.yml/badge.svg)](https://github.com/thoxakihiko/shotlist-forge/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/shotlist-forge.svg)](LICENSE)

> Turn one concept into a structured, **shot-by-shot** prompt sequence for text-to-video models (Seedance, Kling, Runway, Veo). Storyboard your AI video in seconds.

Single prompts give you single shots. Real videos are *sequences* — and writing 6
consistent, well-framed prompts by hand is tedious. `shotlist` takes one concept and
expands it into an ordered shot list, varying the framing the way an editor would
while keeping style, lighting, and mood **identical across every shot**.

Built on [`seedance-prompt-forge`](https://github.com/thoxakihiko/seedance-prompt-forge),
so each shot is a clean, model-ready prompt.

```bash
shotlist --subject "a trail runner" --setting "misty mountain ridge" --style cinematic \
         --beats "laces up boots; sprints along the ridge; reaches the summit" --aspect 9:16
```

→
```
Shot 1 · 4s · extreme-wide · laces up boots
A trail runner, laces up boots, in misty mountain ridge. Cinematic film look, shallow depth of field, color graded. Extreme wide establishing shot, subject small in frame. Crane shot rising above the scene. 9:16 vertical aspect ratio for mobile.

Shot 2 · 4s · wide · sprints along the ridge
A trail runner, sprints along the ridge, in misty mountain ridge. Cinematic film look, shallow depth of field, color graded. Wide shot, full subject visible with surrounding environment. Slow dolly push-in toward the subject. 9:16 vertical aspect ratio for mobile.

Shot 3 · 4s · medium · reaches the summit
A trail runner, reaches the summit, in misty mountain ridge. Cinematic film look, shallow depth of field, color graded. Medium shot, subject from the waist up. Handheld camera with subtle organic shake. 9:16 vertical aspect ratio for mobile.
```

---

## 🆕 What's new — Seedance 2.5 (v0.2.0)

Shot lists now know how long a model can generate in **one pass**, and split the
sequence into generation passes automatically.

- **Seedance 2.5 is the default** — up to **30s per pass** (Seedance 2.0: 15s). Keep the old behaviour with `--model seedance-2.0`.
- **Pass splitting** — consecutive shots are grouped into passes that each fit the limit. Shots are never cut in half; order is preserved. Every shot gets a `pass` number (also in `--json`).
- On 2.5, later passes can be chained with **multi-round extension**, which keeps characters and environment consistent across rounds.
- New library export `planPasses(shots, model)`.

```bash
shotlist --subject "a chef" --shots 8 --duration 45
```
```
── Pass 1/2 · 30s ──
Shot 1 · 6s · extreme-wide
...
── Pass 2/2 · 15s ──
Shot 6 · 5s · medium
...
```

Lists that fit in one pass print exactly as before (no pass headers).

> Seedance 2.5's public API isn't released yet (coming soon via BytePlus ModelArk) and new resolutions aren't officially confirmed, so neither is encoded here. Source: [ByteDance Seed blog](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5).

## ✨ Features

- 🎬 **Concept → sequence** — one input, a full numbered shot list with per-shot prompts.
- 🎞️ **Cinematic patterns** — `ad`, `narrative`, `montage`, `reveal`: each varies the framing and camera moves the way that style of edit actually cuts.
- 🔒 **Continuity built in** — style, lighting, mood, lens, and aspect stay identical across every shot, so the sequence feels like one piece.
- ✍️ **Beats → shots** — pass `--beats "a; b; c"` and each beat becomes its own shot.
- ⏱️ **Duration planning** — give a total length; it distributes whole seconds across the shots and splits them into generation passes that fit the model (≤30s on Seedance 2.5, ≤15s on 2.0).
- 📦 **CLI _and_ library**, `--json` output, built on the zero-dependency `seedance-prompt-forge`.

## Install

```bash
npm install -g shotlist-forge
```

Or as a library:

```bash
npm install shotlist-forge
```

Requires Node.js 18+.

## Usage

### Command line

```bash
shotlist --subject "a barista" --setting "a cozy specialty cafe" \
         --style cinematic --lighting golden-hour --mood serene \
         --pattern ad --shots 6 --duration 15
```

List the available shot-rhythm patterns:

```bash
shotlist patterns
```

Full help:

```bash
shotlist --help
```

### As a library

```js
import { buildShotList, formatShotList, planPasses } from "shotlist-forge";

const shots = buildShotList({
  subject: "a barista",
  setting: "a cozy specialty cafe",
  style: "cinematic",
  lighting: "golden-hour",
  pattern: "ad",
  shots: 6,
  duration: 15,
});

console.log(formatShotList(shots));
// shots is also a plain array: [{ n, shot, movement, action, seconds, pass, prompt }, ...]

planPasses(shots);                 // [{ pass: 1, shots: [1, 2, 3, 4, 5, 6], seconds: 15 }]
planPasses(shots, "seedance-2.0"); // same list, planned against the 15s limit
```

## Flags

| Flag | What it controls | Example |
|------|------------------|---------|
| `--subject` *(required)* | Who / what the sequence is about | `"a barista"` |
| `--setting` | Location / environment (continuity) | `"a cozy cafe"` |
| `--style` | Visual style (continuity) | `cinematic`, `dark-anime` |
| `--lighting` | Lighting (continuity) | `golden-hour`, `neon` |
| `--mood` | Mood (continuity) | `serene`, `tense` |
| `--lens` | Lens (continuity) | `anamorphic`, `macro` |
| `--aspect` | Aspect ratio (continuity) | `16:9`, `9:16`, `21:9` |
| `--pattern` | Shot rhythm | `ad`, `narrative`, `montage`, `reveal` |
| `--beats` | Per-shot actions (sets shot count) | `"laces up; sprints; wins"` |
| `--shots` | Number of shots (if no `--beats`) | `6` |
| `--duration` | Total seconds, distributed across shots | `15` |
| `--movement` | Fix camera movement for all shots | `slow-push` |
| `--model` | Target model — sets the per-pass limit | `seedance-2.5` (default), `seedance-2.0` |
| `--json` | Output JSON instead of text | — |

Every continuity flag accepts a preset key **or** free text — powered by
[`seedance-prompt-forge`](https://github.com/thoxakihiko/seedance-prompt-forge).

## Patterns

| Pattern | Feel |
|---------|------|
| `ad` | Commercial / ad — punchy, product-forward |
| `narrative` | Narrative scene — establish, settle, get intimate |
| `montage` | Montage — fast, varied, high-energy |
| `reveal` | Reveal — start tight, pull out to the full scene |

Each pattern is just an ordered list of shot sizes + camera moves in
[`src/patterns.js`](src/patterns.js) — adding one is a few lines.

## How it works

1. Pick a **pattern** (or pass explicit `--beats`).
2. For each shot, the pattern supplies a shot size and camera movement.
3. Your continuity fields (style, lighting, mood, lens, aspect) are merged into
   **every** shot and handed to `seedance-prompt-forge`, which assembles the
   final ordered prompt.
4. Durations are distributed across the shots to hit your target length.
5. Consecutive shots are grouped into generation passes that each fit the
   model's single-pass limit (30s on Seedance 2.5, 15s on 2.0).

## Related

- [`seedance-prompt-forge`](https://github.com/thoxakihiko/seedance-prompt-forge) — the single-shot prompt builder this is built on.

## Contributing

Patterns and behaviour are intentionally simple to extend. See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and ideas welcome.

## License

MIT — see [LICENSE](LICENSE).
