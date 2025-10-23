export async function handleFulfillmentCreate(req, res) {
    try {
        console.log('✅ Fulfillment webhook received:', req.body);
        // For now, just acknowledge the webhook
        // Real implementation would parse the webhook, create labels, and print
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export async function handleOrdersPaid(_req, res) {
    res.status(200).json({ received: true });
}
//# sourceMappingURL=webhooks.controller.js.map