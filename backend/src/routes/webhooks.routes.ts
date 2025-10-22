import { Router } from 'express';
import { verifyShopifyHmac } from '../middleware/hmac.middleware.js';
import { handleFulfillmentCreate } from '../controllers/webhooks.controller.js';

const router = Router();

router.post('/fulfillments-create', verifyShopifyHmac, handleFulfillmentCreate);

router.post('/orders-paid', verifyShopifyHmac, (_req, res) => {
  res.status(202).end();
});

export default router;
