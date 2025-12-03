import { faker } from '@faker-js/faker'
import { type StoreProduct } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

const shippingFromOptions = ['选项1', '选项2', '选项3', '选项4'] as const
const shippingMethodOptions = [
  '请选择',
  'Standard Shipping',
  'Express Shipping',
  'TDPacket Electro',
] as const

export const storeProducts: StoreProduct[] = Array.from({ length: 100 }, () => {
  return {
    id: `SP-${faker.number.int({ min: 1000, max: 9999 })}`,
    image: faker.image.url({ width: 100, height: 100 }),
    name: faker.commerce.productName(),
    storePrice: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
    hzPrice: faker.datatype.boolean({ probability: 0.3 })
      ? parseFloat(faker.commerce.price({ min: 5, max: 80 }))
      : null,
    shippingFrom: faker.helpers.arrayElement(shippingFromOptions),
    shippingMethod: faker.datatype.boolean({ probability: 0.5 })
      ? faker.helpers.arrayElement(shippingMethodOptions)
      : null,
    storeName: faker.string.alphanumeric({ length: { min: 5, max: 10 } }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
