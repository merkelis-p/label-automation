import axios from 'axios';
import { config } from '../config/index.js';
import { ShopifyOrder } from '../types/index.js';

const shopify = axios.create({
  baseURL: `https://${config.shopify.domain}/admin/api/2024-10`,
  headers: {
    'X-Shopify-Access-Token': config.shopify.adminToken,
  },
  timeout: 30000,
});

export async function getOrder(orderId: number): Promise<ShopifyOrder> {
  const response = await shopify.get<{ order: ShopifyOrder }>(`/orders/${orderId}.json`);
  return response.data.order;
}

export function detectCarrier(params: {
  tracking_company?: string;
  tracking_number?: string;
  shipping_title?: string;
}): 'DPD_LT' | 'OMNIVA' | null {
  const c = (params.tracking_company || '').toLowerCase();
  if (c.includes('dpd')) return 'DPD_LT';
  if (c.includes('omniva')) return 'OMNIVA';

  const tn = (params.tracking_number || '').trim();
  if (/^\d{8,}$/.test(tn)) return 'DPD_LT';
  if (/^CC.+EE$/i.test(tn)) return 'OMNIVA';

  const st = (params.shipping_title || '').toLowerCase();
  if (st.includes('dpd')) return 'DPD_LT';
  if (st.includes('omniva')) return 'OMNIVA';

  return null;
}
