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
    const payload = {
      printerId: Number(config.printnode.printerId),
      title,
      contentType: 'pdf_base64',
      content: pdfBuffer.toString('base64'),
      source: 'LabelAutomation',
    };

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

    return {
      jobId: response.data.id,
      success: true,
    };
  } catch (error: any) {
    throw new Error(
      `PrintNode error: ${error.response?.data?.message || error.message}`
    );
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
