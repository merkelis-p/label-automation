import { Router } from 'express';
import { 
  seedTestData, 
  mockFulfillment, 
  startAutoGenerate, 
  stopAutoGenerate 
} from '../controllers/mock.controller.js';

const router = Router();

router.post('/seed', seedTestData);
router.post('/mock-fulfillment', mockFulfillment);
router.post('/auto-generate/start', startAutoGenerate);
router.post('/auto-generate/stop', stopAutoGenerate);

export default router;
