import { useState } from "react";
import { createPortal } from "react-dom";

const TEXTS = {
  ru: {
    title: "Прежде чем начать",
    subtitle: "Прочитайте внимательно перед загрузкой документов",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "Документы передаются в AI", body: "Текст вашего документа отправляется на серверы Anthropic (США) для анализа моделью Claude. Anthropic не использует данные из API для обучения своих моделей согласно их политике конфиденциальности." },
      { icon: "ti-database-off", color: "#639922", heading: "Мы не храним ваши документы", body: "LexAI не сохраняет содержимое ваших документов ни в какой базе данных. Документ используется только для генерации анализа и немедленно удаляется из памяти после получения ответа." },
      { icon: "ti-lock", color: "#EF9F27", heading: "Передача данных", body: "Документ передаётся на серверы Anthropic по зашифрованному соединению HTTPS. API-ключ никогда не передаётся на ваше устройство и хранится только на нашем сервере." },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "Не загружайте сверхконфиденциальное", body: "Не загружайте документы, содержащие государственную тайну, персональные данные третьих лиц без их согласия, или информацию, раскрытие которой запрещено законом или NDA." },
    ],
    anthropicPolicy: "Политика конфиденциальности Anthropic",
    checkboxes: [
      "Я понимаю, что текст моего документа будет передан на серверы Anthropic для анализа",
      "Я подтверждаю, что имею право использовать данный документ и передавать его третьим лицам для обработки",
      "Я ознакомился с политикой конфиденциальности и соглашаюсь с условиями использования",
    ],
    proceed: "Принять и продолжить",
    decline: "Отказаться",
    disclaimer: "LexAI не является юридической фирмой. Анализ носит информационный характер и не является юридической консультацией.",
  },
  en: {
    title: "Before you begin",
    subtitle: "Please read carefully before uploading documents",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "Documents are sent to AI", body: "Your document text is sent to Anthropic's servers (US) for analysis by the Claude model. Anthropic does not use API data to train its models per their privacy policy." },
      { icon: "ti-database-off", color: "#639922", heading: "We do not store your documents", body: "LexAI does not save the contents of your documents in any database. The document is used only to generate the analysis and is immediately discarded after the response is received." },
      { icon: "ti-lock", color: "#EF9F27", heading: "Data transmission", body: "Your document is transmitted to Anthropic's servers over an encrypted HTTPS connection. The API key is never sent to your device and is stored only on our server." },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "Do not upload highly sensitive content", body: "Do not upload documents containing state secrets, personal data of third parties without their consent, or information whose disclosure is prohibited by law or NDA." },
    ],
    anthropicPolicy: "Anthropic Privacy Policy",
    checkboxes: [
      "I understand that my document text will be sent to Anthropic's servers for analysis",
      "I confirm that I have the right to use this document and share it with third parties for processing",
      "I have read the privacy policy and agree to the terms of use",
    ],
    proceed: "Accept and continue",
    decline: "Decline",
    disclaimer: "LexAI is not a law firm. Analysis is for informational purposes only and does not constitute legal advice.",
  },
  de: {
    title: "Bevor Sie beginnen",
    subtitle: "Bitte lesen Sie dies sorgfältig, bevor Sie Dokumente hochladen",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "Dokumente werden an KI übertragen", body: "Ihr Dokumenttext wird zur Analyse durch das Claude-Modell an Anthropics Server (USA) gesendet. Anthropic verwendet API-Daten gemäß ihrer Datenschutzrichtlinie nicht zum Training ihrer Modelle." },
      { icon: "ti-database-off", color: "#639922", heading: "Wir speichern Ihre Dokumente nicht", body: "LexAI speichert den Inhalt Ihrer Dokumente in keiner Datenbank. Das Dokument wird nur zur Erstellung der Analyse verwendet und nach Erhalt der Antwort sofort aus dem Speicher gelöscht." },
      { icon: "ti-lock", color: "#EF9F27", heading: "Datenübertragung", body: "Ihr Dokument wird über eine verschlüsselte HTTPS-Verbindung an Anthropics Server übertragen. Der API-Schlüssel wird niemals an Ihr Gerät übermittelt und wird nur auf unserem Server gespeichert." },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "Keine streng vertraulichen Inhalte hochladen", body: "Laden Sie keine Dokumente hoch, die Staatsgeheimnisse, personenbezogene Daten Dritter ohne deren Zustimmung oder Informationen enthalten, deren Offenlegung gesetzlich oder durch NDA verboten ist." },
    ],
    anthropicPolicy: "Anthropic Datenschutzrichtlinie",
    checkboxes: [
      "Ich verstehe, dass mein Dokumenttext zur Analyse an Anthropics Server gesendet wird",
      "Ich bestätige, dass ich das Recht habe, dieses Dokument zu verwenden und es zur Verarbeitung an Dritte weiterzugeben",
      "Ich habe die Datenschutzrichtlinie gelesen und stimme den Nutzungsbedingungen zu",
    ],
    proceed: "Akzeptieren und fortfahren",
    decline: "Ablehnen",
    disclaimer: "LexAI ist keine Anwaltskanzlei. Die Analyse dient nur zu Informationszwecken und stellt keine Rechtsberatung dar.",
  },
  fr: {
    title: "Avant de commencer",
    subtitle: "Veuillez lire attentivement avant de télécharger des documents",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "Les documents sont transmis à l'IA", body: "Le texte de votre document est envoyé aux serveurs d'Anthropic (États-Unis) pour analyse par le modèle Claude. Anthropic n'utilise pas les données API pour entraîner ses modèles conformément à sa politique de confidentialité." },
      { icon: "ti-database-off", color: "#639922", heading: "Nous ne stockons pas vos documents", body: "LexAI ne sauvegarde pas le contenu de vos documents dans aucune base de données. Le document n'est utilisé que pour générer l'analyse et est immédiatement supprimé après réception de la réponse." },
      { icon: "ti-lock", color: "#EF9F27", heading: "Transmission des données", body: "Votre document est transmis aux serveurs d'Anthropic via une connexion HTTPS chiffrée. La clé API n'est jamais envoyée à votre appareil et est stockée uniquement sur notre serveur." },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "Ne téléchargez pas de contenu hautement confidentiel", body: "Ne téléchargez pas de documents contenant des secrets d'État, des données personnelles de tiers sans leur consentement, ou des informations dont la divulgation est interdite par la loi ou un NDA." },
    ],
    anthropicPolicy: "Politique de confidentialité d'Anthropic",
    checkboxes: [
      "Je comprends que le texte de mon document sera envoyé aux serveurs d'Anthropic pour analyse",
      "Je confirme que j'ai le droit d'utiliser ce document et de le partager avec des tiers pour traitement",
      "J'ai lu la politique de confidentialité et j'accepte les conditions d'utilisation",
    ],
    proceed: "Accepter et continuer",
    decline: "Refuser",
    disclaimer: "LexAI n'est pas un cabinet juridique. L'analyse est fournie à titre informatif uniquement et ne constitue pas un conseil juridique.",
  },
  zh: {
    title: "开始之前",
    subtitle: "上传文件前请仔细阅读",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "文件将发送至AI处理", body: "您的文件文本将发送至Anthropic（美国）的服务器，由Claude模型进行分析。根据其隐私政策，Anthropic不会使用API数据训练其模型。" },
      { icon: "ti-database-off", color: "#639922", heading: "我们不存储您的文件", body: "LexAI不会将您的文件内容保存在任何数据库中。文件仅用于生成分析报告，收到响应后立即从内存中删除。" },
      { icon: "ti-lock", color: "#EF9F27", heading: "数据传输", body: "您的文件通过加密的HTTPS连接传输至Anthropic服务器。API密钥永远不会发送至您的设备，仅存储在我们的服务器上。" },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "请勿上传高度机密内容", body: "请勿上传包含国家机密、未经当事人同意的第三方个人数据，或法律或保密协议禁止披露的信息的文件。" },
    ],
    anthropicPolicy: "Anthropic隐私政策",
    checkboxes: [
      "我了解我的文件文本将发送至Anthropic服务器进行分析",
      "我确认我有权使用本文件并将其提供给第三方处理",
      "我已阅读隐私政策并同意使用条款",
    ],
    proceed: "接受并继续",
    decline: "拒绝",
    disclaimer: "LexAI不是律师事务所。分析仅供参考，不构成法律建议。",
  },
  es: {
    title: "Antes de comenzar",
    subtitle: "Por favor, lea atentamente antes de cargar documentos",
    blocks: [
      { icon: "ti-cloud-upload", color: "#378ADD", heading: "Los documentos se envían a la IA", body: "El texto de su documento se envía a los servidores de Anthropic (EE.UU.) para su análisis por el modelo Claude. Anthropic no utiliza los datos de la API para entrenar sus modelos según su política de privacidad." },
      { icon: "ti-database-off", color: "#639922", heading: "No almacenamos sus documentos", body: "LexAI no guarda el contenido de sus documentos en ninguna base de datos. El documento solo se utiliza para generar el análisis y se elimina inmediatamente de la memoria tras recibir la respuesta." },
      { icon: "ti-lock", color: "#EF9F27", heading: "Transmisión de datos", body: "Su documento se transmite a los servidores de Anthropic mediante una conexión HTTPS cifrada. La clave API nunca se envía a su dispositivo y se almacena únicamente en nuestro servidor." },
      { icon: "ti-alert-triangle", color: "#E24B4A", heading: "No cargue contenido altamente confidencial", body: "No cargue documentos que contengan secretos de Estado, datos personales de terceros sin su consentimiento, o información cuya divulgación esté prohibida por ley o NDA." },
    ],
    anthropicPolicy: "Política de Privacidad de Anthropic",
    checkboxes: [
      "Entiendo que el texto de mi documento será enviado a los servidores de Anthropic para su análisis",
      "Confirmo que tengo derecho a utilizar este documento y compartirlo con terceros para su procesamiento",
      "He leído la política de privacidad y acepto los términos de uso",
    ],
    proceed: "Aceptar y continuar",
    decline: "Rechazar",
    disclaimer: "LexAI no es un despacho de abogados. El análisis es solo informativo y no constituye asesoramiento jurídico.",
  },
};

export default function ConsentModal({ lang, onAccept, onDecline }) {
  const tx = TEXTS[lang] || TEXTS.en;
  const [checks, setChecks] = useState([false, false, false]);
  const allChecked = checks.every(Boolean);

  const toggle = i => setChecks(c => c.map((v, j) => j === i ? !v : v));

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900, padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", border: "0.5px solid #ddd" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <i className="ti ti-shield-lock" style={{ fontSize: 22, color: "#378ADD" }} aria-hidden="true" />
          <span style={{ fontSize: 18, fontWeight: 500 }}>{tx.title}</span>
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: "1.25rem" }}>{tx.subtitle}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.25rem" }}>
          {tx.blocks.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 10, border: "0.5px solid #e8e8e5", background: "#fafaf8", alignItems: "flex-start" }}>
              <i className={`ti ${b.icon}`} style={{ fontSize: 18, color: b.color, marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{b.heading}</div>
                <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{b.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#888", marginBottom: "1.25rem" }}>
          <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={{ color: "#378ADD" }}>
            <i className="ti ti-external-link" style={{ fontSize: 12, marginRight: 4 }} aria-hidden="true" />
            {tx.anthropicPolicy}
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: "1.5rem" }}>
          {tx.checkboxes.map((label, i) => (
            <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", fontSize: 13 }}>
              <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: "pointer" }} />
              <span style={{ lineHeight: 1.5, color: checks[i] ? "#1a1a18" : "#666" }}>{label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: "10px", fontSize: 14, borderRadius: 8, border: "0.5px solid #ccc", background: "#fff", cursor: "pointer" }}>
            {tx.decline}
          </button>
          <button
            onClick={onAccept}
            disabled={!allChecked}
            style={{ flex: 2, padding: "10px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "0.5px solid #378ADD", background: allChecked ? "#378ADD" : "#ccc", color: allChecked ? "#fff" : "#888", cursor: allChecked ? "pointer" : "not-allowed", transition: "background 0.2s" }}
          >
            {tx.proceed}
          </button>
        </div>

        <div style={{ fontSize: 11, color: "#aaa", marginTop: "1rem", textAlign: "center", lineHeight: 1.6 }}>
          {tx.disclaimer}
        </div>
      </div>
    </div>,
    document.body
  );
}
