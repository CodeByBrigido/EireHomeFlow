// The cloud copy of journey progress, for signed-in people.
import { Account } from "./account.js?v=20260925";
import { setState, state } from "./state.js?v=20260925";
import { steps } from "./steps.js?v=20260925";

// Returns the cloud save, so a page can wait for it before moving on.
export function setDone(done) {
  setState({ done });
  if (!Account.user) return Promise.resolve();
  return Account.saveProgress(done).catch((err) => console.error("Could not save progress to the account.", err));
}

// On sign-in, progress from this browser and from the account are merged (a step
// done in either place stays done) and saved back. Being signed in is what the
// account step asks for, so it is ticked here.
export async function syncOnSignIn() {
  const accountStep = steps.find((s) => s.account);
  const signedIn = accountStep ? { [accountStep.id]: true } : {};
  try {
    const merged = { ...(await Account.loadProgress()), ...signedIn };
    for (const id in state.done) if (state.done[id]) merged[id] = true;
    setDone(merged);
  } catch (err) {
    // Tick it in this browser only: writing to the account after a failed read would
    // replace the progress saved there.
    console.error("Could not load progress from the account.", err);
    setState({ done: { ...state.done, ...signedIn } });
  }
}
