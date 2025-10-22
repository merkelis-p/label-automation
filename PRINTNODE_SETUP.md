# 🖨️ PrintNode Setup Guide

Complete guide to setting up PrintNode for automatic label printing with the Label Automation System.

---

## 📋 Table of Contents

1. [What is PrintNode?](#what-is-printnode)
2. [Why PrintNode?](#why-printnode)
3. [Prerequisites](#prerequisites)
4. [Account Setup](#account-setup)
5. [Client Installation](#client-installation)
6. [Printer Configuration](#printer-configuration)
7. [API Key Generation](#api-key-generation)
8. [Finding Printer ID](#finding-printer-id)
9. [Testing Connection](#testing-connection)
10. [Troubleshooting](#troubleshooting)

---

## 🤔 What is PrintNode?

PrintNode is a cloud printing service that enables applications to send print jobs to physical printers anywhere in the world. It acts as a bridge between your web application and your local printers.

**How it works:**
1. **PrintNode Client** runs on your computer (where the printer is connected)
2. **Your Application** sends print jobs to PrintNode's cloud API
3. **PrintNode** routes the job to your client
4. **Client** sends the document to your printer

This eliminates the need for complex printer drivers in your web application and allows printing from anywhere.

---

## 📦 Prerequisites

Before setting up PrintNode, ensure you have:

- ✅ A computer with printer access (Mac/Linux), works on Windows too, but this guide focuses on those OSes
- ✅ Thermal label printer
- ✅ Printer drivers installed and printer working with test prints
- ✅ Internet connection (for PrintNode client communication)
- ✅ Administrative privileges (for client installation)

---

## 🔐 Account Setup

### Step 1: Create Account

1. **Visit**: https://www.printnode.com/
2. **Click** "Sign Up" (top right)
3. **Fill in details**:
   - Email address
   - Password
   - Company name (optional)

4. **Verify email**: Check inbox and click verification link

### Step 2: Sign In

1. **Go to**: https://app.printnode.com/
2. **Enter** your credentials
3. You'll see the **Dashboard**

---

## 💻 Client Installation

The PrintNode client must be installed on the computer connected to your printer.

### macOS

1. **Download**:
   - Visit: https://www.printnode.com/download/mac
   - Or direct link: https://dl.printnode.com/client/mac/production/PrintNode.pkg

2. **Run installer**:
   - Double-click `PrintNode.pkg`
   - Click "Continue" through prompts
   - Enter Mac password when requested
   - Click "Install"

3. **Login to client**:
   - Open PrintNode from Applications
   - Menu bar icon will appear (small printer)
   - Click icon → "Login"
   - Enter your PrintNode credentials

4. **Grant permissions** (if prompted):
   - System Preferences → Security & Privacy
   - Allow PrintNode to run

5. **Verify installation**:
   - Menu bar icon should be **green**
   - Click icon → "Computers & Printers"
   - Your Mac should be listed

### Linux

1. **Download**:
   - Visit: https://www.printnode.com/download/linux
   - Choose your distribution:
     - **Ubuntu/Debian**: `.deb` package
     - **Fedora/RHEL**: `.rpm` package
     - **Other**: `.tar.gz` archive

2. **Install**:

   **Ubuntu/Debian:**
   ```bash
   wget https://dl.printnode.com/client/linux/production/printnode-linux_x86_64.tar.gz
   tar -xzf printnode-linux_x86_64.tar.gz
   cd PrintNode
   sudo ./installer.sh
   ```

   **Fedora/RHEL:**
   ```bash
   wget https://dl.printnode.com/client/linux/production/printnode-linux_x86_64.tar.gz
   tar -xzf printnode-linux_x86_64.tar.gz
   cd PrintNode
   sudo ./installer.sh
   ```

3. **Start client**:
   ```bash
   printnode
   ```

4. **Login**:
   - Follow prompts to enter credentials

---

## 🖨️ Printer Configuration

### Step 1: Connect Printer

1. **Physical connection**:
   - Plug printer into computer (USB)
   - Or connect via network (if supported)
   - Power on the printer

2. **Install drivers**:
   - Download from manufacturer website
   - Or use OS automatic driver installation
   - Print a test page from OS settings

### Step 2: Verify in PrintNode

1. **Open PrintNode Dashboard**: https://app.printnode.com/
2. **Navigate to**: Computers (left sidebar)
3. **Click** on your computer name
4. **See "Printers" section**: Your printer should appear automatically
5. **Check status**: Should show "Ready" or "Online"

**If printer doesn't appear:**
- Restart PrintNode client
- Check printer is set as "ready" in OS
- Ensure printer drivers are installed
- Wait 1-2 minutes for sync

### Step 3: Test Print from Dashboard

1. **Click** your printer name
2. **Click** "Test Print" button
3. **Choose** a test document
4. **Click** "Print"
5. **Verify** printer outputs the page

---

## 🔑 API Key Generation

API keys allow your application to authenticate with PrintNode.

### Step 1: Create API Key

1. **Go to**: https://app.printnode.com/
2. **Click**: "Account" (top right)
3. **Select**: "API Keys" (left sidebar)
4. **Click**: "Create New API Key"

### Step 2: Configure Key

1. **Description**: `Label Automation System`
2. **Permissions**: 
   - ✅ Submit print jobs
   - ✅ View printers
   - ✅ View computers
3. **Restrictions** (optional):
   - Limit to specific IPs
   - Limit to specific printers
4. **Click**: "Create"

### Step 3: Save Key

1. **Copy the API key** immediately (shown only once)
2. **Format**: `abcd1234efgh5678ijkl9012mnop3456`
3. **Store securely**: Add to `.env` file

**⚠️ Important:**
- Never share your API key
- Never commit it to version control
- Regenerate if compromised

---

## 🔍 Finding Printer ID

Every printer in PrintNode has a unique numeric ID. You need this for your application.

### Method 1: Dashboard (Easiest)

1. **Go to**: https://app.printnode.com/
2. **Click**: "Computers" (sidebar)
3. **Click**: Your computer name
4. **Find** your printer in the list
5. **Copy** the ID number (e.g., `12345678`)

### Method 2: API Call

```bash
curl -u YOUR_API_KEY: https://api.printnode.com/printers
```

**Response:**
```json
[
  {
    "id": 12345678,
    "computer": {
      "id": 87654321,
      "name": "My-Computer"
    },
    "name": "Zebra ZD420-203dpi ZPL",
    "description": "Zebra Label Printer",
    "capabilities": {
      "bins": ["Auto"],
      "collate": false,
      "color": false,
      "copies": 1,
      "dpis": ["203x203"],
      "extent": [[0,0],[831,1247]],
      "medias": ["Letter", "Custom"],
      "nup": [1],
      "papers": ["Default"]
    },
    "default": true,
    "createTimestamp": "2024-01-15T10:30:00.000Z",
    "state": "online"
  }
]
```

**Copy the `id` value**: `12345678`

### Method 3: Client

1. **Open** PrintNode client
2. **Right-click** system tray/menu bar icon
3. **Click** "Computers & Printers"
4. **Hover** over printer name
5. **Note** the ID in tooltip or details

---

## ✅ Testing Connection

Verify everything is working before integrating with your application.

### Test 1: Printer Status

```bash
curl -u YOUR_API_KEY: https://api.printnode.com/printers/YOUR_PRINTER_ID
```

**Expected:**
```json
{
  "id": 12345678,
  "name": "Zebra ZD420-203dpi ZPL",
  "state": "online"
}
```

### Test 2: Simple Print Job

```bash
curl -X POST https://api.printnode.com/printjobs \
  -u YOUR_API_KEY: \
  -H "Content-Type: application/json" \
  -d '{
    "printerId": YOUR_PRINTER_ID,
    "title": "Test Print from Terminal",
    "contentType": "pdf_uri",
    "content": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "source": "Label Automation Test"
  }'
```

**Expected:**
- Command returns job ID
- Printer outputs test PDF

### Test 3: Label Print (Base64)

```bash
# First, convert a test PDF to base64
base64 -i your_test_label.pdf -o test_label_b64.txt

# Then send to printer
curl -X POST https://api.printnode.com/printjobs \
  -u YOUR_API_KEY: \
  -H "Content-Type: application/json" \
  -d '{
    "printerId": YOUR_PRINTER_ID,
    "title": "Test Label",
    "contentType": "pdf_base64",
    "content": "'"$(cat test_label_b64.txt)"'",
    "source": "Label Automation"
  }'
```

---

## 🔧 Integration with Label Automation

After completing setup, add to your `.env` file:

```bash
PRINTNODE_API_KEY=your_api_key_here
PRINTNODE_PRINTER_ID=12345678
```

Then restart your Label Automation application:

```bash
npm start
```

**Test integration:**
```bash
# Seed test data
curl -X POST http://localhost:3000/api/test/seed

# Generate mock fulfillment (will auto-print)
curl -X POST http://localhost:3000/api/test/mock-fulfillment
```

Check your printer - you should see a label print!

---

## 🐛 Troubleshooting

### Printer shows "Offline"

**Possible causes:**
- PrintNode client not running
- Printer powered off
- USB cable disconnected
- Network issues (for networked printers)

**Solutions:**
1. Check printer power and connections
2. Restart PrintNode client
3. Restart computer
4. Reinstall printer drivers

### API Key Authentication Fails

**Error:** `401 Unauthorized`

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check key hasn't been deleted in dashboard
3. Ensure key has correct permissions
4. Try regenerating the key

### Print Jobs Not Arriving

**Possible causes:**
- Incorrect Printer ID
- PrintNode client offline
- Firewall blocking client

**Solutions:**
1. Verify Printer ID: `curl -u API_KEY: https://api.printnode.com/printers`
2. Check client status (green icon)
3. Check firewall/antivirus settings
4. View PrintNode logs:
   - **macOS**: `~/Library/Logs/PrintNode`
   - **Linux**: `/var/log/printnode`

### Labels Print But Are Blank

**Possible causes:**
- PDF format incompatibility
- Incorrect printer settings
- Driver issues

**Solutions:**
1. Test with different PDF
2. Update printer drivers
3. Check printer preferences (media size, darkness)
4. Try raw ZPL/EPL format if using Zebra

### "Computer not found" Error

**Solutions:**
1. Ensure PrintNode client is logged in
2. Check email/password in client
3. Wait 2-3 minutes for sync
4. Restart client

### High Latency / Slow Printing

**Solutions:**
1. Check internet connection speed
2. Verify PrintNode service status: https://status.printnode.com/
3. Use closer geographic servers (contact support)
4. Optimize PDF file size

### Multiple Printers - Wrong Printer Used

**Solutions:**
1. Double-check Printer ID in `.env`
2. Set printer as default in OS
3. Use explicit printer ID in API calls
4. Disable other printers temporarily for testing

---

## 📞 Support

### PrintNode Support

- **Documentation**: https://www.printnode.com/en/docs
- **API Reference**: https://www.printnode.com/en/docs/api
- **Status Page**: https://status.printnode.com/
- **Email**: support@printnode.com
- **Live Chat**: Available on dashboard

### Label Automation Support

- **GitHub Issues**: https://github.com/merkelis-p/label-automation/issues


---

## 🔗 Useful Links

- **PrintNode Website**: https://www.printnode.com/
- **Dashboard**: https://app.printnode.com/
- **API Docs**: https://www.printnode.com/en/docs/api/curl
- **Downloads**: https://www.printnode.com/en/download
- **Status**: https://status.printnode.com/
- **Pricing**: https://www.printnode.com/en/pricing

---

## 📚 Additional Resources

### Supported Printers

PrintNode works with virtually any printer, but these are popular for label printing:

**Thermal Label Printers:**
- Zebra: ZD420, ZD620, GK420d, GX420d
- Brother: QL-820NWB, QL-1110NWB, TD-4520TN
- Dymo: LabelWriter 450, 4XL
- ROLLO: Label Printer (X1038)

**Regular Printers:**
- Works with any standard printer
- Not recommended for high-volume labels (slower, expensive ink)

### File Format Support

- **PDF**: Best for labels (what MakeCommerce provides)
- **PNG/JPEG**: Image-based labels
- **Raw**: ZPL, EPL, ESC/POS for thermal printers
- **PostScript**: Legacy format
- **URI**: Print from URL

### Printer Settings

For thermal label printers:
- **Media size**: Match label dimensions (e.g., 4"x6")
- **Darkness**: Adjust for clear text (usually 50-75%)
- **Speed**: Medium (too fast = faded prints)
- **Tear-off**: Set for proper label positioning

---

**Happy Printing! 🖨️**

