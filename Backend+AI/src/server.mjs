import "dotenv/config";
import { createCanvas } from "@napi-rs/canvas";
import cors from "cors";
import express from "express";
import multer from "multer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createWorker } from "tesseract.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const accepted = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    callback(accepted.includes(file.mimetype) ? null : new Error("Upload a PDF, PNG, JPG, or WebP document."), accepted.includes(file.mimetype));
  },
});

const configuredOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin || configuredOrigins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const isPrivateLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(url.hostname);
    return url.protocol === "http:" && (isLocalHost || isPrivateLan);
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    const allowed = isAllowedOrigin(origin);
    callback(allowed ? null : new Error("This browser origin is not allowed to use the patient document API."), allowed);
  },
}));

function normalise(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function labelAliases(label) {
  const withoutHint = label.replace(/\([^)]*\)/g, "").trim();
  const aliases = new Set([label, withoutHint]);
  withoutHint.split(/\s*\/\s*/).forEach((part) => part.length >= 3 && aliases.add(part));
  const common = {
    "MRN / Patient ID": ["MRN", "Patient ID"],
    UHID: ["UHID", "UHID No"],
    "Contact Number": ["Mobile", "Mobile Number", "Phone", "Phone Number"],
    "Date of Birth": ["DOB", "Date of Birth"],
    "PIN Code": ["PIN", "Pincode", "Postal Code"],
  };
  (common[label] || []).forEach((alias) => aliases.add(alias));
  return [...aliases].filter(Boolean).sort((a, b) => b.length - a.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sameLineValue(line, alias) {
  const flexibleLabel = escapeRegExp(alias).replace(/\\\s+/g, "\\s+");
  const match = line.match(new RegExp(`^\\s*(?:${flexibleLabel})\\s*(?::|=|-|–)?\\s*(.+?)\\s*$`, "i"));
  if (match?.[1] && normalise(match[1]) !== normalise(alias)) return match[1].replace(/^[|:;=\-–]+/, "").trim();
  return line.match(/[:=]\s*(.+)$/)?.[1]?.trim() || "";
}

function isAnotherLabel(line, schema) {
  const lineNormal = normalise(line);
  return schema.some((section) => section.fields.some((field) => labelAliases(field).some((alias) => {
    const aliasNormal = normalise(alias);
    return lineNormal === aliasNormal || lineNormal.startsWith(`${aliasNormal} `);
  })));
}

function knownFieldValue(label, text) {
  const addressRow = text.match(/ADDRESS[^\n]*\n\s*(.+?)\s+([A-Za-z.'-]+)\s*\/\s*([A-Za-z .'-]+)\s*\/\s*(\d{6})\b/i);
  if (addressRow) {
    if (label === "Address") return addressRow[1].trim();
    if (label === "City") return addressRow[2].trim();
    if (label === "State") return addressRow[3].trim();
    if (label === "PIN Code") return addressRow[4].trim();
  }
  const patterns = {
    "MRN / Patient ID": /\b(MRN-[A-Z0-9-]+)\b/i,
    UHID: /\b(UHID-[A-Z0-9-]+)\b/i,
    "Patient Name": /PATIENT NAME[^\n]*\n\s*([A-Z][A-Za-z.' -]+?)\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/i,
    "Date of Birth": /PATIENT NAME[^\n]*\n[^\n]*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    Age: /\b(\d{1,3})\s*years?\b/i,
    Gender: /\b(Male|Female|Other)\b/i,
    "Blood Group": /BLOOD GROUP[^\n]*\n\s*((?:A|B|AB|O)[+-])/i,
    "Blood Group (Reconfirm)": /BLOOD GROUP \(RECONFIRM\)[^\n]*\n\s*((?:A|B|AB|O)[+-])/i,
    Height: /\b(\d{2,3}(?:\.\d+)?)\s*cm\b/i,
    Weight: /\b(\d{1,3}(?:\.\d+)?)\s*kg\b/i,
    "Contact Number": /\b([6-9]\d{9})\b/,
    "Email ID": /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i,
    "PIN Code": /PIN CODE[^\n]*\n[^\n]*?\b(\d{6})\b/i,
  };
  const match = text.match(patterns[label]);
  return match?.[1]?.trim() || "";
}

function extractFields(text, schema) {
  const lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  return schema.flatMap((section) => {
    const fields = section.fields.flatMap((label) => {
      const knownValue = knownFieldValue(label, text);
      if (knownValue) return [{ label, value: knownValue }];
      const aliases = labelAliases(label);
      for (let index = 0; index < lines.length; index += 1) {
        const lineNormal = normalise(lines[index]);
        const alias = aliases.find((candidate) => {
          const candidateNormal = normalise(candidate);
          return lineNormal === candidateNormal || lineNormal.startsWith(`${candidateNormal} `);
        });
        if (!alias) continue;
        let value = sameLineValue(lines[index], alias);
        if (value && isAnotherLabel(value, schema)) value = "";
        if (!value && lineNormal === normalise(alias)) {
          const next = lines[index + 1];
          if (next && !isAnotherLabel(next, schema)) value = next;
        }
        value = value.replace(/^[☐☑✓✔•|]+/, "").trim();
        if (value && normalise(value) !== normalise(label)) return [{ label, value }];
      }
      return [];
    });
    return fields.length ? [{ tabId: section.tabId, tabLabel: section.tabLabel, fields }] : [];
  });
}

async function documentImages(file) {
  if (file.mimetype !== "application/pdf") return [file.buffer];
  const pdf = await getDocument({ data: new Uint8Array(file.buffer), useSystemFonts: true }).promise;
  if (pdf.numPages > 10) throw new Error("PDF documents are limited to 10 pages for OCR.");
  const images = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    images.push(canvas.toBuffer("image/png"));
  }
  return images;
}

async function runOcr(file) {
  const worker = await createWorker("eng");
  try {
    const pages = [];
    for (const image of await documentImages(file)) {
      const result = await worker.recognize(image);
      pages.push(result.data.text);
    }
    return pages.join("\n");
  } finally {
    await worker.terminate();
  }
}

app.get("/health", (_request, response) => response.json({ ok: true, engine: "tesseract" }));

app.post("/api/patient-document/extract", upload.single("document"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: "A document is required." });
    let schema;
    try { schema = JSON.parse(request.body.schema); } catch { return response.status(400).json({ error: "Invalid patient field schema." }); }
    if (!Array.isArray(schema)) return response.status(400).json({ error: "Invalid patient field schema." });
    const text = await runOcr(request.file);
    return response.json({ sections: extractFields(text, schema), engine: "tesseract", characterCount: text.trim().length });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => response.status(400).json({ error: error.message || "Document extraction failed." }));
app.listen(4001, () => console.log("Patient document Tesseract OCR service started on port 4001."));
