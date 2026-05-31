export const LANGS = {
  en: { name: "English", flag: "🇬🇧" },
  ru: { name: "Русский", flag: "🇷🇺" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
};

export const JURISDICTIONS = [
  { code: "RU",    flag: "🇷🇺", label: "Россия",          laws: "ГК РФ, ТК РФ, ФЗ" },
  { code: "EU",    flag: "🇪🇺", label: "European Union",  laws: "GDPR, EU Directives" },
  { code: "US",    flag: "🇺🇸", label: "United States",   laws: "UCC, Federal Law" },
  { code: "UK",    flag: "🇬🇧", label: "United Kingdom",  laws: "Common Law, UK Acts" },
  { code: "DE",    flag: "🇩🇪", label: "Deutschland",     laws: "BGB, HGB" },
  { code: "KZ",    flag: "🇰🇿", label: "Казахстан",       laws: "ГК РК, НПА РК" },
  { code: "LATAM", flag: "🌎", label: "América Latina",  laws: "MX, AR, CO, CL, BR" },
];

export const PROCEDURAL_DOC_TYPES = {
  en: ["Statement of Claim", "Defense / Response", "Appeal", "Cassation Appeal", "Motion / Petition", "Court Decision / Order", "Other"],
  ru: ["Исковое заявление", "Возражение на иск / Отзыв", "Апелляционная жалоба", "Кассационная жалоба", "Ходатайство", "Судебное решение / Определение", "Другое"],
  de: ["Klageschrift", "Klageerwiderung", "Berufung", "Revision", "Antrag", "Urteil / Beschluss", "Sonstiges"],
  fr: ["Assignation", "Conclusions en défense", "Appel", "Pourvoi en cassation", "Requête", "Jugement / Ordonnance", "Autre"],
  es: ["Demanda", "Contestación a la demanda", "Recurso de apelación", "Recurso de casación", "Solicitud / Escrito", "Sentencia / Auto", "Otro"],
};

export const DOC_TYPES = {
  en: ["Contract / Agreement", "NDA", "Employment Agreement", "Lease Agreement", "Power of Attorney", "Terms & Conditions", "Privacy Policy", "Investment Agreement", "Other"],
  ru: ["Договор / Соглашение", "NDA / Соглашение о конфиденциальности", "Трудовой договор", "Договор аренды", "Доверенность", "Пользовательское соглашение", "Политика конфиденциальности", "Инвестиционное соглашение", "Другое"],
  de: ["Vertrag / Vereinbarung", "Geheimhaltungsvereinbarung", "Arbeitsvertrag", "Mietvertrag", "Vollmacht", "AGB", "Datenschutzerklärung", "Investitionsvertrag", "Sonstiges"],
  fr: ["Contrat / Accord", "NDA", "Contrat de travail", "Bail", "Procuration", "CGU", "Politique de confidentialité", "Accord d'investissement", "Autre"],
  es: ["Contrato / Acuerdo", "NDA / Acuerdo de Confidencialidad", "Contrato Laboral", "Contrato de Arrendamiento", "Poder Notarial", "Términos y Condiciones", "Política de Privacidad", "Acuerdo de Inversión", "Otro"],
};
