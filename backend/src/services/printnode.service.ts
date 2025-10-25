import axios from 'axios';
import { config } from '../config/index.js';

interface PrintNodeJob {
  id: number;
  state: string;
}

export async function printLabel(
  pdfBuffer: Buffer,
  title: string
): Promise<{ jobId: number; success: boolean }> {
  try {
    const auth = Buffer.from(`${config.printnode.apiKey}:`).toString('base64');
    
    // PrintNode API-compliant payload
    // NOTE: Margins and scaling MUST be done in the PDF itself
    // PrintNode only supports: paper, fit_to_page, rotate, copies, bin, duplex, dpi
    const payload = {
      printerId: Number(config.printnode.printerId),
      title,
      contentType: 'pdf_base64',
      content: pdfBuffer.toString('base64'),
      source: 'LabelAutomation',
      options: {
        paper: 'A6',           // A6 (105mm x 148mm)
        fit_to_page: false,    // Prevent driver auto-scaling
        rotate: 0,             // No rotation
        copies: 1,             // Single copy
        duplex: 'one-sided',   // Single-sided printing
        // bin: 'Auto',        // Uncomment if needed - must match printer capabilities
      },
    };

    console.log('📤 Sending print job to PrintNode:');
    console.log('   Printer ID:', payload.printerId);
    console.log('   Title:', payload.title);
    console.log('   Options:', JSON.stringify(payload.options, null, 2));
    console.log('   PDF size:', pdfBuffer.length, 'bytes');

    const response = await axios.post<PrintNodeJob>(
      'https://api.printnode.com/printjobs',
      payload,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ PrintNode response received:');
    console.log('   Full response:', JSON.stringify(response.data, null, 2));
    console.log('   Job ID:', response.data?.id || response.data);
    console.log('   Job state:', response.data?.state);

    // PrintNode returns just the job ID as a number when successful
    const jobId = typeof response.data === 'number' ? response.data : response.data?.id;

    return {
      jobId: jobId || 0,
      success: true,
    };
  } catch (error: any) {
    console.error('❌ PrintNode API error:');
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   Data:', JSON.stringify(error.response?.data, null, 2));
    
    throw new Error(
      `PrintNode error: ${error.response?.data?.message || error.message}`
    );
  }
}

export async function getPrinterCapabilities(): Promise<any> {
  try {
    const auth = Buffer.from(`${config.printnode.apiKey}:`).toString('base64');
    const response = await axios.get(
      `https://api.printnode.com/printers/${config.printnode.printerId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        timeout: 10000,
      }
    );

    const printers = Array.isArray(response.data) ? response.data : [response.data];
    const printer = printers[0];

    if (!printer) {
      throw new Error('Printer not found');
    }

    console.log('🖨️  Printer Capabilities:');
    console.log('   Name:', printer.name);
    console.log('   State:', printer.state);
    console.log('   Available papers:', Object.keys(printer.capabilities?.papers || {}));
    
    // Check if A6 is supported
    const papers = printer.capabilities?.papers || {};
    if (papers['A6']) {
      console.log('   ✅ A6 supported:', papers['A6'], '(tenths of mm)');
    } else {
      console.log('   ⚠️  A6 not found in capabilities');
      console.log('   Available paper sizes:', JSON.stringify(papers, null, 2));
    }

    return printer;
  } catch (error: any) {
    console.error('❌ Failed to get printer capabilities:', error.message);
    throw error;
  }
}

export async function getPrinterStatus(): Promise<{
  online: boolean;
  queueLength: number;
}> {
  try {
    const auth = Buffer.from(`${config.printnode.apiKey}:`).toString('base64');
    const response = await axios.get(
      `https://api.printnode.com/printers/${config.printnode.printerId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        timeout: 10000,
      }
    );

    // PrintNode API returns an array, even for a single printer
    const printers = Array.isArray(response.data) ? response.data : [response.data];
    const printer = printers[0];

    if (!printer) {
      return {
        online: false,
        queueLength: 0,
      };
    }

    return {
      online: printer.state === 'online',
      queueLength: printer.job?.length || 0,
    };
  } catch (error) {
    console.error('PrintNode API error:', error);
    return {
      online: false,
      queueLength: 0,
    };
  }
}
