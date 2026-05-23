import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist";
import { createWorker } from "tesseract.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SUPPORTED_TYPES = {
  "application/pdf": parsePdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parseDocx,
  "application/msword": parseDocx,
  "text/plain": parseText,
  "text/rtf": parseText,
  "application/rtf": parseText,
};

export const ACCEPT = ".pdf,.docx,.doc,.txt,.rtf";

export const FILE_LABELS = {
  ru: {
    loading:    "Читаем документ...",
    ocr:        "Распознаём текст (OCR)...",
    ocrPage:    (cur, total) => `OCR: страница ${cur} из ${total}...`,
    errorSize:  "Файл слишком большой (макс. 20MB)",
    errorType:  "Формат не поддерживается. Используйте PDF, DOCX, DOC или TXT.",
    errorScan:  "Не удалось распознать текст из PDF.",
  },
  en: {
    loading:    "Reading document...",
    ocr:        "Recognizing text (OCR)...",
    ocrPage:    (cur, total) => `OCR: page ${cur} of ${total}...`,
    errorSize:  "File too large (max 20MB)",
    errorType:  "Unsupported format. Use PDF, DOCX, DOC or TXT.",
    errorScan:  "Could not extract text from PDF.",
  },
};

export async function parseFile(file, { onProgress } = {}) {
  if (file.size > 20 * 1024 * 1024) throw new Error("size");
  const type = file.type || inferType(file.name);
  const parser = SUPPORTED_TYPES[type];
  if (!parser) throw new Error("type");
  return parser(file, { onProgress });
}

function inferType(name) {
  const ext = name.split(".").pop().toLowerCase();
  return {
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc:  "application/msword",
    txt:  "text/plain",
    rtf:  "text/rtf",
  }[ext] || "";
}

function parseText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = e => res(e.target.result);
    r.onerror = () => rej(new Error("read"));
    r.readAsText(file, "utf-8");
  });
}

async function parseDocx(file) {
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  if (!value.trim()) throw new Error("empty");
  return value;
}

async function parsePdf(file, { onProgress } = {}) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const numPages = pdf.numPages;

  // ── 1. Try native text extraction ──────────────────────────────────────────
  const pages = [];
  for (let i = 1; i <= numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(" "));
  }
  const nativeText = pages.join("\n\n").trim();
  if (nativeText.length > 50) return nativeText;   // good text PDF

  // ── 2. Fallback: OCR with Tesseract.js ────────────────────────────────────
  onProgress?.("ocr");

  const worker = await createWorker("rus+eng", 1, {
    workerPath:   "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
    corePath:     "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js",
    langPath:     "https://tessdata.projectnaptha.com/4.0.0",
    logger:       () => {},   // suppress verbose logs
  });

  const ocrPages = [];
  try {
    for (let i = 1; i <= numPages; i++) {
      onProgress?.("ocrPage", i, numPages);

      const page    = await pdf.getPage(i);
      const scale   = 2.0;                          // 2× = better OCR accuracy
      const viewport = page.getViewport({ scale });

      const canvas  = document.createElement("canvas");
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      const ctx     = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport }).promise;

      const { data: { text } } = await worker.recognize(canvas);
      ocrPages.push(text);
    }
  } finally {
    await worker.terminate();
  }

  const ocrText = ocrPages.join("\n\n").trim();
  if (!ocrText) throw new Error("scanned");
  return ocrText;
}
