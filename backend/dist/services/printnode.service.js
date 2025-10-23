import axios from 'axios';
import { config } from '../config/index.js';
export async function printLabel(pdfBuffer, title) {
    try {
        const auth = Buffer.from(`${config.printnode.apiKey}:`).toString('base64');
        const payload = {
            printerId: Number(config.printnode.printerId),
            title,
            contentType: 'pdf_base64',
            content: pdfBuffer.toString('base64'),
            source: 'LabelAutomation',
        };
        const response = await axios.post('https://api.printnode.com/printjobs', payload, {
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        return {
            jobId: response.data.id,
            success: true,
        };
    }
    catch (error) {
        throw new Error(`PrintNode error: ${error.response?.data?.message || error.message}`);
    }
}
export async function getPrinterStatus() {
    try {
        const auth = Buffer.from(`${config.printnode.apiKey}:`).toString('base64');
        const response = await axios.get(`https://api.printnode.com/printers/${config.printnode.printerId}`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
            timeout: 10000,
        });
        return {
            online: response.data.state === 'online',
            queueLength: response.data.job?.length || 0,
        };
    }
    catch {
        return {
            online: false,
            queueLength: 0,
        };
    }
}
//# sourceMappingURL=printnode.service.js.map