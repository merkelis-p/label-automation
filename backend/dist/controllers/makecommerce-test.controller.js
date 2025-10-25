import axios from 'axios';
import { store } from '../store.js';
import { broadcastUpdate } from '../websocket.js';
import { printLabel } from '../services/printnode.service.js';
import { config } from '../config/index.js';
import { toA6WithMarginsAndScale } from '../utils/pdf-utils.js';
/**
 * MakeCommerce Test Controller
 *
 * This controller provides endpoints to test the MakeCommerce API using their test environment.
 * It uses test credentials and test API endpoints to generate real labels without affecting production data.
 * These endpoints also create orders in the dashboard so you can see them in the UI.
 *
 * Test Environment:
 * - API URL: https://api.test.maksekeskus.ee
 * - Shop ID: 63121088-b09d-4dab-95b5-a6b91069746b
 * - Secret: vmbyNuJvkEoyU47H98YcYXlDL8b8wKcnfN07X9crb47QVPPImRDP0Wad9m1sQweA
 */
const MAKECOMMERCE_TEST_CONFIG = {
    apiUrl: 'https://api.test.maksekeskus.ee',
    shopId: '63121088-b09d-4dab-95b5-a6b91069746b',
    secretKey: 'vmbyNuJvkEoyU47H98YcYXlDL8b8wKcnfN07X9crb47QVPPImRDP0Wad9m1sQweA',
    // Test credentials for carriers
    carriers: {
        DPD_LT: {
            username: 'testuser1',
            password: 'testpassword1',
        },
        OMNIVA: {
            username: '45041',
            password: '27T<9"m^F1',
        },
    },
};
/**
 * Helper function to create a test order in the store and optionally print it
 */
async function createTestOrder(orderId, carrier, shipmentId, destinationId, labelUrl, autoPrint = false) {
    // Generate a fake Shopify GID using timestamp as order ID
    const fakeShopifyOrderId = Date.now();
    const shopifyGid = `gid://shopify/Order/${fakeShopifyOrderId}`;
    const order = {
        id: orderId,
        shopifyOrderId: shopifyGid,
        carrier,
        trackingNumber: shipmentId,
        lockerId: destinationId,
        labelUrl,
        status: labelUrl.includes('placeholder') ? 'pending' : 'label_created',
        createdAt: new Date().toISOString(),
    };
    store.addOrder(order);
    broadcastUpdate('order_update', order);
    console.log(`📦 Test order created in store: ${orderId} (Shopify GID: ${shopifyGid})`);
    // Auto-print if requested and PrintNode is configured
    if (autoPrint && config.printnode.apiKey && config.printnode.printerId) {
        try {
            console.log(`🖨️  Auto-printing label for ${orderId}...`);
            // Download the PDF
            const pdfResponse = await axios.get(labelUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
            });
            const originalPdfBuffer = Buffer.from(pdfResponse.data);
            // Pre-process: Convert to A6 with margins and 90% scale
            const processedPdfBuffer = await toA6WithMarginsAndScale(originalPdfBuffer);
            // Send to PrintNode
            const printResult = await printLabel(processedPdfBuffer, `Label ${shipmentId}`);
            // Create print job record
            const printJob = {
                id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                orderId: order.id,
                printerId: config.printnode.printerId,
                status: 'printing',
                createdAt: new Date().toISOString(),
                completedAt: undefined,
            };
            store.addPrintJob(printJob);
            broadcastUpdate('print_update', printJob);
            // Update to completed after a delay
            setTimeout(() => {
                const completedJob = {
                    ...printJob,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                };
                broadcastUpdate('print_update', completedJob);
                // Update order status to printed
                store.updateOrder(order.id, { status: 'printed' });
                const updatedOrder = store.getOrder(order.id);
                if (updatedOrder) {
                    broadcastUpdate('order_update', updatedOrder);
                }
            }, 3000);
            console.log(`✅ Print job sent to PrintNode: ${printResult.jobId}`);
        }
        catch (error) {
            console.error(`❌ Failed to auto-print label:`, error.message);
        }
    }
}
/**
 * Helper function to get placeholder PDF URL
 */
function getPlaceholderUrl() {
    return `${process.env.APP_BASE_URL || 'http://localhost:3000'}/labels/placeholder.pdf`;
}
/**
 * Verify if a label URL is reachable, fallback to placeholder if not
 */
async function verifyLabelUrl(url) {
    if (!url) {
        console.warn('⚠️ No label URL returned, using placeholder');
        return getPlaceholderUrl();
    }
    try {
        await axios.head(url, { timeout: 3000 });
        console.log('✅ Label URL is reachable:', url);
        return url;
    }
    catch (error) {
        console.warn('⚠️ Label URL not reachable, using placeholder:', url, error.message);
        return getPlaceholderUrl();
    }
}
/**
 * Test DPD Lithuania label generation
 * POST /api/test/makecommerce/dpd?print=true
 */
export const testDPDLabel = async (req, res) => {
    try {
        const { destinationId = 'LT90008', // Default DPD locker ID
        recipientName = 'Test Robot', recipientPhone = '37258875115', recipientEmail = 'mk.test@maksekeskus.ee', } = req.body;
        // Check if auto-print is requested via query parameter
        const autoPrint = req.query.print === 'true';
        const orderId = `order ${Date.now()}`; // Use "order" prefix like in working example
        const shipmentId = generateShipmentId();
        const payload = {
            credentials: [
                {
                    carrier: 'DPD_LT',
                    username: MAKECOMMERCE_TEST_CONFIG.carriers.DPD_LT.username,
                    password: MAKECOMMERCE_TEST_CONFIG.carriers.DPD_LT.password,
                },
            ],
            orders: [
                {
                    orderId,
                    carrier: 'DPD_LT',
                    destination: {
                        destinationId,
                    },
                    sender: {
                        name: 'myTestShop.com',
                        street: 'Test',
                        city: 'test',
                        country: 'EE',
                        postal_code: '10111',
                        phone: '37258875115',
                        email: 'support@mytestshop.com',
                    },
                    recipient: {
                        name: recipientName,
                        phone: recipientPhone,
                        email: recipientEmail,
                    },
                    shipmentId,
                },
            ],
            app_info: {
                module: 'Label-Automation',
                module_version: '1.0.0',
                platform: 'Node.js',
                platform_version: process.version,
            },
            printFormat: 'A6_FULL_PAGE',
        };
        console.log('🧪 Testing DPD_LT label generation...');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(`${MAKECOMMERCE_TEST_CONFIG.apiUrl}/v1/shipments/createlabels`, payload, {
            auth: {
                username: MAKECOMMERCE_TEST_CONFIG.shopId,
                password: MAKECOMMERCE_TEST_CONFIG.secretKey,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('✅ DPD_LT response:', response.data);
        // Verify label URL or use placeholder
        const labelUrl = await verifyLabelUrl(response.data?.labelUrl);
        // Create order in store so it appears in the UI (with auto-print if requested)
        await createTestOrder(orderId, 'DPD_LT', shipmentId, destinationId, labelUrl, autoPrint);
        res.json({
            success: true,
            carrier: 'DPD_LT',
            orderId,
            shipmentId,
            destinationId,
            labelUrl,
            autoPrint,
            response: response.data,
        });
    }
    catch (error) {
        console.error('❌ DPD_LT label generation failed:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data || error.message,
        });
    }
};
/**
 * Test OMNIVA label generation
 * POST /api/test/makecommerce/omniva
 */
export const testOMNIVALabel = async (req, res) => {
    try {
        const { destinationId = '96077', // Default OMNIVA terminal ID
        recipientName = 'Test Robot', recipientPhone = '37258875115', recipientEmail = 'mk.test@maksekeskus.ee', } = req.body;
        // Check if auto-print is requested via query parameter
        const autoPrint = req.query.print === 'true';
        const orderId = `order ${Date.now()}`; // Use "order" prefix like in working example
        const shipmentId = generateOMNIVAShipmentId();
        const payload = {
            credentials: [
                {
                    carrier: 'OMNIVA',
                    username: MAKECOMMERCE_TEST_CONFIG.carriers.OMNIVA.username,
                    password: MAKECOMMERCE_TEST_CONFIG.carriers.OMNIVA.password,
                },
            ],
            orders: [
                {
                    orderId,
                    carrier: 'OMNIVA',
                    destination: {
                        destinationId,
                    },
                    recipient: {
                        name: recipientName,
                        phone: recipientPhone,
                        email: recipientEmail,
                    },
                    sender: {
                        name: 'myTestShop.com',
                        phone: '37258875115',
                        email: 'support@mytestshop.com',
                        postalCode: '96104',
                    },
                    shipmentId,
                },
            ],
            app_info: {
                module: 'Label-Automation',
                module_version: '1.0.0',
                platform: 'Node.js',
                platform_version: process.version,
            },
            printFormat: 'A6_FULL_PAGE',
        };
        console.log('🧪 Testing OMNIVA label generation...');
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(`${MAKECOMMERCE_TEST_CONFIG.apiUrl}/v1/shipments/createlabels`, payload, {
            auth: {
                username: MAKECOMMERCE_TEST_CONFIG.shopId,
                password: MAKECOMMERCE_TEST_CONFIG.secretKey,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('✅ OMNIVA response:', response.data);
        // Verify label URL or use placeholder
        const labelUrl = await verifyLabelUrl(response.data?.labelUrl);
        // Create order in store so it appears in the UI (with auto-print if requested)
        await createTestOrder(orderId, 'OMNIVA', shipmentId, destinationId, labelUrl, autoPrint);
        res.json({
            success: true,
            carrier: 'OMNIVA',
            orderId,
            shipmentId,
            destinationId,
            labelUrl,
            autoPrint,
            response: response.data,
        });
    }
    catch (error) {
        console.error('❌ OMNIVA label generation failed:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data || error.message,
        });
    }
};
/**
 * Test both carriers
 * POST /api/test/makecommerce/both
 */
export const testBothCarriers = async (req, res) => {
    try {
        // Check if auto-print is requested via query parameter
        const autoPrint = req.query.print === 'true';
        const results = {
            dpd: null,
            omniva: null,
        };
        // Test DPD
        try {
            const dpdOrderId = `order ${Date.now()}`;
            const dpdShipmentId = generateShipmentId();
            const dpdPayload = {
                credentials: [
                    {
                        carrier: 'DPD_LT',
                        username: MAKECOMMERCE_TEST_CONFIG.carriers.DPD_LT.username,
                        password: MAKECOMMERCE_TEST_CONFIG.carriers.DPD_LT.password,
                    },
                ],
                orders: [
                    {
                        orderId: dpdOrderId,
                        carrier: 'DPD_LT',
                        destination: {
                            destinationId: 'LT90008',
                        },
                        sender: {
                            name: 'myTestShop.com',
                            street: 'Test',
                            city: 'test',
                            country: 'EE',
                            postal_code: '10111',
                            phone: '37258875115',
                            email: 'support@mytestshop.com',
                        },
                        recipient: {
                            name: 'Test Robot',
                            phone: '37258875115',
                            email: 'mk.test@maksekeskus.ee',
                        },
                        shipmentId: dpdShipmentId,
                    },
                ],
                app_info: {
                    module: 'Label-Automation',
                    module_version: '1.0.0',
                    platform: 'Node.js',
                    platform_version: process.version,
                },
                printFormat: 'A6_FULL_PAGE',
            };
            const dpdResponse = await axios.post(`${MAKECOMMERCE_TEST_CONFIG.apiUrl}/v1/shipments/createlabels`, dpdPayload, {
                auth: {
                    username: MAKECOMMERCE_TEST_CONFIG.shopId,
                    password: MAKECOMMERCE_TEST_CONFIG.secretKey,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const dpdLabelUrl = await verifyLabelUrl(dpdResponse.data?.labelUrl);
            // Create order in store (with auto-print if requested)
            await createTestOrder(dpdOrderId, 'DPD_LT', dpdShipmentId, 'LT90008', dpdLabelUrl, autoPrint);
            results.dpd = {
                success: true,
                orderId: dpdOrderId,
                shipmentId: dpdShipmentId,
                labelUrl: dpdLabelUrl,
                response: dpdResponse.data,
            };
            console.log('✅ DPD_LT test successful');
        }
        catch (error) {
            results.dpd = {
                success: false,
                error: error.response?.data || error.message,
            };
            console.error('❌ DPD_LT test failed:', error.response?.data || error.message);
        }
        // Test OMNIVA
        try {
            const omnivaOrderId = `order ${Date.now()}`;
            const omnivaShipmentId = generateOMNIVAShipmentId();
            const omnivaPayload = {
                credentials: [
                    {
                        carrier: 'OMNIVA',
                        username: MAKECOMMERCE_TEST_CONFIG.carriers.OMNIVA.username,
                        password: MAKECOMMERCE_TEST_CONFIG.carriers.OMNIVA.password,
                    },
                ],
                orders: [
                    {
                        orderId: omnivaOrderId,
                        carrier: 'OMNIVA',
                        destination: {
                            destinationId: '96077',
                        },
                        recipient: {
                            name: 'Test Robot',
                            phone: '37258875115',
                            email: 'mk.test@maksekeskus.ee',
                        },
                        sender: {
                            name: 'myTestShop.com',
                            phone: '37258875115',
                            email: 'support@mytestshop.com',
                            postalCode: '96104',
                        },
                        shipmentId: omnivaShipmentId,
                    },
                ],
                app_info: {
                    module: 'Label-Automation',
                    module_version: '1.0.0',
                    platform: 'Node.js',
                    platform_version: process.version,
                },
                printFormat: 'A6_FULL_PAGE',
            };
            const omnivaResponse = await axios.post(`${MAKECOMMERCE_TEST_CONFIG.apiUrl}/v1/shipments/createlabels`, omnivaPayload, {
                auth: {
                    username: MAKECOMMERCE_TEST_CONFIG.shopId,
                    password: MAKECOMMERCE_TEST_CONFIG.secretKey,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const omnivaLabelUrl = await verifyLabelUrl(omnivaResponse.data?.labelUrl);
            // Create order in store (with auto-print if requested)
            await createTestOrder(omnivaOrderId, 'OMNIVA', omnivaShipmentId, '96077', omnivaLabelUrl, autoPrint);
            results.omniva = {
                success: true,
                orderId: omnivaOrderId,
                shipmentId: omnivaShipmentId,
                labelUrl: omnivaLabelUrl,
                response: omnivaResponse.data,
            };
            console.log('✅ OMNIVA test successful');
        }
        catch (error) {
            results.omniva = {
                success: false,
                error: error.response?.data || error.message,
            };
            console.error('❌ OMNIVA test failed:', error.response?.data || error.message);
        }
        res.json({
            success: true,
            results,
        });
    }
    catch (error) {
        console.error('❌ Test both carriers failed:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
// Helper functions
function generateShipmentId() {
    // Use a working test shipment ID for DPD_LT
    // MakeCommerce test environment requires pre-existing shipment IDs
    return '05809023683874';
}
function generateOMNIVAShipmentId() {
    // Use a working test shipment ID for OMNIVA
    // MakeCommerce test environment requires pre-existing shipment IDs
    return 'CC404086970EE';
}
//# sourceMappingURL=makecommerce-test.controller.js.map