// The blog: one entry per article. The blog is in English only, labels included, whatever language
// the rest of the site is shown in. The rest of each article (picture description, lead, sections and
// the note on My journey) is in content/blog/<slug>.json, and npm run posts writes blog/<slug>.html
// from both. step is the My journey step the article leads to; tags decide the similar articles.
// See README.md and specs/08-Internationalisation.md.
import { esc } from "./format.js?v=20261003";

export const CATEGORY_NAMES = { schemes: "Schemes", money: "Money", buying: "Buying", newcomers: "Newcomers", energy: "Energy", moving: "Moving in" };
export const CATEGORIES = Object.keys(CATEGORY_NAMES);

// The words the home page slideshow needs.
export const SLIDESHOW = {
  role: "carousel",
  slide: "slide",
  position: (n, total) => `${n} of ${total}`,
  goTo: (n, total) => `Show article ${n} of ${total}`,
};

export const POSTS = [
  {
    slug: "government-schemes-checker", category: "schemes", step: "preparation-4", tags: ["help-to-buy", "first-home-scheme", "lahl", "deposit"],
    title: "Which government schemes can you use? A checker for first-time buyers",
    summary: "Help to Buy, the First Home Scheme, the Local Authority Home Loan and affordable purchase: who each one is for, how they combine and what to confirm before you apply.",
  },
  {
    slug: "help-to-buy-step-by-step", category: "schemes", step: "preparation-4", tags: ["help-to-buy", "new-build", "revenue", "deposit"],
    title: "Help to Buy, step by step: from myAccount to the refund",
    summary: "How the refund of up to €30,000 on a new home works, which tax years count, and the order of the application, the claim and the payment.",
  },
  {
    slug: "first-home-scheme-explained", category: "schemes", step: "preparation-4", tags: ["first-home-scheme", "new-build", "help-to-buy"],
    title: "First Home Scheme: how the shared equity works",
    summary: "The State can fund up to 30% of a new home's price in return for a share of it. What that share costs over time, how to buy it back and who can apply.",
  },
  {
    slug: "local-authority-home-loan", category: "schemes", step: "aip-0", tags: ["lahl", "mortgage", "lenders"],
    title: "Local Authority Home Loan: a mortgage from your council",
    summary: "A fixed-rate mortgage for first-time buyers who could not get enough from two banks. The 2026 income limits, the price ceilings by county and how to apply.",
  },
  {
    slug: "deposit-savings-plan", category: "money", step: "preparation-1", tags: ["deposit", "savings", "costs"],
    title: "How many months will it take to save your deposit?",
    summary: "Set the target, subtract what you have, divide by what you can put aside each month. A simple plan with worked examples and ways to shorten the wait.",
  },
  {
    slug: "owning-vs-renting", category: "money", step: "preparation-0", tags: ["costs", "insurance", "lpt", "savings"],
    title: "The real cost of owning a home compared with renting",
    summary: "The repayment is only part of it. Insurance, Local Property Tax, management fees and maintenance set beside rent, with a worked example to adapt.",
  },
  {
    slug: "stamp-duty-and-closing-costs", category: "money", step: "preparation-2", tags: ["costs", "solicitor", "deposit"],
    title: "Stamp duty and the other costs of buying a home",
    summary: "The cash you need on top of the deposit: stamp duty, the solicitor, the survey, the valuation and the smaller items that are easy to forget.",
  },
  {
    slug: "fixed-or-variable-rate", category: "money", step: "keys-0", tags: ["mortgage", "lenders", "ber"],
    title: "Fixed, variable or green: choosing your mortgage rate",
    summary: "What a fixed rate protects you from, what a variable rate lets you do, and when a green mortgage for a BER B3 or better home lowers the cost.",
  },
  {
    slug: "mortgage-protection-and-home-insurance", category: "money", step: "legal-3", tags: ["insurance", "mortgage", "costs"],
    title: "Mortgage protection and home insurance: what you must have",
    summary: "Both must be in place before the loan is paid out, and neither has to come from your bank. What each one covers and how to compare quotes.",
  },
  {
    slug: "approval-in-principle", category: "buying", step: "aip-0", tags: ["aip", "lenders", "mortgage", "credit"],
    title: "Approval in Principle: what lenders check before they say yes",
    summary: "Your income, your saving pattern, your debts and your documents. What an AIP letter means, how long it lasts and how to get one without surprises.",
  },
  {
    slug: "bidding-and-sale-agreed", category: "buying", step: "search-3", tags: ["bidding", "viewings", "solicitor"],
    title: "Bidding on a home in Ireland: offers, Sale Agreed and gazumping",
    summary: "How offers work through the estate agent, what Sale Agreed does and does not mean, and how to set a ceiling you will stick to.",
  },
  {
    slug: "viewing-checklist", category: "buying", step: "search-2", tags: ["viewings", "ber", "bidding"],
    title: "What to check at a viewing",
    summary: "A viewing is short. A room-by-room routine, the questions to ask the agent and what to note afterwards, so you can compare homes fairly.",
  },
  {
    slug: "solicitor-survey-valuation", category: "buying", step: "legal-0", tags: ["solicitor", "costs", "lenders"],
    title: "Solicitor, surveyor and valuer: who does what, and what it costs",
    summary: "Three professionals check three different things before you get the keys. What each one is responsible for, the usual fees and when to book them.",
  },
  {
    slug: "new-build-or-second-hand", category: "buying", step: "search-0", tags: ["new-build", "help-to-buy", "ber", "costs"],
    title: "New build or second-hand: how the numbers change",
    summary: "VAT, stamp duty, Help to Buy, energy ratings and snagging all differ. A side-by-side view of what changes in your budget and your timeline.",
  },
  {
    slug: "buying-as-a-newcomer", category: "newcomers", step: "aip-0", tags: ["newcomers", "lenders", "credit", "aip"],
    title: "Buying a home in Ireland as a newcomer: permission, income and credit",
    summary: "What lenders ask of people who have recently moved to Ireland: immigration permission, time in your job, income from abroad and a credit record they can see.",
  },
  {
    slug: "credit-history-in-ireland", category: "newcomers", step: "preparation-3", tags: ["credit", "newcomers", "aip"],
    title: "Your credit history in Ireland: the Central Credit Register",
    summary: "What the register holds, how lenders use it, how to get your report free of charge and how to build a record if you are new to the country.",
  },
  {
    slug: "ber-upgrades-and-seai-grants", category: "energy", step: "settling-3", tags: ["ber", "grants", "costs"],
    title: "What it costs to improve your BER, and the SEAI grants that help",
    summary: "Insulation, heat pumps, windows and solar panels: the 2026 grant amounts, the order to do the work in and how a better rating lowers your bills.",
  },
  {
    slug: "change-of-address-checklist", category: "moving", step: "settling-0", tags: ["moving", "revenue", "utilities"],
    title: "Change of address checklist: Revenue, your bank, An Post and more",
    summary: "The organisations to tell when you move, in an order that saves time, from mail redirection to the electoral register.",
  },
  {
    slug: "local-property-tax-for-new-owners", category: "moving", step: "settling-1", tags: ["lpt", "revenue", "moving"],
    title: "Local Property Tax for new owners",
    summary: "When you become liable, how the bands for 2026 to 2030 work, how to value your home and how to pay through Revenue's myAccount.",
  },
  {
    slug: "new-build-snag-list", category: "moving", step: "keys-3", tags: ["new-build", "moving", "solicitor"],
    title: "Snag list: checking a new build before you move in",
    summary: "How to inspect a new home for defects, when to book a snag surveyor and how to get the builder to fix the list before and after closing.",
  },
];

export const postPath = (slug) => "blog/" + slug + ".html";
export const postImage = (slug) => "img/blog/" + slug + ".svg";
export const findPost = (slug) => POSTS.find((post) => post.slug === slug) || null;

// A shuffled copy (Fisher-Yates). random() returns a number from 0 up to, but not including, 1.
export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The home page: four articles for the slideshow, three beside it and the rest below, all different.
export function homeSelection(random = Math.random, posts = POSTS) {
  const order = shuffle(posts, random);
  return { slides: order.slice(0, 4), side: order.slice(4, 7), more: order.slice(7) };
}

// An article card: the picture, the category and the title, all one link. "row" puts the picture
// beside the text, "column" above it. A hidden card waits for "Show more articles".
export function postCardHtml(post, layout = "row", hidden = false) {
  return `<li class="post-card post-card--${layout}"${hidden ? " hidden" : ""}>
      <a class="post-card__link" href="${esc(postPath(post.slug))}">
        <img class="post-card__image" src="${esc(postImage(post.slug))}" alt="" width="800" height="500" loading="lazy">
        <span class="post-card__body">
          <span class="post-card__category">${esc(CATEGORY_NAMES[post.category])}</span>
          <span class="post-card__title">${esc(post.title)}</span>
        </span>
      </a>
    </li>`;
}

// The articles closest to this one: the same category counts most, then each shared tag.
// Ties keep the order of POSTS, so the list is the same on every visit.
export function similarPosts(slug, count = 3, posts = POSTS) {
  const post = posts.find((item) => item.slug === slug);
  if (!post) return [];
  const score = (other) => (other.category === post.category ? 3 : 0) + other.tags.filter((tag) => post.tags.includes(tag)).length;
  return posts
    .filter((other) => other.slug !== slug)
    .map((other, index) => ({ other, index, score: score(other) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((entry) => entry.other);
}
