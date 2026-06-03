#!/usr/bin/env node
// cli.js — command-line entry point for shotlist-forge.

import { buildShotList, formatShotList, listPatterns } from "./index.js";

const HELP = `
shotlist-forge (shotlist)
Turn one concept into a structured, shot-by-shot prompt sequence.

USAGE:
  shotlist --subject "a barista" --setting "cozy cafe" --pattern ad --shots 6 --duration 15
  shotlist --subject "a runner" --beats "laces up; sprints; crosses finish line"
  shotlist patterns             list available shot-rhythm patterns
  shotlist --help               show this help

FLAGS:
  --subject   (required) who/what the sequence is about
  --setting   location / environment (kept consistent across shots)
  --style     visual style (e.g. cinematic, dark-anime) — continuity
  --lighting  lighting (e.g. neon, golden-hour) — continuity
  --mood      mood (e.g. tense, serene) — continuity
  --lens      lens (e.g. anamorphic, macro) — continuity
  --aspect    aspect ratio (e.g. 16:9, 9:16, 21:9) — continuity
  --pattern   shot rhythm: ad | narrative | montage | reveal  (default: narrative)
  --beats     per-shot actions, separated by ";"  (sets the shot count)
  --shots     number of shots (ignored if --beats is given)
  --duration  total seconds, distributed across the shots
  --movement  fix the camera movement for every shot (default: auto, from pattern)
  --json      output JSON instead of formatted text

Every continuity flag accepts a preset key OR free text (powered by
seedance-prompt-forge). Unknown values pass straight through.
`;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args[key] = true; // boolean flag
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

const argv = process.argv.slice(2);

if (argv[0] === "patterns") {
  console.log("\nAvailable patterns:\n");
  for (const [k, label] of Object.entries(listPatterns())) {
    console.log(`  ${k.padEnd(10)} ${label}`);
  }
  console.log("");
  process.exit(0);
}

if (argv.includes("--help") || argv.includes("-h") || argv.length === 0) {
  console.log(HELP);
  process.exit(0);
}

const args = parseArgs(argv);

try {
  const shots = buildShotList(args);
  if (args.json) {
    console.log(JSON.stringify(shots, null, 2));
  } else {
    console.log("\n" + formatShotList(shots) + "\n");
  }
} catch (err) {
  console.error("Error: " + err.message);
  process.exit(1);
}
