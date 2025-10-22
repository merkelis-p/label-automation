import axios from 'axios';
import { config } from '../config/index.js';
import {
  Carrier,
  MakeCommerceCredentials,
  MakeCommerceLabelPayload,
  MakeCommerceLabelResponse,
} from '../types/index.js';

function getCredentials(carrier: Carrier): MakeCommerceCredentials {
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

export async function createLabels(params: {
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
}): Promise<{ labelUrl: string; pdfBuffer: Buffer }> {
  const credentials = getCredentials(params.carrier);

  const orderObj: MakeCommerceLabelPayload['orders'][0] = {
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
  } else {
    orderObj.type = 'COURIER';
    orderObj.destination = params.destination;
  }

  const payload: MakeCommerceLabelPayload = {
    credentials: [credentials],
    orders: [orderObj],
    printFormat: config.labelFormat,
  };

  const response = await axios.post<MakeCommerceLabelResponse>(
    `${config.makecommerce.baseUrl}/v1/shipments/createlabels`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Shop-Id': config.makecommerce.shopId,
        'Shop-Secret': config.makecommerce.shopSecret,
      },
      timeout: 30000,
    }
  );

  const url =
    response.data?.url ||
    response.data?.labelUrl ||
    (Array.isArray(response.data?.urls) ? response.data.urls[0] : null);

  if (!url) {
    throw new Error('MakeCommerce returned no label URL');
  }

  const pdfResponse = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  return {
    labelUrl: url,
    pdfBuffer: Buffer.from(pdfResponse.data),
  };
}
