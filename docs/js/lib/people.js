// Names shown for the signed-in person. Pure, so Node tests can use them.

// display_name is the name set in My profile. A Google sign-in rewrites full_name and name
// with the name on the Google account each time, so the one chosen here has to live apart.
export function userName(user) {
  const meta = (user && user.user_metadata) || {};
  return (meta.display_name || meta.full_name || meta.name || "").trim();
}

export const firstName = (user) => userName(user).split(/\s+/)[0] || "";

// First letter of the first and last names: "Rodrigo Andrade Brigido" gives "RB".
export function initials(user) {
  const words = userName(user).split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || user.email || "?")[0];
  return letters.toUpperCase();
}

// A first Google sign-in creates the account, so its creation and sign-in times match.
export const isNewAccount = (user) =>
  !!(user && user.created_at && user.last_sign_in_at) &&
  Math.abs(Date.parse(user.last_sign_in_at) - Date.parse(user.created_at)) < 60 * 1000;
