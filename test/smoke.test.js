// Minimal smoke tests — no framework, just assertions.
import { buildShotList, formatShotList, listPatterns } from "../src/index.js";
import assert from "node:assert";

let passed = 0;

function check(name, fn) {
  try {
    fn();
    passed++;
    console.log("✓ " + name);
  } catch (e) {
    console.error("✗ " + name + " — " + e.message);
    process.exitCode = 1;
  }
}

check("throws without subject", () => {
  assert.throws(() => buildShotList({}), /subject/);
});

check("default pattern yields a non-empty sequence", () => {
  const shots = buildShotList({ subject: "a barista" });
  assert.ok(Array.isArray(shots) && shots.length > 0);
  assert.equal(shots[0].n, 1);
  assert.ok(shots[0].prompt.length > 0);
});

check("--shots controls the count", () => {
  const shots = buildShotList({ subject: "x", shots: 3 });
  assert.equal(shots.length, 3);
});

check("beats set the count and pass through as actions", () => {
  const shots = buildShotList({ subject: "a runner", beats: "laces up; sprints; wins" });
  assert.equal(shots.length, 3);
  assert.equal(shots[1].action, "sprints");
  assert.ok(shots[1].prompt.toLowerCase().includes("sprints"));
});

check("duration distributes into whole seconds summing to the total", () => {
  const shots = buildShotList({ subject: "x", shots: 4, duration: 15 });
  const total = shots.reduce((a, s) => a + s.seconds, 0);
  assert.equal(total, 15);
  assert.ok(shots.every(s => Number.isInteger(s.seconds) && s.seconds >= 1));
});

check("continuity fields appear in every shot", () => {
  const shots = buildShotList({ subject: "x", style: "cinematic", lighting: "neon", shots: 4 });
  assert.ok(shots.every(s => s.prompt.toLowerCase().includes("cinematic")));
  assert.ok(shots.every(s => s.prompt.toLowerCase().includes("neon")));
});

check("pattern selection changes the shot sizes", () => {
  const reveal = buildShotList({ subject: "x", pattern: "reveal", shots: 6 });
  assert.equal(reveal[0].shot, "extreme-close-up");
  assert.equal(reveal[5].shot, "extreme-wide");
});

check("unknown pattern falls back to default", () => {
  const shots = buildShotList({ subject: "x", pattern: "nope", shots: 2 });
  assert.equal(shots.length, 2);
});

check("formatShotList renders shot headers", () => {
  const text = formatShotList(buildShotList({ subject: "x", shots: 2, duration: 8 }));
  assert.ok(text.includes("Shot 1"));
  assert.ok(text.includes("4s"));
});

check("listPatterns returns the known patterns", () => {
  const p = listPatterns();
  assert.ok(p.ad && p.narrative && p.montage && p.reveal);
});

console.log(`\n${passed} checks passed.`);
