import { faker } from '@faker-js/faker'
import { type Store, storePlatforms, storeStatuses } from './schema'

// 设置固定种子以确保数据一致性
faker.seed(98765)

// 生成模拟店铺数据
export const stores: Store[] = Array.from({ length: 20 }, () => {
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

// 平台统计
export const platformStats = {
  shopify: stores.filter(store => store.platform === 'shopify').length,
  ebay: stores.filter(store => store.platform === 'ebay').length,
  tiktok: stores.filter(store => store.platform === 'tiktok').length,
  amazon: stores.filter(store => store.platform === 'amazon').length,
}

// 状态统计
export const statusStats = {
  active: stores.filter(store => store.status === 'active').length,
  inactive: stores.filter(store => store.status === 'inactive').length,
  suspended: stores.filter(store => store.status === 'suspended').length,
  pending: stores.filter(store => store.status === 'pending').length,
}
