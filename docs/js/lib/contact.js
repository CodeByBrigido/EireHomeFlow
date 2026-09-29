// Contact us: the address, and the email the contact form writes in the reader's own email app.
// Nothing is sent from the site and nothing is stored.

export const CONTACT_EMAIL = "eirehomeflow@gmail.com";

// A mailto: link with the subject and the message ready. Line breaks are CRLF, as email expects.
export function mailtoLink({ topic, name, email, message }) {
  const subject = `ÉireHome Flow: ${topic}`;
  const body = [message.trim(), "", name.trim(), email.trim()].join("\r\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
