import axios from 'axios';
import { config } from '../config/index.js';
// Ensure we're using the .myshopify.com domain for API calls
const getShopifyDomain = (domain) => {
    // If it's already a .myshopify.com domain, use it as-is
    if (domain.includes('.myshopify.com')) {
        return domain;
    }
    // If it's a custom domain, we need to convert it
    // For now, extract the store name and append .myshopify.com
    // Example: doshabliss.lt -> doshabliss.myshopify.com
    const storeName = domain.split('.')[0];
    return `${storeName}.myshopify.com`;
};
const shopify = axios.create({
    baseURL: `https://${getShopifyDomain(config.shopify.domain)}/admin/api/2024-10`,
    headers: {
        'X-Shopify-Access-Token': config.shopify.adminToken,
    },
    timeout: 30000,
});
console.log('🏪 Shopify API configured:', {
    domain: config.shopify.domain,
    apiDomain: getShopifyDomain(config.shopify.domain),
    baseURL: `https://${getShopifyDomain(config.shopify.domain)}/admin/api/2024-10`,
});
export async function getOrder(orderId) {
    const response = await shopify.get(`/orders/${orderId}.json`);
    const order = response.data.order;
    // Enrich line items with product images
    if (order.line_items && order.line_items.length > 0) {
        await enrichLineItemsWithImages(order.line_items);
    }
    return order;
}
async function enrichLineItemsWithImages(lineItems) {
    // Fetch product images for all line items
    const productImagePromises = lineItems.map(async (item) => {
        if (item.product_id) {
            try {
                console.log(`Fetching product images for product ${item.product_id}...`);
                const response = await shopify.get(`/products/${item.product_id}.json`);
                const product = response.data.product;
                console.log(`Product ${item.product_id} has ${product.images?.length || 0} images`);
                // Find the variant image or use the first product image
                if (product.images && product.images.length > 0) {
                    const variantImage = product.images.find((img) => img.variant_ids && img.variant_ids.includes(item.variant_id));
                    item.image = {
                        src: variantImage?.src || product.images[0].src,
                        alt: product.title
                    };
                    console.log(`Set image for product ${item.product_id}:`, item.image.src);
                }
                else {
                    console.log(`No images found for product ${item.product_id}`);
                }
            }
            catch (error) {
                console.error(`Failed to fetch product ${item.product_id}:`, error.message);
                console.error('Error details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    url: error.config?.url,
                });
            }
        }
    });
    await Promise.all(productImagePromises);
}
export async function getOrderByGid(gid) {
    // Extract numeric ID from gid://shopify/Order/123456
    const orderId = gid.replace('gid://shopify/Order/', '');
    console.log('Extracted order ID:', orderId);
    return getOrder(Number(orderId));
}
export async function listRecentOrders(limit = 10) {
    try {
        const response = await shopify.get('/orders.json', {
            params: {
                limit,
                status: 'any',
                fields: 'id,name,created_at,customer,total_price,line_items'
            }
        });
        return response.data.orders;
    }
    catch (error) {
        console.error('Failed to fetch recent orders:', error);
        throw error;
    }
}
export function detectCarrier(params) {
    const c = (params.tracking_company || '').toLowerCase();
    if (c.includes('dpd'))
        return 'DPD_LT';
    if (c.includes('omniva'))
        return 'OMNIVA';
    const tn = (params.tracking_number || '').trim();
    if (/^\d{8,}$/.test(tn))
        return 'DPD_LT';
    if (/^CC.+EE$/i.test(tn))
        return 'OMNIVA';
    const st = (params.shipping_title || '').toLowerCase();
    if (st.includes('dpd'))
        return 'DPD_LT';
    if (st.includes('omniva'))
        return 'OMNIVA';
    return null;
}
//# sourceMappingURL=shopify.service.js.map