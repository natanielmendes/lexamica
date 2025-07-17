export interface OrgConfig {
  orgId: string;
  fieldMappings: Record<string, string>;
  syncRules: {
    direction: 'one-way' | 'two-way';
    fields: string[];
  }[];
  queueName: string;
  webhookEndpoint?: string;
  pollingInterval?: number;
  pollingEndpoint?: string;
  productTransform?: ((product: Product) => Product);
}

interface Product {
  name: string;
  sku: string;
  quantity: number;
  paid: boolean;
}

// Example config (to be loaded from DB or file in real implementation)
export const orgConfigs: OrgConfig[] = [
  {
    orgId: 'webhook-org',
    fieldMappings: { name: 'productName', sku: 'productSKU' },
    syncRules: [
      { direction: 'two-way', fields: ['name', 'sku', 'quantity'] },
    ],
    queueName: 'webhook-org_products',
    webhookEndpoint: process.env.WEBHOOK_ENDPOINT || 'http://localhost:4000/webhook',
  },
  // Example: polling-based integration for org2
  {
    orgId: 'polling-org',
    fieldMappings: { name: 'itemName', sku: 'itemSKU' },
    syncRules: [
      { direction: 'one-way', fields: ['name', 'sku', 'paid'] },
    ],
    queueName: 'polling-org_products',
    pollingInterval: 30000, // 30 seconds
    pollingEndpoint: process.env.POLLING_ENDPOINT || 'http://localhost:4000/paid-products',
    productTransform: (product: Product) => ({
      ...product,
      name: product.name ? product.name.toUpperCase() : product.name,
    }),
  },
];
