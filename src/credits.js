// Credit system — all magic numbers live here, change once to reprice everything

export const PLAN_CONFIG = {
  free: {
    credits: 20,
    docPages: 10,   // max pages per single document
    maxDocs:  1,    // max documents per analysis
    label:    "Free",
  },
  pro: {
    credits: 300,
    docPages: 80,
    maxDocs:  3,
    label:    "Pro",
  },
  enterprise: {
    credits: 1500,
    docPages: 300,
    maxDocs:  7,
    label:    "Enterprise",
  },
};

export const CHARS_PER_PAGE = 2500; // ~500 words, standard A4 page

export function pagesToChars(pages) {
  return pages * CHARS_PER_PAGE;
}

export function charsToPages(chars) {
  return Math.ceil(chars / CHARS_PER_PAGE);
}

// Credit cost brackets — edit to reprice
export function calcCreditCost(totalChars) {
  const pages = charsToPages(totalChars);
  if (pages <= 5)   return 2;
  if (pages <= 20)  return 5;
  if (pages <= 60)  return 12;
  if (pages <= 150) return 29;
  return 58;
}

// One-time credit packs — stack on top of monthly subscription
export const CREDIT_PACKS = [
  { id: "pack_50",  credits: 50,  price: 4.99,  label: "Starter" },
  { id: "pack_150", credits: 150, price: 12.99, label: "Standard" },
  { id: "pack_400", credits: 400, price: 29.99, label: "Pro Pack", badge: "popular" },
];

// localStorage persistence
const KEY_USED  = "lexai_credits_used";
const KEY_RESET = "lexai_credits_reset";
const KEY_BONUS = "lexai_credits_bonus"; // purchased top-ups, never reset

function monthStart() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

export function getCreditsUsed() {
  const reset = parseInt(localStorage.getItem(KEY_RESET) || "0");
  if (reset < monthStart()) {
    localStorage.setItem(KEY_RESET, monthStart().toString());
    localStorage.setItem(KEY_USED, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(KEY_USED) || "0");
}

export function getBonusCredits() {
  return parseInt(localStorage.getItem(KEY_BONUS) || "0");
}

export function addBonusCredits(amount) {
  localStorage.setItem(KEY_BONUS, (getBonusCredits() + amount).toString());
}

export function getCreditsRemaining(plan) {
  const monthly = PLAN_CONFIG[plan]?.credits ?? PLAN_CONFIG.free.credits;
  return Math.max(0, monthly - getCreditsUsed()) + getBonusCredits();
}

// plan required to know monthly allowance — spend monthly first (they expire), then bonus
export function deductCredits(amount, plan) {
  const monthlyTotal = PLAN_CONFIG[plan]?.credits ?? PLAN_CONFIG.free.credits;
  const used = getCreditsUsed();
  const monthlyLeft = Math.max(0, monthlyTotal - used);

  if (amount <= monthlyLeft) {
    localStorage.setItem(KEY_USED, (used + amount).toString());
  } else {
    localStorage.setItem(KEY_USED, (used + monthlyLeft).toString());
    const fromBonus = amount - monthlyLeft;
    localStorage.setItem(KEY_BONUS, Math.max(0, getBonusCredits() - fromBonus).toString());
  }
}
