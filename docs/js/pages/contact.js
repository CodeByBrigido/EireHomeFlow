// Contact us: the form writes the email in the reader's own email app, addressed to us.
// Nothing is sent from the site and nothing is stored. Someone signed in finds their name
// and email already filled in.
import { mailtoLink } from "../lib/contact.js?v=20260930";
import { userName } from "../lib/people.js?v=20260930";
import { Account } from "../core/account.js?v=20260930";
import { startPage } from "../core/app.js?v=20260930";
import { checkForm, formValues, sayInForm, watchForm } from "../core/forms.js?v=20260930";
import { t } from "../core/i18n.js?v=20260930";

function initPage() {
  const form = document.getElementById("contact-form");
  const user = Account.shown();
  if (user) {
    if (!form.elements.name.value) form.elements.name.value = userName(user) || "";
    if (!form.elements.email.value) form.elements.email.value = user.email || "";
  }
  watchForm(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkForm(form)) return;
    const values = formValues(form);
    const topic = form.elements.topic.selectedOptions[0].textContent.trim();
    location.href = mailtoLink({ ...values, topic });
    sayInForm(form, t("contact:form.opened"));
  });
}

startPage({ init: initPage });
