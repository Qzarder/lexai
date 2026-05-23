// ─── PROCEDURAL BLOCKS ───────────────────────────────────────────────────────
// Jurisdiction-specific procedural law context for court document analysis.
// Selected based on user's jurisdiction, injected into proceduralSystemPrompt.
// ─────────────────────────────────────────────────────────────────────────────

export const PROCEDURAL_BLOCKS = {

  RU: `
## JURISDICTION: Russia — Procedural Law

### Applicable codes (search these first)
- ГПК РФ — Гражданский процессуальный кодекс (general civil claims, courts of general jurisdiction)
- АПК РФ — Арбитражный процессуальный кодекс (commercial/business disputes, arbitrazh courts)
- КАС РФ — Кодекс административного судопроизводства (administrative claims against state bodies)
- УПК РФ — if criminal procedure aspects appear

### Key sources to search via search_legal_sources
- Постановления Пленума Верховного Суда РФ — binding interpretive guidance for courts
- Обзоры судебной практики ВС РФ (quarterly) — current court positions on specific issues
- vsrf.ru — primary source for both Пленумы and Обзоры

### Procedural compliance checklist (РФ)
- **Подведомственность / Подсудность**: correct court (general vs arbitrazh vs administrative)?
- **Досудебный порядок**: mandatory pre-trial procedure followed? (required for most ГПК and АПК claims)
- **Сроки**: statute of limitations (исковая давность) — general 3 years (ГК РФ ст.196), check special terms; filing deadlines for appeals/cassation
- **Надлежащий ответчик**: is the respondent the correct legal entity?
- **Предмет и основание иска**: clearly stated? Changes mid-proceedings are restricted (АПК ст.49)
- **Доказательства**: admissible under ГПК/АПК? Certified, notarized if required?
- **Цена иска**: correctly calculated? State duty (госпошлина) paid?
- **Полномочия представителя**: power of attorney valid and properly formatted?

### Appeal deadlines (critical — always check)
- Апелляция: 1 month from court decision date (ГПК ст.321, АПК ст.259)
- Кассация (1st): 3 months (АПК ст.276), 3 months (ГПК ст.376.1)
- Надзор (ВС РФ): 3 months from last court act

### Common grounds for reversal (search ВС practice)
- Неправильное применение норм материального права
- Существенное нарушение норм процессуального права
- Несоответствие выводов суда обстоятельствам дела
- Нарушение принципа состязательности
`,

  EU: `
## JURISDICTION: European Union — Procedural Context
Procedural law in the EU is primarily national. Identify which member state's courts are involved.
Key EU-level instruments:
- Brussels I Recast (Regulation 1215/2012) — jurisdiction and recognition of judgments
- Rome I (Regulation 593/2008) — applicable law for contracts
- European Small Claims Procedure — for cross-border claims under €5,000
Search national procedural codes of the relevant member state.
`,

  US: `
## JURISDICTION: United States — Procedural Context
- Federal: Federal Rules of Civil Procedure (FRCP) — pleading standards (Twombly/Iqbal), discovery, motions
- State: varies significantly; identify which state court
- Key issues: personal jurisdiction, subject matter jurisdiction (diversity vs federal question), venue, statute of limitations
- Pleading: FRCP Rule 8 (notice pleading) vs state fact-pleading standards
Search FRCP rules and applicable state procedural rules.
`,

  UK: `
## JURISDICTION: United Kingdom — Procedural Context
- Civil Procedure Rules (CPR) — primary procedural framework
- Pre-action protocols — mandatory compliance before filing
- Part 36 offers — settlement mechanism with cost consequences
- Limitation Act 1980 — general 6-year limitation for contract claims
Search CPR and relevant Practice Directions.
`,

  DE: `
## JURISDICTION: Germany — Procedural Context
- ZPO (Zivilprozessordnung) — civil procedure
- Mandatory Güteverfahren (conciliation) in some Länder before court filing
- Instanzenzug: Amtsgericht → Landgericht → Oberlandesgericht → BGH
- Fristen: strict deadlines, Wiedereinsetzung possible but rare
Search ZPO and BGH practice on the specific procedural issue.
`,
};

// ─── JURISDICTION BLOCKS ──────────────────────────────────────────────────────
// Each block contains jurisdiction-specific legal standards, default positions,
// escalation triggers, and key laws relevant to document analysis.
// The analysis engine selects the matching block based on user's jurisdiction choice.
// US block includes claude-for-legal methodology (commercial + privacy + corporate).
// ─────────────────────────────────────────────────────────────────────────────

export const JURISDICTION_BLOCKS = {

  // ── RUSSIA ──────────────────────────────────────────────────────────────────
  RU: `
## JURISDICTION: Russia (РФ)

### Governing law framework
- Civil Code of the Russian Federation (ГК РФ) — primary source for contracts
- Labor Code (ТК РФ) — employment agreements
- Federal Law No. 152-FZ "On Personal Data" — data protection
- Federal Law No. 149-FZ "On Information" — digital and IT contracts
- Federal Law No. 44-FZ / 223-FZ — public procurement (if applicable)
- Anti-monopoly Law (135-FZ) — exclusivity and market restrictions

### Standard positions (RU contracts)
- Limitation of liability: Russian courts may void blanket liability exclusions under ГК РФ Art. 401; caps should be specific and reasonable
- Governing law: Russian law required for contracts with Russian state entities; parties may choose foreign law for commercial contracts under ГК РФ Art. 1210
- Dispute resolution: Arbitration clauses valid; specify МКАС (ICC Moscow) or state arbitrazh court
- Force majeure: Must reference specific circumstances; blanket clauses often unenforceable
- IP ownership: Work-for-hire (служебное произведение) governed by ГК РФ Part IV, Art. 1295; employer owns rights if created in scope of employment
- Data localization: Personal data of Russian citizens must be stored on servers in Russia (152-FZ Art. 18.1)
- NDA enforceability: Trade secret protection under 98-FZ; must document what constitutes trade secret

### Escalation triggers (RU)
- CRITICAL: Contract governed by foreign law for Russia-domestic transaction without valid justification
- CRITICAL: Personal data processing without reference to 152-FZ requirements
- CRITICAL: Liability exclusion for intentional acts (void under ГК РФ Art. 401.4)
- CRITICAL: Arbitration clause naming foreign-only jurisdiction for dispute with Russian state entity
- WARNING: No force majeure clause or clause without specific circumstances listed
- WARNING: IP assignment without specifying which rights (exclusive/non-exclusive) and territory
- WARNING: Auto-renewal without explicit notice period (recommended 30+ days)
`,

  // ── EUROPEAN UNION ───────────────────────────────────────────────────────────
  EU: `
## JURISDICTION: European Union

### Governing law framework
- GDPR (Regulation 2016/679) — personal data processing
- EU AI Act (Regulation 2024/1689) — AI systems and high-risk applications [VERIFY: current implementation status]
- EU Consumer Rights Directive — B2C contracts
- Late Payment Directive (2011/7/EU) — B2B payment terms
- eIDAS Regulation — electronic signatures
- NIS2 Directive — cybersecurity obligations for critical entities
- Standard Contractual Clauses (SCCs) — cross-border data transfers

### Standard positions (EU contracts)
- Data protection: DPA (Data Processing Agreement) mandatory for any personal data processing; must specify lawful basis, retention periods, sub-processor list
- DSAR response: 30-day statutory deadline under GDPR Art. 12; document all DSARs
- Data transfer: SCCs or adequacy decision required for transfer outside EEA; Privacy Shield invalid (Schrems II)
- Limitation of liability: Must not exclude liability for death/personal injury or fraud; consumer contracts have additional protections
- Governing law: Rome I Regulation governs choice of law; mandatory consumer protections cannot be contracted away
- Electronic signatures: Advanced electronic signature (AES) or qualified (QES) for regulated documents under eIDAS

### Escalation triggers (EU)
- CRITICAL: Processing personal data without a valid lawful basis (GDPR Art. 6)
- CRITICAL: No DPA where vendor processes personal data on behalf of controller
- CRITICAL: Cross-border data transfer to non-adequate country without SCCs or other safeguard
- CRITICAL: Liability exclusion covering death, personal injury, or fraud
- WARNING: Sub-processor clause without notification obligation
- WARNING: Breach notification period exceeding 72 hours (GDPR Art. 33)
- WARNING: Missing right to erasure or data portability provisions where applicable
`,

  // ── UNITED STATES (claude-for-legal methodology) ────────────────────────────
  US: `
## JURISDICTION: United States

[US-SPECIFIC BLOCK — apply only when document is governed by US law]

### Governing law framework
- UCC Article 2 — sale of goods
- Common law — service contracts and mixed agreements
- Federal Arbitration Act — arbitration enforceability
- CCPA/CPRA (California) — consumer data privacy
- HIPAA — healthcare data
- SOX — financial reporting obligations for public companies
- DMCA §512 — safe harbor for online platforms
- ADA, FMLA, FLSA — employment (federal)
- State-specific: Delaware corporate law, California employment law, New York commercial law

### Standard positions (US contracts — from claude-for-legal playbook)
- Limitation of liability: Mutual cap at 12 months of fees paid/payable; acceptable range 6–24 months; escalate if uncapped or consequential damages included for one party only
- Indemnification: Mutual for IP infringement and data breach; acceptable if limited to third-party claims; escalate if unilateral or uncapped
- IP ownership: Each party retains pre-existing IP; customer owns customer data; escalate on broad work-for-hire or IP assignment clauses
- Data protection: Require DPA for any personal data; sub-processor notification; data deletion on termination; breach notification within 72 hours (or per applicable state law)
- Governing law: Specify state; Delaware for corporate, NY for commercial, CA adds mandatory employee protections
- Arbitration: FAA governs; class action waiver common but check enforceability by state; JAMS/AAA preferred
- Auto-renewal: Cancel-by notice 30–90 days standard; flag if shorter than 30 days

### Risk flags (US-specific — from claude-for-legal)
- NDA triage: GREEN = mutual, reasonable scope, 2–3 year term; YELLOW = unilateral or broad scope; RED = perpetual, overly broad, covers publicly available information
- Employment: At-will presumption in most states; restrictive covenants enforceable varies by state (unenforceable in CA); wage/hour: check FLSA + state minimum wage
- IP — work for hire: Only applies to specific categories under 17 U.S.C. §101; independent contractor ≠ automatic work for hire
- Arbitration: Delegation clause (arbitrator decides arbitrability) — flag and surface for attorney review
- Consequential damages: Mutual exclusion is market standard; one-sided exclusion favoring vendor is a WARNING

### Escalation triggers (US)
- CRITICAL: Unilateral IP assignment of pre-existing or independently developed IP
- CRITICAL: Unlimited liability exposure with no cap
- CRITICAL: Choice of law clause waiving mandatory state employment protections (especially CA)
- CRITICAL: No data breach notification clause for contracts involving personal data
- WARNING: Arbitration with no carveout for IP injunctive relief
- WARNING: Auto-renewal with less than 30 days cancel-by notice
- WARNING: Non-compete clause — check state enforceability before flagging risk level
`,

  // ── UNITED KINGDOM ───────────────────────────────────────────────────────────
  UK: `
## JURISDICTION: United Kingdom

### Governing law framework
- UK GDPR + Data Protection Act 2018 — personal data (post-Brexit UK version of GDPR)
- Unfair Contract Terms Act 1977 (UCTA) — limits exclusion clauses in B2B contracts
- Consumer Rights Act 2015 — B2C contracts
- Companies Act 2006 — corporate governance
- Intellectual Property Act 2014 — IP rights
- Employment Rights Act 1996 — employment contracts

### Standard positions (UK contracts)
- Limitation of liability: UCTA requires exclusion clauses to be "reasonable"; death/personal injury cannot be excluded
- Data protection: UK GDPR applies post-Brexit; ICO is supervisory authority; international transfers require UK adequacy regulations or UK SCCs
- IP ownership: Employee IP vests in employer for work in course of employment (CDPA 1988 s11)
- Governing law: English law common for commercial; Scots law for Scotland-specific matters
- Dispute resolution: English courts or LCIA arbitration common; consider jurisdiction carefully post-Brexit

### Escalation triggers (UK)
- CRITICAL: Exclusion of liability for death or personal injury (void under UCTA)
- CRITICAL: Processing UK personal data without ICO registration (if required) or lawful basis
- CRITICAL: Cross-border transfer without UK adequacy decision or UK SCCs
- WARNING: Exclusion clause that may fail UCTA "reasonableness" test
- WARNING: No DPA where personal data is processed
`,

  // ── GERMANY ──────────────────────────────────────────────────────────────────
  DE: `
## JURISDICTION: Germany (Deutschland)

### Governing law framework
- BGB (Bürgerliches Gesetzbuch) — civil law, contracts
- HGB (Handelsgesetzbuch) — commercial law
- GDPR + BDSG (Bundesdatenschutzgesetz) — data protection
- UrhG (Urheberrechtsgesetz) — copyright
- GmbHG / AktG — corporate law
- BetrVG — works council rights (employment)
- AGG (Allgemeines Gleichbehandlungsgesetz) — anti-discrimination

### Standard positions (DE contracts)
- General Terms (AGB): Standard terms subject to §§ 305–310 BGB; surprising clauses void; blanket exclusions of liability often void
- Limitation of liability: Cannot exclude liability for intentional acts or gross negligence causing personal injury; limitations for simple negligence permissible in B2B
- Works council: In companies with 5+ employees, works council (Betriebsrat) has co-determination rights on certain matters
- IP: Authors (Urheber) retain moral rights; only exploitation rights (Nutzungsrechte) can be transferred
- Data protection: BfDI and state DPAs as supervisory authorities; stricter than baseline GDPR in some areas

### Escalation triggers (DE)
- CRITICAL: AGB clause that is surprising under § 305c BGB or excessively disadvantages the other party (§ 307 BGB)
- CRITICAL: Exclusion of liability for intentional acts (void under § 276 BGB)
- CRITICAL: IP full assignment clause — under German law only exploitation rights transfer, not authorship
- WARNING: Missing works council consultation clause for employment-affecting contracts
- WARNING: Data processing without written DPA per GDPR Art. 28
`,

  // ── LATIN AMERICA ─────────────────────────────────────────────────────────────
  LATAM: `
## JURISDICTION: Latin America (México, Argentina, Colombia, Chile, Brasil)

### Open legal sources (free, no registration)
- México: dof.gob.mx (Diario Oficial de la Federación) — official laws and regulations
- Argentina: infoleg.gob.ar — official consolidated legislation, free access
- Colombia: suin-juriscol.gov.co — official legal database, free access
- Chile: bcn.cl/leychile — Biblioteca del Congreso Nacional, free access
- Brasil: planalto.gov.br — official federal legislation, free access
- Regional: OAS (oas.org/juridico) — inter-American legal instruments

### Governing law framework by country

**México:**
- Código Civil Federal — contracts and civil obligations
- Ley Federal del Trabajo — employment
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) — data protection
- Código de Comercio — commercial transactions

**Argentina:**
- Código Civil y Comercial de la Nación (CCyCN, 2015) — unified civil and commercial code
- Ley de Contrato de Trabajo (LCT) — employment
- Ley 25.326 de Protección de Datos Personales — data protection (GDPR-aligned update pending)
- Ley 24.240 de Defensa del Consumidor — consumer protection

**Colombia:**
- Código Civil — civil obligations
- Código de Comercio — commercial contracts
- Código Sustantivo del Trabajo — employment
- Ley 1581/2012 de Protección de Datos Personales — data protection

**Chile:**
- Código Civil — contracts
- Código del Trabajo — employment
- Ley 19.628 de Protección de la Vida Privada (new data law pending as of 2024)
- Ley 19.496 de Protección al Consumidor

**Brasil:**
- Código Civil (Lei 10.406/2002)
- Consolidação das Leis do Trabalho (CLT) — employment
- Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) — data protection, GDPR-aligned
- Código de Defesa do Consumidor (CDC)

### Standard positions (LATAM contracts)
- Governing law: specify country explicitly; choice of foreign law permitted in international contracts in most jurisdictions
- Data protection: LGPD (Brasil) and LFPDPPP (México) most developed; all countries require consent for personal data processing
- Employment: labour codes are mandatory minimum standards; cannot be contracted away
- Arbitration: recognized in all major LATAM jurisdictions; CIADI/ICSID for investment disputes
- IP: Andean Community Decision 486 applies to CO, PE, EC, BO; national laws elsewhere
- Consumer protection: mandatory rules apply to B2C contracts regardless of choice of law

### Escalation triggers (LATAM)
- CRITICAL: Employment contract below statutory minimums of applicable labour code
- CRITICAL: Personal data processing without consent mechanism (all jurisdictions)
- CRITICAL: Brasil: cross-border data transfer without LGPD-compliant basis
- CRITICAL: No governing law clause — creates uncertainty across 5+ possible legal systems
- WARNING: Arbitration clause without specifying seat and applicable rules
- WARNING: IP assignment without specifying territory and applicable national law
- WARNING: Consumer contract attempting to waive statutory consumer protection rights
`,

  // ── KAZAKHSTAN ────────────────────────────────────────────────────────────────
  KZ: `
## JURISDICTION: Kazakhstan (Казахстан)

### Governing law framework
- Civil Code of the Republic of Kazakhstan — primary contracts law
- Labour Code of RK — employment
- Law on Personal Data and Its Protection (2013, amended) — data protection
- Law on Information Security — cybersecurity obligations
- AIFC (Astana International Financial Centre) — English common law-based financial jurisdiction

### Standard positions (KZ contracts)
- Governing law: RK Civil Code applies to contracts between RK residents; foreign law permitted for international contracts
- Data localization: Personal data of KZ citizens must be stored in Kazakhstan
- IP: Author's rights under RK IP law; assignment requires written agreement
- Arbitration: KAC (Kazakhstan Arbitration Centre) or AIFC Court common

### Escalation triggers (KZ)
- CRITICAL: Personal data of KZ citizens stored outside Kazakhstan without exemption
- CRITICAL: Labour contract deviating from mandatory Labour Code protections
- WARNING: No governing law clause in cross-border contract
- WARNING: IP clause without specifying territory and exclusivity
`,

  // ── CHINA ─────────────────────────────────────────────────────────────────────
  CN: `
## JURISDICTION: China (中国)

### Governing law framework
- Civil Code of the PRC (2021) — contracts, civil rights
- Company Law — corporate governance
- Personal Information Protection Law (PIPL, 2021) — personal data
- Data Security Law (2021) — data classification and security
- Cybersecurity Law (2017) — network operators
- Labour Law + Labour Contract Law — employment
- Patent Law, Trademark Law, Copyright Law — IP

### Standard positions (CN contracts)
- Data localization: Critical data and personal information of Chinese citizens — local storage required; cross-border transfer requires security assessment or standard contract filing
- IP: Technology transfer contracts must be filed; trade secret protection under Anti-Unfair Competition Law
- Employment: Labour Contract Law mandatory; fixed-term contracts with limits on consecutive terms
- Dispute resolution: CIETAC arbitration common for international contracts; mainland courts for domestic

### Escalation triggers (CN)
- CRITICAL: Cross-border personal data transfer without PIPL-compliant mechanism (security assessment / standard contract / certification)
- CRITICAL: Technology transfer without required government filing
- CRITICAL: Employment contract deviating from Labour Contract Law mandatory terms
- WARNING: Governing law clause choosing foreign law for contracts touching regulated sectors
- WARNING: IP assignment without specifying transfer of specific rights under Chinese IP law
`,
};
