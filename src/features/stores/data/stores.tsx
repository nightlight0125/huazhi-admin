import { faker } from '@faker-js/faker'
import { type Store, storePlatforms, storeStatuses } from './schema'

// 设置固定种子以确保数据一致性
faker.seed(98765)

// 预定义的店铺数据，参考设计图
const predefinedStores: Store[] = [
  {
    id: 'STORE-001',
    name: 'tdzkzg-tc',
    platform: 'shopify',
    status: 'active',
    description: 'Shopify 电商店铺',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
    url: 'https://tdzkzg-tc.myshopify.com',
    connectedAt: new Date('2025-08-01T10:06:20'),
    lastSyncAt: new Date('2025-01-20T14:30:00'),
    productCount: 156,
    orderCount: 89,
    revenue: 12500.50,
    createdAt: new Date('2025-08-01T10:06:20'),
    updatedAt: new Date('2025-01-20T14:30:00'),
  },
  {
    id: 'STORE-002',
    name: 'WooCommerce Store',
    platform: 'woocommerce',
    status: 'active',
    description: 'WordPress WooCommerce 店铺',
    logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=64&h=64&fit=crop',
    url: 'https://woocommerce-store.com',
    connectedAt: new Date('2025-01-15T09:00:00'),
    lastSyncAt: new Date('2025-01-20T10:30:00'),
    productCount: 89,
    orderCount: 45,
    revenue: 5670.30,
    createdAt: new Date('2025-01-15T09:00:00'),
    updatedAt: new Date('2025-01-20T10:30:00'),
  },
  {
    id: 'STORE-003',
    name: 'eBay Seller',
    platform: 'ebay',
    status: 'active',
    description: 'eBay 拍卖店铺',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=64&h=64&fit=crop',
    url: 'https://www.ebay.com/usr/ebay-seller',
    connectedAt: new Date('2025-01-10T08:30:00'),
    lastSyncAt: new Date('2025-01-20T16:45:00'),
    productCount: 234,
    orderCount: 156,
    revenue: 8750.25,
    createdAt: new Date('2025-01-10T08:30:00'),
    updatedAt: new Date('2025-01-20T16:45:00'),
  },
  {
    id: 'STORE-004',
    name: 'TikTok Shop',
    platform: 'tiktok',
    status: 'active',
    description: 'TikTok 电商店铺',
    logo: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=64&h=64&fit=crop',
    url: 'https://www.tiktok.com/@tiktok-shop',
    connectedAt: new Date('2025-01-18T12:00:00'),
    lastSyncAt: new Date('2025-01-20T15:45:00'),
    productCount: 67,
    orderCount: 23,
    revenue: 2890.75,
    createdAt: new Date('2025-01-18T12:00:00'),
    updatedAt: new Date('2025-01-20T15:45:00'),
  },
  {
    id: 'STORE-005',
    name: 'Etsy Handmade',
    platform: 'etsy',
    status: 'active',
    description: 'Etsy 手工艺品店铺',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=64&h=64&fit=crop',
    url: 'https://www.etsy.com/shop/handmade-store',
    connectedAt: new Date('2025-01-05T14:20:00'),
    lastSyncAt: new Date('2025-01-20T11:15:00'),
    productCount: 89,
    orderCount: 67,
    revenue: 3420.80,
    createdAt: new Date('2025-01-05T14:20:00'),
    updatedAt: new Date('2025-01-20T11:15:00'),
  },
  {
    id: 'STORE-006',
    name: 'Offline Store',
    platform: 'offline',
    status: 'active',
    description: '线下实体店铺',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=64&h=64&fit=crop',
    url: undefined,
    connectedAt: new Date('2025-01-12T10:00:00'),
    lastSyncAt: new Date('2025-01-20T08:20:00'),
    productCount: 234,
    orderCount: 178,
    revenue: 12340.60,
    createdAt: new Date('2025-01-12T10:00:00'),
    updatedAt: new Date('2025-01-20T08:20:00'),
  },
  {
    id: 'STORE-007',
    name: 'Amazon Store',
    platform: 'amazon',
    status: 'active',
    description: 'Amazon 商店',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=64&h=64&fit=crop',
    url: 'https://www.amazon.com/shops/amazon-store',
    connectedAt: new Date('2025-01-08T16:45:00'),
    lastSyncAt: new Date('2025-01-20T09:30:00'),
    productCount: 312,
    orderCount: 198,
    revenue: 15680.90,
    createdAt: new Date('2025-01-08T16:45:00'),
    updatedAt: new Date('2025-01-20T09:30:00'),
  },
]

// 生成额外的模拟店铺数据
const additionalStores: Store[] = Array.from({ length: 13 }, () => {
  const platform = faker.helpers.arrayElement(storePlatforms)
  const status = faker.helpers.arrayElement(storeStatuses)
  const connectedAt = faker.date.past({ years: 2 })
  const lastSyncAt = faker.date.recent({ days: 7 })
  
  return {
    id: `STORE-${faker.number.int({ min: 1000, max: 9999 })}`,
    name: faker.company.name() + ' Store',
    platform,
    status,
    description: faker.commerce.productDescription(),
    logo: faker.image.url({ width: 64, height: 64 }),
    url: faker.internet.url(),
    connectedAt: status === 'active' ? connectedAt : undefined,
    lastSyncAt: status === 'active' ? lastSyncAt : undefined,
    productCount: faker.number.int({ min: 0, max: 1000 }),
    orderCount: faker.number.int({ min: 0, max: 500 }),
    revenue: faker.number.float({ min: 0, max: 100000, fractionDigits: 2 }),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),
  }
})

// 合并预定义和生成的店铺数据
export const stores: Store[] = [...predefinedStores, ...additionalStores]

// 平台统计
export const platformStats = {
  shopify: stores.filter(store => store.platform === 'shopify').length,
  woocommerce: stores.filter(store => store.platform === 'woocommerce').length,
  ebay: stores.filter(store => store.platform === 'ebay').length,
  tiktok: stores.filter(store => store.platform === 'tiktok').length,
  etsy: stores.filter(store => store.platform === 'etsy').length,
  offline: stores.filter(store => store.platform === 'offline').length,
  amazon: stores.filter(store => store.platform === 'amazon').length,
}

// 状态统计
export const statusStats = {
  active: stores.filter(store => store.status === 'active').length,
  inactive: stores.filter(store => store.status === 'inactive').length,
  suspended: stores.filter(store => store.status === 'suspended').length,
  pending: stores.filter(store => store.status === 'pending').length,
}
