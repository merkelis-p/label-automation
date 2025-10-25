# PrintNode Printer Settings Reference

## ⚠️ IMPORTANT: How PrintNode API Actually Works

**PrintNode API does NOT support:**
- ❌ Custom margins (must be in the PDF itself)
- ❌ Arbitrary scaling like 90% (must be in the PDF itself)
- ❌ Custom `print-scaling`, `scaling`, or `scale` options

**PrintNode API officially supports:**
- ✅ `paper` - Paper size (must match printer capabilities)
- ✅ `fit_to_page` - Boolean to prevent auto-scaling
- ✅ `rotate` - Rotation (0, 90, 180, 270)
- ✅ `copies` - Number of copies
- ✅ `duplex` - One-sided, long-edge, short-edge
- ✅ `bin` - Paper bin (must match printer capabilities)
- ✅ `dpi` - Print resolution

**Source:** [PrintNode API Documentation](https://www.printnode.com/en/docs/api/curl)

---

## Current Configuration (API-Compliant)

### Paper Size
- **Format**: A6 (105mm × 148mm)
- **Setting**: `paper: 'A6'`
- **Important**: The printer MUST support this paper size in its capabilities

### Print Options
```typescript
options: {
  paper: 'A6',           // A6 (105mm x 148mm)
  fit_to_page: false,    // Prevent driver auto-scaling
  rotate: 0,             // No rotation
  copies: 1,             // Single copy
  duplex: 'one-sided',   // Single-sided printing
}
```

### Margins & Scaling - MUST BE IN THE PDF

To achieve your requirements:
- **Non-printable area**: Top 5mm, Right 10mm, Bottom 0mm, Left 10mm
- **Scale**: 90% of original size

**You must pre-process the PDF** before sending to PrintNode. Options:
1. Use `pdf-lib` to create/modify PDFs with custom page size and margins
2. Use `pdfkit` to generate PDFs with exact dimensions
3. Pre-render your label at 90% scale with margins before converting to PDF

---

## Testing & Debugging

### 1. Check Printer Capabilities
```bash
curl http://localhost:3000/api/test/printer-capabilities
```

This will show:
- Available paper sizes (look for `A6: [1050, 1480]` in tenths of mm)
- Available bins
- DPI options
- Whether custom paper sizes are supported

### 2. Test Print with Debugging
```bash
curl -X POST 'http://localhost:3000/api/test/makecommerce/dpd?print=true'
```

Check server console for detailed logs:
- 📤 Print job payload
- ✅ Success confirmation
- ❌ Error details if failed

### 3. Direct PrintNode API Test
```bash
# Get printer capabilities
curl -u "YOUR_API_KEY:" \
  "https://api.printnode.com/printers/74795750" | json_pp

# Check recent print jobs
curl -u "YOUR_API_KEY:" \
  "https://api.printnode.com/printjobs?printerId=74795750&limit=5"
```

---

## How to Add Margins & Scaling to PDF

### Option 1: Using pdf-lib (Recommended)

Install:
```bash
npm install pdf-lib
```

Example code to add margins and scale:
```typescript
import { PDFDocument } from 'pdf-lib';

async function prepareA6LabelWithMarginsAndScale(
  originalPdfBuffer: Buffer
): Promise<Buffer> {
  // Load the original PDF
  const pdfDoc = await PDFDocument.load(originalPdfBuffer);
  const pages = pdfDoc.getPages();
  const originalPage = pages[0];
  
  // A6 dimensions in points (72 points per inch)
  const A6_WIDTH = 297.64;   // 105mm
  const A6_HEIGHT = 419.53;  // 148mm
  
  // Margins in points
  const MARGIN_TOP = 14.17;     // 5mm
  const MARGIN_RIGHT = 28.35;   // 10mm
  const MARGIN_BOTTOM = 0;      // 0mm
  const MARGIN_LEFT = 28.35;    // 10mm
  
  // Calculate content area
  const contentWidth = A6_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const contentHeight = A6_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
  
  // Scale to 90%
  const SCALE = 0.9;
  const scaledWidth = contentWidth * SCALE;
  const scaledHeight = contentHeight * SCALE;
  
  // Create new PDF with A6 page
  const newPdf = await PDFDocument.create();
  const newPage = newPdf.addPage([A6_WIDTH, A6_HEIGHT]);
  
  // Embed the original page
  const [embeddedPage] = await newPdf.embedPdf(pdfDoc, [0]);
  
  // Center the scaled content in the content area
  const x = MARGIN_LEFT + (contentWidth - scaledWidth) / 2;
  const y = MARGIN_BOTTOM + (contentHeight - scaledHeight) / 2;
  
  newPage.drawPage(embeddedPage, {
    x,
    y,
    width: scaledWidth,
    height: scaledHeight,
  });
  
  return Buffer.from(await newPdf.save());
}
```

### Option 2: Using pdfkit (Generate from scratch)

```typescript
import PDFDocument from 'pdfkit';

function createA6Label(content: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({
      size: [297.64, 419.53], // A6 in points
      margins: {
        top: 14.17,    // 5mm
        right: 28.35,  // 10mm
        bottom: 0,     // 0mm
        left: 28.35,   // 10mm
      },
    });
    
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    
    // Scale content to 90%
    doc.scale(0.9);
    
    // Add your label content here
    doc.fontSize(12).text(content.text, 0, 0);
    
    doc.end();
  });
}
```

---

## Integration Example

Update your print workflow:

```typescript
import { prepareA6LabelWithMarginsAndScale } from './pdf-utils.js';
import { printLabel } from './services/printnode.service.js';

async function printLabelWithCustomSettings(labelUrl: string, title: string) {
  // 1. Download the PDF
  const response = await axios.get(labelUrl, { responseType: 'arraybuffer' });
  const originalPdf = Buffer.from(response.data);
  
  // 2. Pre-process: Add margins and scale to 90%
  const processedPdf = await prepareA6LabelWithMarginsAndScale(originalPdf);
  
  // 3. Send to PrintNode (which will use A6, no scaling)
  const result = await printLabel(processedPdf, title);
  
  return result;
}
```

---
