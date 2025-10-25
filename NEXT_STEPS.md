# Next Steps for Label Printing

## 🎯 Current Status

✅ Fixed PrintNode API payload (removed unsupported options)  
✅ Added comprehensive debugging to print jobs  
✅ Created endpoint to check printer capabilities  
⚠️ Margins and 90% scaling need to be done in PDF preprocessing

---

## 🧪 Testing Commands

### 1. Check if your printer supports A6
```bash
curl http://localhost:3000/api/test/printer-capabilities
```

Look for output like:
```json
{
  "capabilities": {
    "papers": {
      "A6": [1050, 1480]  // ✅ A6 is supported (in tenths of mm)
    }
  }
}
```

### 2. Test print with detailed logging
```bash
# Restart your server first
npm start

# In another terminal, trigger a test print
curl -X POST 'http://localhost:3000/api/test/makecommerce/dpd?print=true'
```

Check the server console for:
- 📤 Print job payload details
- ✅ Job ID if successful
- ❌ Detailed error if failed

### 3. Verify print job in PrintNode
```bash
# Replace YOUR_API_KEY with your actual PrintNode API key
curl -u "YOUR_API_KEY:" \
  "https://api.printnode.com/printjobs?printerId=74795750&limit=5"
```

---

## 🔧 What Changed

### Before (Incorrect - Not supported by PrintNode API)
```typescript
options: {
  paper: 'A6',
  margins: { top: 14, right: 28, bottom: 0, left: 28 }, // ❌ Not supported
  scaling: 90,           // ❌ Not supported
  scale: 90,             // ❌ Not supported
  'print-scaling': 'none', // ❌ Not supported
  duplex: 'None',        // ❌ Wrong value
}
```

### After (Correct - API compliant)
```typescript
options: {
  paper: 'A6',           // ✅ Supported
  fit_to_page: false,    // ✅ Supported
  rotate: 0,             // ✅ Supported
  copies: 1,             // ✅ Supported
  duplex: 'one-sided',   // ✅ Correct value
}
```

---

## 📋 To Implement Margins & 90% Scaling

You have two options:

### Option A: Quick Test (No margins/scaling for now)
Just test if printing works at all with the current setup:
```bash
npm start
# Then test print
curl -X POST 'http://localhost:3000/api/test/makecommerce/dpd?print=true'
```

If this works, you'll see the label print at full size with no custom margins.

### Option B: Add PDF Preprocessing (Recommended)

1. **Install pdf-lib**:
   ```bash
   npm install pdf-lib
   ```

2. **Create PDF utility** (`backend/src/utils/pdf-utils.ts`):
   ```typescript
   import { PDFDocument } from 'pdf-lib';

   export async function prepareA6Label(
     originalPdfBuffer: Buffer
   ): Promise<Buffer> {
     const pdfDoc = await PDFDocument.load(originalPdfBuffer);
     
     // A6 dimensions: 105mm x 148mm = 297.64 x 419.53 points
     const A6_WIDTH = 297.64;
     const A6_HEIGHT = 419.53;
     
     // Margins: top 5mm, right 10mm, bottom 0mm, left 10mm
     const MARGIN_TOP = 14.17;
     const MARGIN_RIGHT = 28.35;
     const MARGIN_BOTTOM = 0;
     const MARGIN_LEFT = 28.35;
     
     const contentWidth = A6_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
     const contentHeight = A6_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;
     
     // Scale to 90%
     const scaledWidth = contentWidth * 0.9;
     const scaledHeight = contentHeight * 0.9;
     
     // Create new PDF with A6 page
     const newPdf = await PDFDocument.create();
     const newPage = newPdf.addPage([A6_WIDTH, A6_HEIGHT]);
     
     // Embed original page
     const [embeddedPage] = await newPdf.embedPdf(pdfDoc, [0]);
     
     // Center the scaled content
     const x = MARGIN_LEFT + (contentWidth - scaledWidth) / 2;
     const y = MARGIN_BOTTOM + (contentHeight - scaledHeight) / 2;
     
     newPage.drawPage(embeddedPage, {
       x, y,
       width: scaledWidth,
       height: scaledHeight,
     });
     
     return Buffer.from(await newPdf.save());
   }
   ```

3. **Update makecommerce-test.controller.ts**:
   ```typescript
   import { prepareA6Label } from '../utils/pdf-utils.js';
   
   // In createTestOrder function, before calling printLabel:
   if (autoPrint) {
     console.log('🖨️  Auto-printing label for order', orderId, '...');
     
     // Download PDF
     const pdfResponse = await axios.get(labelUrl, {
       responseType: 'arraybuffer',
       timeout: 30000,
     });
     const originalPdf = Buffer.from(pdfResponse.data);
     
     // Preprocess: Add margins and scale to 90%
     const processedPdf = await prepareA6Label(originalPdf);
     
     // Send to PrintNode
     await printLabel(processedPdf, `Label for ${orderId}`);
   }
   ```

---

## 🎬 Immediate Action

1. **Restart server**:
   ```bash
   npm start
   ```

2. **Check printer capabilities**:
   ```bash
   curl http://localhost:3000/api/test/printer-capabilities
   ```

3. **Test basic printing** (no margins/scaling yet):
   ```bash
   curl -X POST 'http://localhost:3000/api/test/makecommerce/dpd?print=true'
   ```

4. **Check server console** for detailed logs:
   - Look for "📤 Sending print job to PrintNode"
   - Check if job was created successfully
   - Note any errors

5. **Report back** with:
   - Printer capabilities output (does it show A6?)
   - Server console output from print attempt
   - Whether the label actually printed (even if wrong size)

---

## 📚 Documentation

- **PRINTER_SETTINGS.md** - Updated with correct API info and PDF preprocessing examples
- **PrintNode API Docs** - https://www.printnode.com/en/docs/api/curl

---

## ❓ Common Issues

**"Incorrect request body: options.duplex must be..."**  
✅ Fixed - Changed from 'None' to 'one-sided'

**"Printer doesn't support A6"**  
Check capabilities endpoint, may need custom paper size:
```typescript
paper: { width: 297, height: 419 }
```

**"Label prints but wrong size/position"**  
Normal - need to add PDF preprocessing (Option B above)
