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

export const config: Config = {
  port: Number(process.env.PORT) || 3000,
  shopify: {
    domain: process.env.SHOPIFY_STORE_DOMAIN || '',
    adminToken: process.env.SHOPIFY_ADMIN_TOKEN || '',
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
  },
  makecommerce: {
    env: (process.env.MC_ENV as 'live' | 'test') || 'live',
    shopId: process.env.MC_SHOP_ID || '',
    shopSecret: process.env.MC_SHOP_SECRET || '',
    baseUrl: process.env.MC_BASE_OVERRIDE || 
      (process.env.MC_ENV === 'live' 
        ? 'https://api.maksekeskus.ee'
        : 'https://api-test.maksekeskus.ee'),
  },
  carriers: {
    dpd: {
      apiKey: process.env.CARRIER_DPD_API_KEY || '',
    },
    omniva: {
      username: process.env.CARRIER_OMNIVA_USERNAME || '',
      password: process.env.CARRIER_OMNIVA_PASSWORD || '',
    },
  },
  sender: {
    name: process.env.SENDER_NAME || '',
    phone: process.env.SENDER_PHONE || '',
    email: process.env.SENDER_EMAIL || '',
    postal: process.env.SENDER_POSTAL || '',
  },
  labelFormat: process.env.LABEL_FORMAT || 'A6_FULL_PAGE',
  printnode: {
    apiKey: process.env.PRINTNODE_API_KEY || '',
    printerId: process.env.PRINTNODE_PRINTER_ID || '',
  },
};
