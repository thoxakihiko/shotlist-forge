// Shot-sequence patterns.
//
// Each pattern is a cinematic rhythm: an ordered list of shot sizes (and a
// matching list of camera movements) that reads well as a sequence. Shot and
// movement keys are passed straight to seedance-prompt-forge, so they resolve to
// full descriptive phrasing. Sequences cycle if you request more shots than the
// pattern defines.

export const patterns = {
  // Punchy commercial cut: hook wide, sell in mediums, linger on detail.
  ad: {
    label: "Commercial / ad — punchy, product-forward",
    shots:     ["wide", "medium", "close-up", "insert", "medium", "extreme-close-up"],
    movements: ["slow-push", "static", "slow-push", "static", "tracking", "slow-pull"]
  },
  // Classic scene grammar: establish, settle, get intimate.
  narrative: {
    label: "Narrative scene — establish, settle, get intimate",
    shots:     ["extreme-wide", "wide", "medium", "over-the-shoulder", "close-up", "medium"],
    movements: ["crane", "slow-push", "handheld", "static", "slow-push", "static"]
  },
  // High-energy montage: fast, varied framing.
  montage: {
    label: "Montage — fast, varied, high-energy",
    shots:     ["medium", "close-up", "wide", "insert", "low-angle", "extreme-close-up", "two-shot", "wide"],
    movements: ["handheld", "whip-pan", "tracking", "static", "slow-push", "zoom-in", "pan-right", "slow-pull"]
  },
  // Build to a reveal: start tight and mysterious, pull out to the full scene.
  reveal: {
    label: "Reveal — start tight, pull out to the full scene",
    shots:     ["extreme-close-up", "insert", "close-up", "medium", "wide", "extreme-wide"],
    movements: ["static", "slow-pull", "slow-pull", "slow-pull", "crane", "slow-pull"]
  }
};

export const defaultPattern = "narrative";

// Pick the i-th shot/movement for a pattern, cycling if needed.
export function shotFor(pattern, i) {
  const p = patterns[pattern] || patterns[defaultPattern];
  return p.shots[i % p.shots.length];
}
export function movementFor(pattern, i) {
  const p = patterns[pattern] || patterns[defaultPattern];
  return p.movements[i % p.movements.length];
}
