import { PDFDocument } from 'pdf-lib';
/** mm -> points */
const MM_TO_PT = 72 / 25.4;
/** A6 size in points */
const A6_WIDTH_PT = 105 * MM_TO_PT; // ≈ 297.64 pt
const A6_HEIGHT_PT = 148 * MM_TO_PT; // ≈ 419.53 pt
/** Margins (top,right,bottom,left) in points: 5mm,10mm,0,10mm */
const M_TOP_PT = 5 * MM_TO_PT; // ≈ 14.17 pt
const M_RIGHT_PT = 10 * MM_TO_PT; // ≈ 28.35 pt
const M_BOTTOM_PT = 0 * MM_TO_PT; // 0 pt
const M_LEFT_PT = 10 * MM_TO_PT; // ≈ 28.35 pt
/**
 * Wrap first page of an existing PDF into an A6 page with specific margins and 90% scale.
 * - Fits the original page into the (A6 - margins) box, preserving aspect ratio.
 * - Then applies an additional 0.90 factor.
 * - Centers within the content box.
 *
 * Return: a new PDF buffer ready to send to PrintNode with `fit_to_page: false`.
 */
export async function toA6WithMarginsAndScale(pdfBuffer) {
    console.log('🔄 Processing PDF for A6 with margins and 90% scale...');
    console.log('   Input PDF size:', pdfBuffer.length, 'bytes');
    // Load the source PDF
    const srcDoc = await PDFDocument.load(pdfBuffer);
    // Create a new output PDF
    const outDoc = await PDFDocument.create();
    // Get first page of the source
    const srcPage = srcDoc.getPage(0);
    const { width: srcW, height: srcH } = srcPage.getSize();
    console.log('   Original page size:', srcW.toFixed(2), 'x', srcH.toFixed(2), 'pt');
    // Embed that source page into the output
    const [embedded] = await outDoc.embedPdf(await srcDoc.save(), [0]);
    // Create an A6 page in the output
    const outPage = outDoc.addPage([A6_WIDTH_PT, A6_HEIGHT_PT]);
    console.log('   Target A6 page size:', A6_WIDTH_PT.toFixed(2), 'x', A6_HEIGHT_PT.toFixed(2), 'pt');
    // Available content box after margins
    const boxW = A6_WIDTH_PT - M_LEFT_PT - M_RIGHT_PT;
    const boxH = A6_HEIGHT_PT - M_TOP_PT - M_BOTTOM_PT;
    console.log('   Content box (after margins):', boxW.toFixed(2), 'x', boxH.toFixed(2), 'pt');
    // Scale to fit, then multiply by 0.90 (requested scale)
    const fitScale = Math.min(boxW / srcW, boxH / srcH);
    const finalScale = fitScale * 0.9;
    const drawW = srcW * finalScale;
    const drawH = srcH * finalScale;
    console.log('   Final scale:', (finalScale * 100).toFixed(1) + '%');
    console.log('   Draw size:', drawW.toFixed(2), 'x', drawH.toFixed(2), 'pt');
    // Center within the content box; pdf-lib coords start at bottom-left
    const x = M_LEFT_PT + (boxW - drawW) / 2;
    const y = M_BOTTOM_PT + (boxH - drawH) / 2;
    console.log('   Position (x,y):', x.toFixed(2), ',', y.toFixed(2), 'pt');
    // Draw embedded page
    outPage.drawPage(embedded, { x, y, width: drawW, height: drawH });
    // Finalize
    const outBytes = await outDoc.save();
    const outputBuffer = Buffer.from(outBytes);
    console.log('✅ PDF processed:', outputBuffer.length, 'bytes');
    return outputBuffer;
}
//# sourceMappingURL=pdf-utils.js.map