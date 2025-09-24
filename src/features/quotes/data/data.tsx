import { faker } from '@faker-js/faker'
import { type Quote, quoteStatuses, qualityLevels } from './schema'

// 设置固定种子以确保数据一致性
faker.seed(54321)

// 状态配置
export const statuses = [
  {
    value: 'processing',
    label: '处理中',
    icon: () => (
      <div className="size-2 rounded-full bg-yellow-500" />
    ),
  },
  {
    value: 'success',
    label: '成功',
    icon: () => (
      <div className="size-2 rounded-full bg-green-500" />
    ),
  },
  {
    value: 'failed',
    label: '失败',
    icon: () => (
      <div className="size-2 rounded-full bg-red-500" />
    ),
  },
]

// 质量等级配置
export const qualities = [
  {
    value: 'high',
    label: '高品质',
    icon: () => (
      <div className="size-2 rounded-full bg-blue-500" />
    ),
  },
  {
    value: 'medium',
    label: '中等质量',
    icon: () => (
      <div className="size-2 rounded-full bg-orange-500" />
    ),
  },
  {
    value: 'low',
    label: '低质量',
    icon: () => (
      <div className="size-2 rounded-full bg-gray-500" />
    ),
  },
]

// 生成模拟询价数据
export const quotes: Quote[] = Array.from({ length: 50 }, () => {
  const status = faker.helpers.arrayElement(quoteStatuses)
  const quality = faker.helpers.arrayElement(qualityLevels)
  const imageCount = faker.number.int({ min: 1, max: 5 })
  
  return {
    id: `QUOTE-${faker.number.int({ min: 1000, max: 9999 })}`,
    productName: faker.commerce.productName(),
    productUrl: faker.datatype.boolean() ? faker.internet.url() : '',
    images: Array.from({ length: imageCount }, () => 
      faker.image.url({ width: 300, height: 300 })
    ),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    status,
    price: status === 'success' ? faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }) : undefined,
    budget: faker.number.float({ min: 50, max: 2000, fractionDigits: 2 }),
    quality,
    acceptSimilar: faker.datatype.boolean(),
    description: faker.lorem.sentence({ min: 10, max: 30 }),
    notes: faker.datatype.boolean() ? faker.lorem.paragraph() : '',
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),
  }
})
