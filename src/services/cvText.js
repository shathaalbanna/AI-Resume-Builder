import { UserError } from "../utils/helpers";

async function pdfText(file) {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => it.str + (it.hasEOL ? "\n" : " ")).join(""));
  }
  return pages.join("\n");
}

async function docxText(file) {
  const mammoth = await import("mammoth");
  const lib = mammoth.default ?? mammoth;
  const result = await lib.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

export async function extractCvText(file) {
  const name = file.name.toLowerCase();
  let text;
  try {
    if (name.endsWith(".pdf")) text = await pdfText(file);
    else if (name.endsWith(".docx")) text = await docxText(file);
    else {
      throw new UserError("ملفات DOC القديمة غير مدعومة للتحليل المحلي. احفظ الملف بصيغة DOCX أو PDF.");
    }
  } catch (e) {
    if (e instanceof UserError) throw e;
    throw new UserError("تعذّر قراءة الملف. تأكد أنه غير تالف وغير محمي بكلمة مرور.");
  }
  text = text.replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  if (text.length < 50) {
    throw new UserError("لم أجد نصاً كافياً في الملف. قد يكون صورة ممسوحة (scan) بدون نص.");
  }
  return text;
}
