import crypto from 'crypto';
import { config } from '../config/index.js';
export function verifyShopifyHmac(req, res, next) {
    const hmac = req.get('X-Shopify-Hmac-Sha256') || '';
    const rawBody = req.rawBody || Buffer.from('');
    const digest = crypto
        .createHmac('sha256', config.shopify.webhookSecret)
        .update(rawBody, 'utf8')
        .digest('base64');
    if (!hmac || hmac.length !== digest.length) {
        res.status(401).send('Invalid HMAC');
        return;
    }
    try {
        const isValid = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(digest));
        if (!isValid) {
            res.status(401).send('Invalid HMAC');
            return;
        }
    }
    catch {
        res.status(401).send('Invalid HMAC');
        return;
    }
    next();
}
//# sourceMappingURL=hmac.middleware.js.map