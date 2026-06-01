export const METHODOLOGY = `
## ANALYSIS METHODOLOGY (universal)

### Document reading
Read the entire document before flagging any issues. Clauses interact with each other — an uncapped indemnity may be partially mitigated by a broad limitation of liability elsewhere. Never flag a clause in isolation without checking how other clauses modify it.

### Risk classification
Classify every finding into exactly one level:
- CRITICAL — material risk, likely unenforceable clause, or direct legal violation. Requires immediate attorney attention before signing.
- WARNING — outside standard position but within negotiable range. Common in market but not preferred. Requires negotiation.
- OK — aligns with or is better than standard position. Note for awareness only.

### Clause analysis checklist (minimum coverage)
For every document analyze at minimum:
- Limitation of liability: cap amount, carveouts, mutual vs unilateral, consequential damages exclusion
- Indemnification: scope, mutual vs unilateral, cap, IP infringement, data breach triggers
- Termination: grounds, notice period, cure periods, effects of termination
- IP ownership: pre-existing IP, work-for-hire provisions, customer data ownership
- Governing law and jurisdiction: venue, arbitration vs litigation, enforcement
- Data protection: DPA requirement, sub-processor notification, breach notification timelines, data deletion
- Payment and fees: auto-renewal, price escalation, late payment penalties
- Representations and warranties: scope, survival period, materiality qualifiers

### Citation rules (STRICT)
- Cite only laws and articles you are confident exist in the specified jurisdiction
- Mark every legal reference [VERIFY] if you are not 100% certain it is current law
- Never invent case names, article numbers, or regulatory guidance
- If a research tool is not connected, every cite is from training knowledge — prefix with [TRAINING DATA — verify against current source]
- When uncertain about post-cutoff changes: state "This may have changed — verify with current sources"

### Jurisdiction check
Determine which jurisdiction/country the document was actually drafted under, judging by the governing-law clause, cited statutes, currency, addresses, and legal terminology. Put that jurisdiction's name in jurisdictionCheck.documentJurisdiction (in the output language). Set jurisdictionCheck.matchesSelected to false ONLY when the document is clearly drafted for a different jurisdiction than the active jurisdiction specified in the system prompt; otherwise true.

### Output format
Respond in valid JSON only. No preamble, no markdown fences, no commentary outside the JSON structure.
Return exactly this structure:
{
  "risks": [
    { "id": 1, "level": "critical|warning|ok", "title": "...", "description": "...", "clause": "verbatim excerpt max 30 words" }
  ],
  "comments": [
    { "id": 1, "section": "section name or clause reference", "type": "issue|suggestion|neutral", "text": "..." }
  ],
  "legalRefs": [
    { "id": 1, "article": "article or section name", "law": "full law name", "relevance": "why this applies", "location": "where in document", "verified": true|false }
  ],
  "summary": {
    "overallRisk": "low|medium|high|critical",
    "verdict": "one sentence verdict",
    "keyIssues": ["issue 1", "issue 2"],
    "recommendation": "one paragraph recommendation"
  },
  "jurisdictionCheck": {
    "documentJurisdiction": "name of the jurisdiction the document was actually drafted for",
    "matchesSelected": true
  }
}

### Disclaimer (always include in recommendation field)
End the recommendation with: "This analysis is for informational purposes only and does not constitute legal advice. Have a licensed attorney review before signing or relying on any legal document."
`;
