import { ShopifyOrder } from '../types/index.js';
export declare function getOrder(orderId: number): Promise<ShopifyOrder>;
export declare function getOrderByGid(gid: string): Promise<ShopifyOrder>;
export declare function listRecentOrders(limit?: number): Promise<ShopifyOrder[]>;
export declare function detectCarrier(params: {
    tracking_company?: string;
    tracking_number?: string;
    shipping_title?: string;
}): 'DPD_LT' | 'OMNIVA' | null;
//# sourceMappingURL=shopify.service.d.ts.map