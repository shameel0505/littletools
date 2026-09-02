import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const OCR_WARNING = `\n\n> **⚠️ AI OCR Note:** This text was extracted using an in-browser AI OCR engine (English & Arabic support). It may contain typos, formatting errors, or slight inaccuracies. Please instruct your LLM to account for potential OCR mistakes.`;

export const parseDocumentToMarkdown = async (file, setProgress) => {
  const extension = file.name.split('.').pop().toLowerCase();
  if (setProgress) setProgress({ text: `Initializing parser for ${extension}...`, percent: 5 });
  
  try {
    if (extension === 'pdf') {
      return await parsePDF(file, setProgress);
    } else if (['docx'].includes(extension)) {
      return await parseDOCX(file, setProgress);
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return await parseExcel(file, setProgress);
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
      return await parseImageOCR(file, setProgress);
    } else if (['txt', 'md', 'json'].includes(extension)) {
      return await parseTextFile(file, setProgress);
    } else {
      throw new Error(`Unsupported file type: .${extension}`);
    }
  } catch (error) {
    console.error("Parsing error:", error);
    throw error;
  }
};

const parseTextFile = async (file, setProgress) => {
  if (setProgress) setProgress({ text: 'Reading text file...', percent: 50 });
  const text = await file.text();
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return text;
};

const parseExcel = async (file, setProgress) => {
  if (setProgress) setProgress({ text: 'Reading spreadsheet...', percent: 30 });
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  let markdown = '';
  
  workbook.SheetNames.forEach((sheetName, index) => {
    if (setProgress) setProgress({ text: `Parsing sheet ${index + 1}/${workbook.SheetNames.length}`, percent: 50 + (40 * (index/workbook.SheetNames.length)) });
    const worksheet = workbook.Sheets[sheetName];
    // Convert to CSV, then to Markdown Table
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    markdown += `## Sheet: ${sheetName}\n\n`;
    markdown += convertCSVToMarkdownTable(csv) + '\n\n';
  });
  
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return markdown;
};

const convertCSVToMarkdownTable = (csvStr) => {
  if (!csvStr.trim()) return '';
  const rows = csvStr.split('\n').filter(row => row.trim());
  if (rows.length === 0) return '';
  
  let md = '';
  rows.forEach((row, index) => {
    const cols = row.split(',').map(c => c.trim().replace(/\n/g, ' '));
    md += '| ' + cols.join(' | ') + ' |\n';
    if (index === 0) {
      // Add header separator
      md += '|' + cols.map(() => '---').join('|') + '|\n';
    }
  });
  return md;
};

const parseDOCX = async (file, setProgress) => {
  if (setProgress) setProgress({ text: 'Reading DOCX file...', percent: 30 });
  const arrayBuffer = await file.arrayBuffer();
  
  if (setProgress) setProgress({ text: 'Converting DOCX to HTML...', percent: 60 });
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  
  if (setProgress) setProgress({ text: 'Converting HTML to Markdown...', percent: 80 });
  const turndownService = new TurndownService({ headingStyle: 'atx' });
  const markdown = turndownService.turndown(html);
  
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return markdown;
};

const parsePDF = async (file, setProgress) => {
  if (setProgress) setProgress({ text: 'Loading PDF document...', percent: 10 });
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  let requiresOCR = false;
  let ocrImages = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    if (setProgress) setProgress({ text: `Analyzing page ${i} of ${pdf.numPages}...`, percent: 10 + (20 * (i/pdf.numPages)) });
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    
    // Heuristic: If there is very little text (e.g. less than 50 chars), it might be a scanned PDF
    if (pageText.trim().length < 50) {
      requiresOCR = true;
      // Render page to canvas to prepare for OCR
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      ocrImages.push(canvas.toDataURL('image/png'));
    } else {
      fullText += `\n\n## Page ${i}\n\n` + pageText;
    }
  }
  
  if (requiresOCR && ocrImages.length > 0) {
    if (setProgress) setProgress({ text: 'Scanned pages detected. Initializing AI OCR Engine (Eng & Arabic)...', percent: 40 });
    
    // Initialize Tesseract for English and Arabic
    const worker = await createWorker('eng+ara');
    
    for (let i = 0; i < ocrImages.length; i++) {
      if (setProgress) setProgress({ text: `Running AI OCR on scanned page ${i+1}/${ocrImages.length}... This may take a moment.`, percent: 40 + (50 * ((i+1)/ocrImages.length)) });
      const { data: { text } } = await worker.recognize(ocrImages[i]);
      fullText += `\n\n## Scanned Page ${i+1}\n\n` + text;
    }
    await worker.terminate();
    fullText += OCR_WARNING;
  }
  
  if (setProgress) setProgress({ text: 'Finalizing formatting...', percent: 95 });
  // Clean up excessive newlines
  const cleanedText = fullText.replace(/\n{3,}/g, '\n\n').trim();
  
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return cleanedText;
};

const parseImageOCR = async (file, setProgress) => {
  if (setProgress) setProgress({ text: 'Loading image...', percent: 10 });
  const imageUrl = URL.createObjectURL(file);
  
  if (setProgress) setProgress({ text: 'Initializing AI OCR Engine (Eng & Arabic)...', percent: 30 });
  const worker = await createWorker('eng+ara');
  
  if (setProgress) setProgress({ text: 'Extracting text... This may take a moment.', percent: 60 });
  const { data: { text } } = await worker.recognize(imageUrl);
  
  await worker.terminate();
  URL.revokeObjectURL(imageUrl);
  
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return text + OCR_WARNING;
};
