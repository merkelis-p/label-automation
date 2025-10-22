import { Router } from 'express';
import { getOrders, getPrintJobs, getPrinterStatus } from '../controllers/api.controller.js';
import { retryPrintJob } from '../controllers/mock.controller.js';

const router = Router();

router.get('/orders', getOrders);
router.get('/print-jobs', getPrintJobs);
router.get('/printer-status', getPrinterStatus);
router.post('/print-jobs/:jobId/retry', retryPrintJob);

export default router;
