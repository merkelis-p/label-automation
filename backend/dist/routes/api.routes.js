import { Router } from 'express';
import { getOrders, getOrderDetails, getPrintJobs, getPrinterStatus, proxyPdf, clearAllData, fetchRealOrders } from '../controllers/api.controller.js';
import { retryPrintJob } from '../controllers/mock.controller.js';
const router = Router();
router.get('/orders', getOrders);
router.get('/orders/:shopifyOrderId', getOrderDetails);
router.get('/print-jobs', getPrintJobs);
router.get('/printer-status', getPrinterStatus);
router.post('/print-jobs/:jobId/retry', retryPrintJob);
router.get('/proxy-pdf', proxyPdf);
router.post('/clear', clearAllData);
router.get('/fetch-real-orders', fetchRealOrders);
export default router;
//# sourceMappingURL=api.routes.js.map