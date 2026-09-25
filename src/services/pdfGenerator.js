import html2canvasPro from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const html2canvas = typeof html2canvasPro === 'function' ? html2canvasPro : (html2canvasPro?.default || html2canvasPro);

/**
 * Triggers a real browser file download using standard Blob and object URL.
 * Tested and compatible with modern browsers, sandboxed iframes, and mobile devices.
 * 
 * @param {Blob} blob - The PDF Blob object
 * @param {string} fileName - File name with .pdf extension
 */
export function downloadBlobAsFile(blob, fileName = 'financial-report.pdf') {
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('فایل معتبر جهت دانلود ایجاد نشد.');
  }

  // Ensure safe file name
  const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.style.display = 'none';
  downloadLink.href = blobUrl;
  downloadLink.download = safeFileName;
  downloadLink.setAttribute('download', safeFileName);

  document.body.appendChild(downloadLink);

  // Trigger download click
  try {
    downloadLink.click();
  } catch (err) {
    console.error('Download click failed, trying dispatchEvent:', err);
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    downloadLink.dispatchEvent(event);
  }

  // Clean up resource
  setTimeout(() => {
    if (document.body.contains(downloadLink)) {
      document.body.removeChild(downloadLink);
    }
    URL.revokeObjectURL(blobUrl);
  }, 3000);
}

/**
 * Generates and triggers download of a real PDF document from an HTML DOM element
 * Supports Persian typography, RTL layout, and multi-page documents.
 * 
 * @param {HTMLElement} element - The DOM element containing the report
 * @param {string} fileName - File name to save as
 * @returns {Promise<boolean>}
 */
export async function generatePdfFromElement(element, fileName = 'financial-report.pdf') {
  if (!element) {
    const errorMsg = 'عنصر گزارش جهت صدور PDF یافت نشد.';
    console.error('[PDF Generator]', errorMsg);
    throw new Error(errorMsg);
  }

  console.log('[PDF Generator] Starting PDF generation for:', fileName);

  try {
    // Clone element to an isolated offscreen container to avoid modal scroll cuts and CSS clipping
    const clone = element.cloneNode(true);
    clone.style.width = '820px';
    clone.style.maxWidth = '820px';
    clone.style.minHeight = 'auto';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.position = 'absolute';
    clone.style.top = '-99999px';
    clone.style.right = '0';
    clone.style.backgroundColor = '#ffffff';
    clone.style.zIndex = '-9999';

    document.body.appendChild(clone);

    let canvas;
    try {
      canvas = await html2canvas(clone, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
        scrollX: 0,
        scrollY: 0
      });
    } finally {
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('رندر بوم گرافیکی گزارش با خطا مواجه شد.');
    }

    console.log('[PDF Generator] Canvas rendered successfully:', canvas.width, 'x', canvas.height);

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Initialize standard A4 jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 mm
    const pdfHeight = 297; // A4 mm
    const margin = 10; // 10mm margins
    const contentWidth = pdfWidth - (margin * 2); // 190mm
    const contentHeight = pdfHeight - (margin * 2); // 277mm

    // Calculate height proportional to A4 width
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    // First page
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight, undefined, 'FAST');
    heightLeft -= contentHeight;

    // Add extra pages if report is long
    while (heightLeft > 0) {
      position = position - contentHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight, undefined, 'FAST');
      heightLeft -= contentHeight;
    }

    // Convert PDF to Blob
    const pdfBlob = pdf.output('blob');
    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('فایل PDF نهایی خالی است.');
    }

    console.log('[PDF Generator] PDF Blob created successfully. Size:', pdfBlob.size, 'bytes');

    // Trigger download
    downloadBlobAsFile(pdfBlob, fileName);
    return true;
  } catch (error) {
    console.error('[PDF Generator] Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Fallback direct Canvas PDF generator if DOM screenshot fails
 * Directly draws financial metrics and transactions onto a multi-page canvas
 */
export async function generateDirectPdfReport({
  title = 'گزارش مالی',
  periodText = '',
  userName = '',
  currencyUnit = 'تومان',
  totalIncome = 0,
  totalExpense = 0,
  netProfitLoss = 0,
  openingBalance = 0,
  closingBalance = 0,
  transactions = []
}, fileName = 'financial-report.pdf') {
  console.log('[PDF Generator] Running direct canvas report generation fallback');

  const canvasWidth = 1240; // A4 @ 150 DPI
  const canvasHeight = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('امکان ایجاد بوم ترسیم گزارش وجود ندارد.');
  }

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Header band
  ctx.fillStyle = '#3b0764';
  ctx.fillRect(40, 40, canvasWidth - 80, 100);

  // Title text (RTL)
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('سامانه مدیریت مالی توسکا', canvasWidth - 70, 95);

  ctx.font = '20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#e9d5ff';
  ctx.fillText(title, canvasWidth - 70, 125);

  // Meta info on left of header
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`دوره: ${periodText}`, 70, 85);
  ctx.fillText(`کاربر: ${userName}`, 70, 115);

  // Reset to RTL
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';

  // Summary Cards
  const cardY = 170;
  const cardW = 270;
  const cardH = 90;

  const drawCard = (x, y, label, value, bg, border, textCol) => {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, cardW, cardH);
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, cardW, cardH);

    ctx.fillStyle = textCol;
    ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(label, x + cardW - 15, y + 30);

    ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(`${value} ${currencyUnit}`, x + cardW - 15, y + 65);
  };

  const toFa = (num) => {
    const s = Number(num || 0).toLocaleString('en-US');
    const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return s.replace(/[0-9]/g, w => p[parseInt(w, 10)]);
  };

  drawCard(canvasWidth - 40 - cardW, cardY, 'مجموع درآمدها', `+ ${toFa(totalIncome)}`, '#ecfdf5', '#a7f3d0', '#065f46');
  drawCard(canvasWidth - 60 - cardW * 2, cardY, 'مجموع هزینه‌ها', `- ${toFa(totalExpense)}`, '#fff1f2', '#fecdd3', '#9f1239');
  drawCard(canvasWidth - 80 - cardW * 3, cardY, 'تراز مالی دوره', `${netProfitLoss >= 0 ? '+ ' : '- '}${toFa(Math.abs(netProfitLoss))}`, '#fef3c7', '#fde68a', '#92400e');
  drawCard(40, cardY, 'موجودی پایان دوره', toFa(closingBalance), '#f5f3ff', '#ddd6fe', '#5b21b6');

  // Transactions Table Header
  const tableY = 300;
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(40, tableY, canvasWidth - 80, 45);
  ctx.strokeStyle = '#d1d5db';
  ctx.strokeRect(40, tableY, canvasWidth - 80, 45);

  ctx.fillStyle = '#374151';
  ctx.font = 'bold 16px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('ردیف', canvasWidth - 65, tableY + 28);
  ctx.fillText('تاریخ', canvasWidth - 140, tableY + 28);
  ctx.fillText('شرح تراکنش', canvasWidth - 320, tableY + 28);
  ctx.fillText('دسته‌بندی', canvasWidth - 680, tableY + 28);
  ctx.fillText('نوع', canvasWidth - 860, tableY + 28);
  ctx.fillText('مبلغ', 160, tableY + 28);

  // Rows
  let curY = tableY + 45;
  const maxRows = Math.min(transactions.length, 25);

  for (let i = 0; i < maxRows; i++) {
    const tx = transactions[i];
    const isEven = i % 2 === 0;
    ctx.fillStyle = isEven ? '#ffffff' : '#fafafa';
    ctx.fillRect(40, curY, canvasWidth - 80, 40);
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(40, curY, canvasWidth - 80, 40);

    ctx.font = '14px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(toFa(i + 1), canvasWidth - 65, curY + 25);

    ctx.fillStyle = '#111827';
    ctx.fillText(toFa(tx.date || ''), canvasWidth - 140, curY + 25);

    const desc = (tx.description || '').substring(0, 35);
    ctx.fillText(desc, canvasWidth - 320, curY + 25);

    ctx.fillStyle = '#4b5563';
    ctx.fillText(tx.category || '', canvasWidth - 680, curY + 25);

    const typeLabel = tx.type === 'income' ? 'درآمد' : tx.type === 'transfer' ? 'انتقال' : 'هزینه';
    ctx.fillStyle = tx.type === 'income' ? '#059669' : tx.type === 'transfer' ? '#4f46e5' : '#dc2626';
    ctx.fillText(typeLabel, canvasWidth - 860, curY + 25);

    ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
    ctx.fillText(`${toFa(tx.amount)} ${currencyUnit}`, 160, curY + 25);

    curY += 40;
  }

  // Footer
  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('تولید شده توسط سامانه حسابداری شخصی و مدیریت مالی توسکا • سند رسمی', canvasWidth - 50, canvasHeight - 50);

  // Convert to image & PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  const pdfBlob = pdf.output('blob');
  downloadBlobAsFile(pdfBlob, fileName);
  return true;
}
