# PrintNode Printer Settings Reference

## Current Configuration

### Paper Size
- **Format**: A6 (105mm × 148mm)
- **Setting**: `paper: 'A6'`

### Non-Printable Area (Margins)
Margins are specified in **points** (1mm = 2.83465 points, rounded for simplicity):

| Edge | Size (mm) | Points | Setting |
|------|-----------|--------|---------|
| Top | 5mm | 14pt | `margins.top: 14` |
| Right | 10mm | 28pt | `margins.right: 28` |
| Bottom | 0mm | 0pt | `margins.bottom: 0` |
| Left | 10mm | 28pt | `margins.left: 28` |

### Scaling
- **Target**: 90% of original size
- **Settings**: Multiple options for compatibility:
  - `scaling: 90` - For Windows printer drivers
  - `scale: 90` - Alternative for some drivers
  - `'print-scaling': 'none'` - For CUPS-based systems (macOS/Linux)

### Other Options
- **Fit to page**: Disabled (`fit_to_page: false`)
- **Rotation**: None (`rotate: 0`)
- **Copies**: 1 (`copies: 1`)
- **Duplex**: None (single-sided)
- **Paper bin**: Auto-select

## Testing the Settings

### 1. Test Print via API
```bash
# Test with auto-print enabled
curl -X POST 'http://localhost:3000/api/test/makecommerce/dpd?print=true'
```

### 2. Check PrintNode Job Details
```bash
# Replace with your actual API key and printer ID
curl -u "YOUR_API_KEY:" \
  "https://api.printnode.com/printjobs?printerId=74795750&limit=1"
```

### 3. Get Printer Capabilities
```bash
# To see what options your printer supports
curl -u "YOUR_API_KEY:" \
  "https://api.printnode.com/printers/74795750" | json_pp
```

## Adjusting Settings

### To Change Margins
Edit `/backend/src/services/printnode.service.ts`:

```typescript
margins: {
  top: 14,    // 5mm - adjust as needed
  right: 28,  // 10mm - adjust as needed
  bottom: 0,  // 0mm - adjust as needed
  left: 28,   // 10mm - adjust as needed
}
```

**Formula**: `points = millimeters × 2.83465`

### To Change Scale
The scale percentage may work differently depending on your printer driver:

```typescript
// Try these values if 90% doesn't work as expected
scaling: 90,  // Most common
scale: 0.9,   // Some drivers use decimal (0.9 = 90%)
```

### To Change Paper Size
Available paper sizes (common):
- `'A6'` - 105mm × 148mm (current)
- `'A5'` - 148mm × 210mm
- `'A4'` - 210mm × 297mm
- `'Letter'` - 8.5" × 11"
- Custom: `{ width: 297, height: 419 }` (in points)

## Troubleshooting

### Scaling Not Working
1. **Check printer driver**: Some thermal printers ignore scaling options
2. **Try decimal format**: Change `scaling: 90` to `scale: 0.9`
3. **Use fit_to_page**: Set `fit_to_page: true` instead of manual scaling
4. **Pre-scale PDF**: Scale the PDF before sending to PrintNode (if needed)

### Margins Not Applied
1. **Printer limitations**: Some thermal printers have fixed margins
2. **Paper size mismatch**: Verify printer is configured for A6
3. **Driver settings**: Check printer driver settings in system preferences
4. **Points calculation**: Verify margin calculations match your needs

### Wrong Paper Size
1. **Check printer configuration**: Ensure printer supports A6 (105×148mm)
2. **Use custom dimensions**: If 'A6' doesn't work, use:
   ```typescript
   paper: { width: 297, height: 419 } // A6 in points
   ```

## Advanced Options

### Custom Paper Size (if A6 doesn't work)
```typescript
options: {
  paper: {
    width: 297,   // 105mm in points
    height: 419,  // 148mm in points
  },
  // ... rest of options
}
```

### Printer-Specific Raw Options
If you need to pass specific options to your VEVOR Y428BT printer:

```typescript
options: {
  // Standard options above...
  // Plus raw printer-specific options:
  'printer-option-name': 'value',
}
```

To find available options, use PrintNode's printer capabilities API.

## After Changes

Always rebuild the backend after modifying settings:

```bash
npm run build:backend
```

Then restart your server to apply the changes.
