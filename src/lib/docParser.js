import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import * as XLSX from 'xlsx';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const OCR_WARNING = `\n\n> **⚠️ AI OCR Note:** This text was extracted using an in-browser AI OCR engine. It may contain typos or slight inaccuracies.`;

export const parseDocumentToMarkdown = async (file, setProgress) => {
  const extension = file.name.split('.').pop().toLowerCase();
  if (setProgress) setProgress({ text: `Initializing parser for ${extension}...`, percent: 10 });
  
  try {
    if (extension === 'pdf') {
      return await parsePDF(file, setProgress);
    } else if (['docx'].includes(extension)) {
      return await parseDOCX(file, setProgress);
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return await parseExcel(file, setProgress);
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
      return await parseImageOCR(file, setProgress);
    } else if (['txt', 'md', 'json', 'rtf'].includes(extension)) {
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
  if (setProgress) setProgress({ text: 'Loading PDF document...', percent: 15 });
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  let scannedPagesCount = 0;
  let ocrImages = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    if (setProgress) setProgress({ text: `Parsing page ${i} of ${pdf.numPages}...`, percent: 15 + (60 * (i/pdf.numPages)) });
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    
    // Check if page is purely scanned image
    if (pageText.trim().length < 40) {
      scannedPagesCount++;
      if (!isMobileDevice()) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        ocrImages.push(canvas.toDataURL('image/png'));
      }
    } else {
      fullText += `\n\n## Page ${i}\n\n` + pageText;
    }
  }
  
  if (scannedPagesCount > 0) {
    if (isMobileDevice()) {
      fullText += `\n\n> 📱 **Mobile Notice:** ${scannedPagesCount} scanned image page(s) were detected. In-browser AI OCR for scanned images requires high memory and is disabled on mobile devices. For scanned image OCR, please open LittleTools on a desktop browser.`;
    } else if (ocrImages.length > 0) {
      try {
        if (setProgress) setProgress({ text: `Running desktop AI OCR on ${ocrImages.length} scanned pages...`, percent: 75 });
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        for (let i = 0; i < ocrImages.length; i++) {
          const { data: { text } } = await worker.recognize(ocrImages[i]);
          fullText += `\n\n## Scanned Page ${i+1}\n\n` + text;
        }
        await worker.terminate();
        fullText += OCR_WARNING;
      } catch (e) {
        console.warn("Desktop OCR fallback error:", e);
      }
    }
  }
  
  if (setProgress) setProgress({ text: 'Finalizing formatting...', percent: 95 });
  const cleanedText = fullText.replace(/\n{3,}/g, '\n\n').trim() || `> Document contains no readable text content.`;
  
  if (setProgress) setProgress({ text: 'Done', percent: 100 });
  return cleanedText;
};

const parseImageOCR = async (file, setProgress) => {
  if (isMobileDevice()) {
    if (setProgress) setProgress({ text: 'Done', percent: 100 });
    return `# Image: ${file.name}\n\n> 📱 **Notice:** High-precision AI Image OCR (Optical Character Recognition) requires heavy desktop RAM and is disabled on mobile browsers to prevent phone memory crashes.\n>\n> 💡 **Tip:** To extract text from images and scanned papers, please open **LittleTools.me** on your laptop or desktop computer.\n>\n> Standard **PDF, Word (.docx), Excel (.xlsx), CSV, and Text** conversions work at 100% full speed on your phone!`;
  }
  
  if (setProgress) setProgress({ text: 'Loading image for desktop OCR...', percent: 20 });
  const imageUrl = URL.createObjectURL(file);
  
  try {
    if (setProgress) setProgress({ text: 'Initializing AI OCR Engine...', percent: 40 });
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    
    if (setProgress) setProgress({ text: 'Extracting text...', percent: 70 });
    const { data: { text } } = await worker.recognize(imageUrl);
    
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    
    if (setProgress) setProgress({ text: 'Done', percent: 100 });
    return text.trim() + OCR_WARNING;
  } catch (err) {
    URL.revokeObjectURL(imageUrl);
    throw new Error(`OCR Processing Failed: ${err.message}`);
  }
};
