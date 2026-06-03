// builder.js — the engine.
// Expands one concept into a structured, shot-by-shot sequence. Each shot's
// prompt is assembled by seedance-prompt-forge, so continuity fields (style,
// lighting, mood, lens, aspect) stay identical across every shot.

import { buildPrompt } from "seedance-prompt-forge";
import { patterns, defaultPattern, shotFor, movementFor } from "./patterns.js";

// Split durations as evenly as possible into `count` whole seconds summing to
// `total`. Leftover seconds are spread onto the earliest shots.
function distribute(total, count) {
  const base = Math.floor(total / count);
  let rem = total - base * count;
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(base + (rem-- > 0 ? 1 : 0));
  }
  return out;
}

/**
 * buildShotList — expand a concept into an ordered shot sequence.
 * @param {Object} input
 * @param {string}   input.subject     - REQUIRED. Who/what the sequence is about.
 * @param {string}  [input.setting]    - location / environment (continuity)
 * @param {string}  [input.style]      - visual style key or free text (continuity)
 * @param {string}  [input.lighting]   - lighting key or free text (continuity)
 * @param {string}  [input.mood]       - mood key or free text (continuity)
 * @param {string}  [input.lens]       - lens key or free text (continuity)
 * @param {string}  [input.aspect]     - aspect ratio key (continuity)
 * @param {string}  [input.pattern]    - shot rhythm: ad | narrative | montage | reveal
 * @param {string[]|string} [input.beats] - per-shot actions; array or "a; b; c"
 * @param {number}  [input.shots]      - number of shots (ignored if beats given)
 * @param {number}  [input.duration]   - total seconds to distribute across shots
 * @param {string}  [input.movement]   - fixed camera movement, or "auto" (pattern)
 * @returns {Array<{n:number, shot:string, movement:string, action:?string, seconds:number, prompt:string}>}
 */
export function buildShotList(input = {}) {
  if (!input.subject || !String(input.subject).trim()) {
    throw new Error("`subject` is required. What is the sequence about?");
  }

  const pattern = patterns[input.pattern] ? input.pattern : defaultPattern;

  // Normalize beats: accept an array or a "a; b; c" string.
  let beats = input.beats;
  if (typeof beats === "string") {
    beats = beats.split(/\s*;\s*/).map(b => b.trim()).filter(Boolean);
  }
  const hasBeats = Array.isArray(beats) && beats.length > 0;

  // Shot count: beats win, else explicit --shots, else the pattern's length.
  const count = hasBeats
    ? beats.length
    : (Number(input.shots) > 0 ? Math.floor(Number(input.shots)) : patterns[pattern].shots.length);

  const seconds = Number(input.duration) > 0
    ? distribute(Math.floor(Number(input.duration)), count)
    : new Array(count).fill(4); // sensible default: 4s per shot

  const continuity = {
    setting: input.setting,
    style: input.style,
    lighting: input.lighting,
    mood: input.mood,
    lens: input.lens,
    aspect: input.aspect
  };

  const shots = [];
  for (let i = 0; i < count; i++) {
    const shot = shotFor(pattern, i);
    const movement = input.movement && input.movement !== "auto"
      ? input.movement
      : movementFor(pattern, i);
    const action = hasBeats ? beats[i] : undefined;

    const prompt = buildPrompt({
      subject: input.subject,
      action,
      ...continuity,
      shot,
      movement
    });

    shots.push({ n: i + 1, shot, movement, action: action || null, seconds: seconds[i], prompt });
  }
  return shots;
}

/**
 * formatShotList — render a shot list as readable text.
 * @param {Array} shots - output of buildShotList
 * @returns {string}
 */
export function formatShotList(shots) {
  return shots
    .map(s => {
      const head = `Shot ${s.n} · ${s.seconds}s · ${s.shot}${s.action ? ` · ${s.action}` : ""}`;
      return `${head}\n${s.prompt}`;
    })
    .join("\n\n");
}

// Expose pattern names + labels for CLI discovery.
export function listPatterns() {
  const out = {};
  for (const [k, v] of Object.entries(patterns)) out[k] = v.label;
  return out;
}
