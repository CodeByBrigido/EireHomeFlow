import { test } from "node:test";
import assert from "node:assert/strict";
import { progress } from "../docs/js/lib/progress.js";

// Two phases: a blocking step, an optional one, then blocking steps.
const STEPS = [
  { id: "a-0", blocking: true },
  { id: "a-1", blocking: false },
  { id: "a-2", blocking: true },
  { id: "b-0", blocking: true },
];

test("nothing done: only the first step can be completed", () => {
  assert.deepEqual(progress(STEPS, {}), { unlocked: 0, doneCount: 0, pct: 0 });
});

test("optional steps never block the ones after them", () => {
  assert.deepEqual(progress(STEPS, { "a-0": true }), { unlocked: 2, doneCount: 1, pct: 25 });
});

test("false means not done", () => {
  assert.deepEqual(progress(STEPS, { "a-0": false }), { unlocked: 0, doneCount: 0, pct: 0 });
});

test("everything done", () => {
  const all = { "a-0": true, "a-1": true, "a-2": true, "b-0": true };
  assert.deepEqual(progress(STEPS, all), { unlocked: 4, doneCount: 4, pct: 100 });
});

test("no steps loaded yet", () => {
  assert.deepEqual(progress([], {}), { unlocked: 0, doneCount: 0, pct: 0 });
});
