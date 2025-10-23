export interface Config {
    port: number;
    shopify: {
        domain: string;
        adminToken: string;
        webhookSecret: string;
    };
    makecommerce: {
        env: 'live' | 'test';
        shopId: string;
        shopSecret: string;
        baseUrl: string;
    };
    carriers: {
        dpd: {
            apiKey: string;
        };
        omniva: {
            username: string;
            password: string;
        };
    };
    sender: {
        name: string;
        phone: string;
        email: string;
        postal: string;
    };
    labelFormat: string;
    printnode: {
        apiKey: string;
        printerId: string;
    };
}
export declare const config: Config;
//# sourceMappingURL=index.d.ts.map