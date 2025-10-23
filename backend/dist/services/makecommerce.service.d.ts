import { Carrier } from '../types/index.js';
export declare function createLabels(params: {
    carrier: Carrier;
    shipmentId: string;
    orderRef: string;
    lockerId?: string;
    destination?: {
        postalCode: string;
        country: string;
        county?: string;
        city: string;
        street: string;
    };
    recipient: {
        name: string;
        phone: string;
        email: string;
    };
}): Promise<{
    labelUrl: string;
    pdfBuffer: Buffer;
}>;
//# sourceMappingURL=makecommerce.service.d.ts.map