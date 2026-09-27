// Minimal smoke tests — no framework, just assertions.
import { buildShotList, formatShotList, listPatterns, planPasses, defaultModel, getModel } from "../src/index.js";
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

check("defaults to Seedance 2.5 (30s per pass)", () => {
  assert.equal(defaultModel, "seedance-2.5");
  assert.equal(getModel().maxDurationSeconds, 30);
  assert.equal(getModel("2.0").maxDurationSeconds, 15);
  assert.throws(() => getModel("nope"), /Unknown model/);
});

check("30s fits one pass on 2.5 but splits on 2.0", () => {
  const on25 = buildShotList({ subject: "x", shots: 6, duration: 30 });
  assert.ok(on25.every(s => s.pass === 1));
  const on20 = buildShotList({ subject: "x", shots: 6, duration: 30, model: "seedance-2.0" });
  assert.equal(Math.max(...on20.map(s => s.pass)), 2);
});

check("every pass stays within the model limit", () => {
  for (const model of ["seedance-2.0", "seedance-2.5"]) {
    const max = getModel(model).maxDurationSeconds;
    const shots = buildShotList({ subject: "x", shots: 8, duration: 45, model });
    for (const p of planPasses(shots, model)) assert.ok(p.seconds <= max, `${model} pass ${p.pass} = ${p.seconds}s`);
    assert.equal(shots.reduce((a, s) => a + s.seconds, 0), 45);
  }
});

check("passes keep shot order and never split a shot", () => {
  const shots = buildShotList({ subject: "x", shots: 8, duration: 45 });
  const passes = planPasses(shots);
  assert.deepEqual(passes.flatMap(p => p.shots), shots.map(s => s.n));
  assert.ok(shots.every((s, i) => i === 0 || s.pass >= shots[i - 1].pass));
});

check("a single shot longer than the limit throws", () => {
  assert.throws(() => buildShotList({ subject: "x", shots: 1, duration: 31 }), /at most 30s/);
  assert.throws(() => buildShotList({ subject: "x", shots: 1, duration: 16, model: "2.0" }), /at most 15s/);
  assert.equal(buildShotList({ subject: "x", shots: 1, duration: 30 })[0].pass, 1);
});

check("pass headers only appear for multi-pass lists", () => {
  const single = formatShotList(buildShotList({ subject: "x", shots: 3, duration: 12 }));
  assert.ok(!single.includes("Pass"));
  const multi = formatShotList(buildShotList({ subject: "x", shots: 4, duration: 24, model: "2.0" }));
  assert.ok(multi.includes("Pass 1/2") && multi.includes("Pass 2/2"));
});

console.log(`\n${passed} checks passed.`);
