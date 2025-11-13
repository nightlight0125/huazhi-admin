import { faker } from '@faker-js/faker'
import { type PublishedProduct } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

const shippingFromOptions = ['China Warehouse', 'US Warehouse', 'UK Warehouse', 'Germany Warehouse']
const shippingMethodOptions = ['TDPacket Electro', 'Standard Shipping', 'Express Shipping', 'DHL']
const storeNames = ['zeloship - Shopify', 'store1 - Shopify', 'store2 - WooCommerce', 'store3 - Amazon']

export const publishedProducts: PublishedProduct[] = Array.from({ length: 50 }, () => {
  const statuses = ['published', 'publishing', 'failed'] as const
  const status = faker.helpers.arrayElement(statuses)

  return {
    id: `PP-${faker.number.int({ min: 1000, max: 9999 })}`,
    image: faker.image.url({ width: 100, height: 100 }),
    name: faker.commerce.productName(),
    spu: `SU${faker.string.numeric(8)}`,
    storeName: faker.helpers.arrayElement(storeNames),
    tdPrice: parseFloat(faker.commerce.price({ min: 1, max: 50 })),
    yourPrice: `HKD${faker.number.int({ min: 10, max: 1000 })}.${faker.string.numeric(2)}`,
    weight: faker.number.int({ min: 50, max: 5000 }),
    shippingFrom: faker.helpers.arrayElement(shippingFromOptions),
    shippingMethod: faker.helpers.arrayElement(shippingMethodOptions),
    amount: parseFloat(faker.commerce.price({ min: 1, max: 50 })),
    status,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})

