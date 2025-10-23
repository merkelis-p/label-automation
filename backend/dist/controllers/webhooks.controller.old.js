import { v4 as uuidv4 } from 'uuid';
import { store } from '../store.js';
import { getOrder, detectCarrier } from '../services/shopify.service.js';
import { createLabels } from '../services/makecommerce.service.js';
import { printLabel } from '../services/printnode.service.js';
import { broadcastUpdate } from '../websocket.js';
const log = (...args) => console.log(new Date().toISOString(), ...args);
export async function handleFulfillmentCreate(req, res) {
    try {
        const f = req.body?.fulfillment || req.body;
        const orderId = f?.order_id || f?.orderId;
        const fulfillmentId = f?.id || f?.fulfillment_id;
        const trackingNumber = (Array.isArray(f?.tracking_numbers)
            ? f.tracking_numbers[0]
            : f?.tracking_number) || '';
        const trackingCompany = f?.tracking_company || '';
        log('Incoming fulfillment:', {
            orderId,
            fulfillmentId,
            trackingNumber,
            trackingCompany,
        });
        if (!orderId || !trackingNumber) {
            res.status(202).end();
            return;
        }
        // Fetch full order
        let order;
        try {
            order = await getOrder(orderId);
        }
        catch (err) {
            log('Shopify API error:', err.response?.status, err.message);
            res.status(202).end();
            return;
        }
        const shippingTitle = order.shipping_lines?.[0]?.title || '';
        const carrier = detectCarrier({
            tracking_company: trackingCompany,
            tracking_number: trackingNumber,
            shipping_title: shippingTitle,
        });
        if (!carrier) {
            log('Carrier not detected for order', order.name);
            res.status(202).end();
            return;
        }
        // Extract locker ID from note_attributes
        const attrs = Array.isArray(order.note_attributes)
            ? order.note_attributes
            : [];
        const attrMap = Object.fromEntries(attrs.map((a) => [String(a.name).trim(), String(a.value).trim()]));
        const lockerId = attrMap.parcelId || attrMap.parcelID || attrMap.parcel_id || '';
        // Build destination
        const a = order.shipping_address || {};
        const destination = {
            postalCode: (a.zip || '').toString(),
            country: (a.country_code || a.country_code_v2 || a.country || '')
                .toString()
                .slice(0, 2)
                .toUpperCase(),
            county: (a.province || '').toString(),
            city: (a.city || '').toString(),
            street: [a.address1, a.address2].filter(Boolean).join(', '),
        };
        const recipient = {
            name: [a.first_name, a.last_name].filter(Boolean).join(' ') ||
                [order.customer?.first_name, order.customer?.last_name]
                    .filter(Boolean)
                    .join(' ') ||
                'Customer',
            phone: a.phone || order.phone || order.customer?.phone || '',
            email: order.email || order.customer?.email || '',
        };
        const isApt = !!lockerId ||
            /paštom|postomat|parcel\s?terminal|locker/i.test(shippingTitle);
        const orderRef = order.name || `#${order.order_number}`;
        // Create order record
        const fulfilledOrder = {
            id: uuidv4(),
            orderId: String(orderId),
            orderName: orderRef,
            fulfillmentId: String(fulfillmentId),
            carrier,
            trackingNumber,
            shipmentId: trackingNumber,
            lockerId: isApt ? lockerId : undefined,
            isApt,
            recipient,
            destination: isApt ? undefined : destination,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        store.addOrder(fulfilledOrder);
        broadcastUpdate({ type: 'order_added', order: fulfilledOrder });
        // Create label
        try {
            const { labelUrl, pdfBuffer } = await createLabels({
                carrier,
                shipmentId: trackingNumber,
                orderRef: isApt ? `${orderRef}.APT` : `${orderRef}.COURIER`,
                lockerId: isApt ? lockerId : undefined,
                destination: isApt ? undefined : destination,
                recipient,
            });
            store.updateOrder(fulfilledOrder.id, {
                labelUrl,
                labelPdfBuffer: pdfBuffer,
                status: 'label_created',
            });
            broadcastUpdate({
                type: 'label_created',
                orderId: fulfilledOrder.id,
                labelUrl,
            });
            // Print
            try {
                const { jobId } = await printLabel(pdfBuffer, `Label ${orderRef}`);
                store.updateOrder(fulfilledOrder.id, {
                    printJobId: jobId,
                    status: 'printed',
                });
                store.addPrintJob({
                    id: jobId,
                    orderId: fulfilledOrder.id,
                    orderName: orderRef,
                    carrier,
                    trackingNumber,
                    printedAt: new Date(),
                    success: true,
                });
                store.updatePrinterStatus({ lastPrintTime: new Date() });
                broadcastUpdate({
                    type: 'printed',
                    orderId: fulfilledOrder.id,
                    jobId,
                });
                log('✅ Label printed:', { order: orderRef, jobId });
            }
            catch (printErr) {
                log('❌ Print error:', printErr.message);
                store.updateOrder(fulfilledOrder.id, {
                    status: 'error',
                    error: `Print failed: ${printErr.message}`,
                });
                store.updatePrinterStatus({ lastError: printErr.message });
                broadcastUpdate({
                    type: 'error',
                    orderId: fulfilledOrder.id,
                    error: printErr.message,
                });
            }
        }
        catch (labelErr) {
            log('❌ Label creation error:', labelErr.message);
            store.updateOrder(fulfilledOrder.id, {
                status: 'error',
                error: `Label creation failed: ${labelErr.message}`,
            });
            broadcastUpdate({
                type: 'error',
                orderId: fulfilledOrder.id,
                error: labelErr.message,
            });
        }
        res.status(200).end();
    }
    catch (err) {
        log('Unhandled webhook error:', err.message);
        res.status(202).end();
    }
}
//# sourceMappingURL=webhooks.controller.old.js.map