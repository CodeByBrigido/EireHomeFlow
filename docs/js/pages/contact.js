// Contact us: the form sends the message from the site to the Supabase Edge Function "contact",
// which emails it to us. Someone signed in finds their name and email already filled in.
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config.js?v=20261002";
import { contactBody, contactUrl, sendOutcome } from "../lib/contact.js?v=20261002";
import { userName } from "../lib/people.js?v=20261002";
import { Account } from "../core/account.js?v=20261002";
import { startPage } from "../core/app.js?v=20261002";
import { checkForm, formValues, sayInForm, watchForm } from "../core/forms.js?v=20261002";
import { locale, t } from "../core/i18n.js?v=20261002";
import { showToast } from "../core/notices.js?v=20261002";

const PROBLEMS = { tooMany: "contact:form.tooMany", failed: "contact:form.failed" };

async function send(form) {
  const url = contactUrl(SUPABASE_URL);
  if (!url) return "failed";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify(contactBody(formValues(form), locale())),
    });
    return sendOutcome(response.status);
  } catch (err) {
    return "failed";
  }
}

function initPage() {
  const form = document.getElementById("contact-form");
  const user = Account.shown();
  if (user) {
    if (!form.elements.name.value) form.elements.name.value = userName(user) || "";
    if (!form.elements.email.value) form.elements.email.value = user.email || "";
  }
  watchForm(form);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!checkForm(form)) return;
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    sayInForm(form, t("common:forms.wait"));
    const outcome = await send(form);
    button.disabled = false;
    if (outcome === "sent") {
      // Name and email stay, so a second message is quick to write.
      form.elements.message.value = "";
      form.elements.topic.selectedIndex = 0;
      sayInForm(form, "");
      showToast(t("contact:form.sent"));
    } else {
      sayInForm(form, t(PROBLEMS[outcome]));
    }
  });
}

startPage({ init: initPage });
