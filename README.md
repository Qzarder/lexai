# LexAI — Legal Document Intelligence

AI-powered legal document analyzer with jurisdiction support, risk checklist, legal references, and AI consultant.

## Stack

- React 18 + Vite
- Anthropic Claude API (claude-sonnet-4-20250514)
- Tabler Icons

## Structure

```
src/
  App.jsx                  # root component
  main.jsx                 # entry point
  index.css                # base styles
  api.js                   # Anthropic API calls
  utils.js                 # color/style helpers
  constants/
    langs.js               # languages, jurisdictions, doc types
    ui.js                  # localized UI strings
  prompts/
    index.js               # system prompts (analysis + consultant)
  components/
    RiskChecklist.jsx
    Comments.jsx
    LegalRefs.jsx
    Summary.jsx
    Consultant.jsx
    PricingModal.jsx
```

## Getting started

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Features

- 8 jurisdictions: RU, EU, US, UK, DE, CN, UAE, KZ
- 6 UI languages: EN, RU, DE, FR, ZH, AR
- Document types: contract, NDA, employment, lease, PoA, T&C, privacy policy, investment
- 4 analysis tabs: risk checklist, comments, legal references, summary
- AI consultant with strict anti-hallucination prompt (Pro)
- Freemium monetization: Free / Pro / Enterprise

## Roadmap

- [ ] Backend (FastAPI) + user auth (JWT)
- [ ] RAG on legal databases (КонсультантПлюс, EUR-Lex, CourtListener)
- [ ] PDF parsing (pdfjs / python pdfminer)
- [ ] React Native (iOS + Android)
- [ ] Stripe billing + In-App Purchase
- [ ] Analysis history storage
- [ ] PDF export of analysis report
- [ ] Team / workspace support (Enterprise)
