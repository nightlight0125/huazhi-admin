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

// 固定的店铺名称列表
const storeNames = [
  'zeloship',
  'techstore',
  'fashionhub',
  'homegoods',
  'sportsworld',
  'beautyshop',
  'bookstore',
  'electronics',
  'outdoorgear',
  'giftstore',
]

export const storeProducts: StoreProduct[] = (() => {
  const products: StoreProduct[] = []
  let productIndex = 0

  // 为每个店铺生成多个产品
  storeNames.forEach((storeName, storeIndex) => {
    // 每个店铺生成 3-8 个产品
    const productCount = faker.number.int({ min: 3, max: 8 })
    
    for (let i = 0; i < productCount; i++) {
      // 前4个店铺的产品设置为 associated，其余为 not-associated
      const associateStatus =
        storeIndex < 4
          ? ('associated' as const)
          : storeIndex < 8
            ? ('not-associated' as const)
            : undefined

      products.push({
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
        storeName,
        associateStatus,
        status: faker.datatype.boolean({ probability: 0.7 })
          ? 'active'
          : 'inactive',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      })
      
      productIndex++
    }
  })

  return products
})()
