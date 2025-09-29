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

// 国家配置
export const locations = [
  {
    value: 'china',
    label: '中国',
    icon: () => (
      <div className="size-2 rounded-full bg-red-500" />
    ),
  },
  {
    value: 'usa',
    label: '美国',
    icon: () => (
      <div className="size-2 rounded-full bg-blue-500" />
    ),
  },
  {
    value: 'japan',
    label: '日本',
    icon: () => (
      <div className="size-2 rounded-full bg-green-500" />
    ),
  },
  {
    value: 'germany',
    label: '德国',
    icon: () => (
      <div className="size-2 rounded-full bg-yellow-500" />
    ),
  },
  {
    value: 'uk',
    label: '英国',
    icon: () => (
      <div className="size-2 rounded-full bg-purple-500" />
    ),
  },
  {
    value: 'france',
    label: '法国',
    icon: () => (
      <div className="size-2 rounded-full bg-orange-500" />
    ),
  },
]

// 价格区间配置
export const priceRanges = [
  { label: '$0-100', value: '0-100' },
  { label: '$100-500', value: '100-500' },
  { label: '$500-1000', value: '500-1000' },
  { label: '$1000-5000', value: '1000-5000' },
  { label: '$5000+', value: '5000+' },
]

// 生成模拟产品数据
// 添加一个固定的测试产品
const testProduct: Product = {
  id: 'PROD-1513',
  name: '多层设计小型动物笼子',
  image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
  shippingLocation: shippingLocations[0],
  category: productCategories[0],
  price: 89.99,
  sku: 'RQE65-001',
  sales: 150,
  isPublic: true,
  isRecommended: true,
  isFavorite: false,
  isMyStore: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
}

export const products: Product[] = [
  testProduct,
  ...Array.from({ length: 99 }, (_, index) => {
    const category = faker.helpers.arrayElement(productCategories)
    const location = faker.helpers.arrayElement(shippingLocations)
    const price = faker.number.float({ min: 10, max: 10000, fractionDigits: 2 })
    
    // 根据索引分配不同的分类属性
    const isPublic = faker.datatype.boolean({ probability: 0.8 }) // 80% 概率在公共目录
    const isRecommended = faker.datatype.boolean({ probability: 0.2 }) // 20% 概率为推荐产品
    const isFavorite = faker.datatype.boolean({ probability: 0.15 }) // 15% 概率为喜欢的产品
    const isMyStore = index < 20 // 前20个产品为我的店铺产品
    
    return {
      id: `PROD-${faker.number.int({ min: 1000, max: 9999 })}`,
      name: faker.commerce.productName(),
      image: faker.image.url({ width: 300, height: 300 }),
      shippingLocation: location,
      price,
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      category,
      sales: faker.number.int({ min: 0, max: 10000 }),
      // 分类相关字段
      isPublic,
      isRecommended,
      isFavorite,
      isMyStore,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
    }
  })
]
