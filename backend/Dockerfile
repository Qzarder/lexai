FROM python:3.12-slim

# antiword: legacy .doc text extraction
# tesseract-ocr (+ lang packs): OCR for images and scanned PDFs in all declared languages
# poppler-utils: pdf2image rasterizes scanned PDFs before OCR
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        antiword \
        tesseract-ocr \
        tesseract-ocr-rus \
        tesseract-ocr-deu \
        tesseract-ocr-fra \
        tesseract-ocr-spa \
        poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
