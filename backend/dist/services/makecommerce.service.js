import axios from 'axios';
import { config } from '../config/index.js';
function getCredentials(carrier) {
    if (carrier === 'DPD_LT') {
        return {
            carrier: 'DPD_LT',
            apiKey: config.carriers.dpd.apiKey,
        };
    }
    return {
        carrier: 'OMNIVA',
        username: config.carriers.omniva.username,
        password: config.carriers.omniva.password,
    };
}
export async function createLabels(params) {
    const credentials = getCredentials(params.carrier);
    const orderObj = {
        orderId: params.orderRef,
        carrier: params.carrier,
        shipmentId: params.shipmentId,
        recipient: params.recipient,
        sender: {
            name: config.sender.name,
            phone: config.sender.phone,
            email: config.sender.email,
            postalCode: config.sender.postal,
        },
    };
    if (params.lockerId) {
        orderObj.type = 'APT';
        orderObj.parcelDestinationId = params.lockerId;
    }
    else {
        orderObj.type = 'COURIER';
        orderObj.destination = params.destination;
    }
    const payload = {
        credentials: [credentials],
        orders: [orderObj],
        printFormat: config.labelFormat,
    };
    const response = await axios.post(`${config.makecommerce.baseUrl}/v1/shipments/createlabels`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'Shop-Id': config.makecommerce.shopId,
            'Shop-Secret': config.makecommerce.shopSecret,
        },
        timeout: 30000,
    });
    const url = response.data?.url ||
        response.data?.labelUrl ||
        (Array.isArray(response.data?.urls) ? response.data.urls[0] : null);
    if (!url) {
        throw new Error('MakeCommerce returned no label URL');
    }
    const pdfResponse = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
    });
    return {
        labelUrl: url,
        pdfBuffer: Buffer.from(pdfResponse.data),
    };
}
//# sourceMappingURL=makecommerce.service.js.map