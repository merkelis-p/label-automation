import { Request, Response } from 'express';

export async function handleFulfillmentCreate(req: Request, res: Response) {
  try {
    console.log('✅ Fulfillment webhook received:', req.body);
    
    // For now, just acknowledge the webhook
    // Real implementation would parse the webhook, create labels, and print
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleOrdersPaid(_req: Request, res: Response) {
  res.status(200).json({ received: true });
}
