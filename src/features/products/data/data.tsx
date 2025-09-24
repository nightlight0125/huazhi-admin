import { faker } from '@faker-js/faker'
import { type Product, productCategories, shippingLocations } from './schema'

// 设置固定种子以确保数据一致性
faker.seed(67890)

// 类别配置
export const categories = [
  {
    value: 'electronics',
    label: '电子产品',
    icon: () => (
      <div className="size-2 rounded-full bg-blue-500" />
    ),
  },
  {
    value: 'clothing',
    label: '服装',
    icon: () => (
      <div className="size-2 rounded-full bg-pink-500" />
    ),
  },
  {
    value: 'home',
    label: '家居用品',
    icon: () => (
      <div className="size-2 rounded-full bg-green-500" />
    ),
  },
  {
    value: 'books',
    label: '图书',
    icon: () => (
      <div className="size-2 rounded-full bg-yellow-500" />
    ),
  },
  {
    value: 'sports',
    label: '运动用品',
    icon: () => (
      <div className="size-2 rounded-full bg-orange-500" />
    ),
  },
  {
    value: 'beauty',
    label: '美妆',
    icon: () => (
      <div className="size-2 rounded-full bg-purple-500" />
    ),
  },
]

// 发货地配置
export const locations = [
  {
    value: 'beijing',
    label: '北京',
    icon: () => (
      <div className="size-2 rounded-full bg-red-500" />
    ),
  },
  {
    value: 'shanghai',
    label: '上海',
    icon: () => (
      <div className="size-2 rounded-full bg-blue-500" />
    ),
  },
  {
    value: 'guangzhou',
    label: '广州',
    icon: () => (
      <div className="size-2 rounded-full bg-green-500" />
    ),
  },
  {
    value: 'shenzhen',
    label: '深圳',
    icon: () => (
      <div className="size-2 rounded-full bg-yellow-500" />
    ),
  },
  {
    value: 'hangzhou',
    label: '杭州',
    icon: () => (
      <div className="size-2 rounded-full bg-purple-500" />
    ),
  },
  {
    value: 'nanjing',
    label: '南京',
    icon: () => (
      <div className="size-2 rounded-full bg-orange-500" />
    ),
  },
]

// 价格区间配置
export const priceRanges = [
  { label: '0-100元', value: '0-100' },
  { label: '100-500元', value: '100-500' },
  { label: '500-1000元', value: '500-1000' },
  { label: '1000-5000元', value: '1000-5000' },
  { label: '5000元以上', value: '5000+' },
]

// 生成模拟产品数据
export const products: Product[] = Array.from({ length: 100 }, () => {
  const category = faker.helpers.arrayElement(productCategories)
  const location = faker.helpers.arrayElement(shippingLocations)
  const price = faker.number.float({ min: 10, max: 10000, fractionDigits: 2 })
  
  return {
    id: `PROD-${faker.number.int({ min: 1000, max: 9999 })}`,
    name: faker.commerce.productName(),
    image: faker.image.url({ width: 300, height: 300 }),
    shippingLocation: location,
    price,
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    category,
    sales: faker.number.int({ min: 0, max: 10000 }),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
  }
})
