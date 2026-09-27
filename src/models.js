// models.js — per-model generation limits used to split a shot list into passes.
//
// Kept local (instead of importing from seedance-prompt-forge) so this package
// works with the published seedance-prompt-forge@0.1.x. Only officially
// published numbers live here.
//
// Seedance 2.5 source:
// https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5

export const models = {
  "seedance-2.0": {
    label: "Seedance 2.0",
    maxDurationSeconds: 15
  },
  "seedance-2.5": {
    label: "Seedance 2.5",
    maxDurationSeconds: 30,
    // Multi-round extension keeps characters/environment consistent, so later
    // passes can continue the first one instead of starting cold.
    multiRoundExtension: true
    // TODO: resolutions and API parameters are not officially published yet
    // (API coming soon via BytePlus ModelArk) — do not add them here.
  }
};

export const defaultModel = "seedance-2.5";

// Accept "2.5", "seedance-2.5", "Seedance 2.5", etc.
export function getModel(id = defaultModel) {
  const key = String(id).trim().toLowerCase().replace(/\s+/g, "-");
  const resolved = models[key] ? key : `seedance-${key}`;
  if (!models[resolved]) {
    throw new Error(`Unknown model "${id}". Available: ${Object.keys(models).join(", ")}.`);
  }
  return { id: resolved, ...models[resolved] };
}
