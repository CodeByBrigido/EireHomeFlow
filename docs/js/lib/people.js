// Names shown for the signed-in person. Pure, so Node tests can use them.

export const userName = (user) => ((user && user.user_metadata && user.user_metadata.full_name) || "").trim();
export const firstName = (user) => userName(user).split(/\s+/)[0] || "";

// First letter of the first and last names: "Rodrigo Andrade Brigido" gives "RB".
export function initials(user) {
  const words = userName(user).split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || user.email || "?")[0];
  return letters.toUpperCase();
}
