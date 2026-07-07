# Patient document OCR service

This local service accepts a PDF, PNG, JPG, or WebP patient document, extracts printed English text with Tesseract OCR, and maps recognized labels to the Patient Details schema. It does not send documents to an external AI provider and requires no API key.

1. Copy `.env.example` to `.env` if you need to change the allowed frontend origin.
2. Run `npm install` and `npm run dev` inside this folder.
3. Keep the main Next app running alongside this OCR service.

PDFs are rendered locally before OCR and are limited to 10 pages. Uploaded files stay in memory for the request and are not written to disk. Tesseract is designed primarily for printed text; handwritten documents may have lower accuracy and must be reviewed before saving.
