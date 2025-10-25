import { Router } from 'express';
import { seedTestData, mockFulfillment, startAutoGenerate, stopAutoGenerate } from '../controllers/mock.controller.js';
import { getRecentShopifyOrders, checkPrinterCapabilities } from '../controllers/test.controller.js';
import { testDPDLabel, testOMNIVALabel, testBothCarriers } from '../controllers/makecommerce-test.controller.js';
const router = Router();
// Shopify data
router.get('/shopify-orders', getRecentShopifyOrders);
router.post('/seed', seedTestData);
// PrintNode capabilities
router.get('/printer-capabilities', checkPrinterCapabilities);
// Mock fulfillments (fake data)
router.post('/mock-fulfillment', mockFulfillment);
router.post('/auto-generate/start', startAutoGenerate);
router.post('/auto-generate/stop', stopAutoGenerate);
// MakeCommerce test API (real labels with test credentials)
router.post('/makecommerce/dpd', testDPDLabel);
router.post('/makecommerce/omniva', testOMNIVALabel);
router.post('/makecommerce/both', testBothCarriers);
export default router;
//# sourceMappingURL=test.routes.js.map