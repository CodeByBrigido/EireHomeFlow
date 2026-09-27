// Journey progress. Pure: the caller passes the steps and the done map.

export const XP_PER_STEP = 25;

// unlocked: index of the first blocking step not done yet. Steps up to it can be completed;
// optional steps never block the ones after them.
export function progress(steps, done) {
  let unlocked = 0;
  for (const s of steps) {
    if (s.blocking && !done[s.id]) break;
    unlocked += 1;
  }
  const doneCount = steps.filter((s) => done[s.id]).length;
  return { unlocked, doneCount, pct: steps.length ? Math.round((doneCount / steps.length) * 100) : 0 };
}
