import { faker } from '@faker-js/faker'

// 设置固定种子以确保数据生成的一致性
faker.seed(12345)

// 发货地选项
export const shippingFromOptions = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
  { value: 'hangzhou', label: '杭州' },
  { value: 'nanjing', label: '南京' },
]

// 国家选项
export const countryOptions = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
]

// 运输方式数据结构
export interface ShippingMethod {
  id: string
  name: string
  estimatedDays: string
  fee: number
  country: string
}

// 按国家分组的运输方式
export const shippingMethodsByCountry: Record<string, ShippingMethod[]> = {
  uk: [
    { id: 'ds-economy-uk', name: 'DS Economy line', estimatedDays: '10 - 12', fee: 3.07, country: 'uk' },
    { id: 'ds-standard-uk', name: 'DS Standard line', estimatedDays: '5 - 8', fee: 3.20, country: 'uk' },
    { id: 'ds-express-uk', name: 'DS Express line', estimatedDays: '3 - 5', fee: 5.50, country: 'uk' },
  ],
  us: [
    { id: 'ds-economy-us', name: 'DS Economy line', estimatedDays: '12 - 15', fee: 4.20, country: 'us' },
    { id: 'ds-standard-us', name: 'DS Standard line', estimatedDays: '7 - 10', fee: 4.80, country: 'us' },
    { id: 'ds-express-us', name: 'DS Express line', estimatedDays: '4 - 6', fee: 7.50, country: 'us' },
  ],
  ca: [
    { id: 'ds-economy-ca', name: 'DS Economy line', estimatedDays: '10 - 14', fee: 3.80, country: 'ca' },
    { id: 'ds-standard-ca', name: 'DS Standard line', estimatedDays: '6 - 9', fee: 4.20, country: 'ca' },
    { id: 'ds-express-ca', name: 'DS Express line', estimatedDays: '3 - 5', fee: 6.80, country: 'ca' },
  ],
  au: [
    { id: 'ds-economy-au', name: 'DS Economy line', estimatedDays: '14 - 18', fee: 5.50, country: 'au' },
    { id: 'ds-standard-au', name: 'DS Standard line', estimatedDays: '8 - 12', fee: 6.20, country: 'au' },
    { id: 'ds-express-au', name: 'DS Express line', estimatedDays: '5 - 7', fee: 9.80, country: 'au' },
  ],
  de: [
    { id: 'ds-economy-de', name: 'DS Economy line', estimatedDays: '8 - 12', fee: 2.80, country: 'de' },
    { id: 'ds-standard-de', name: 'DS Standard line', estimatedDays: '4 - 7', fee: 3.20, country: 'de' },
    { id: 'ds-express-de', name: 'DS Express line', estimatedDays: '2 - 4', fee: 5.50, country: 'de' },
  ],
  fr: [
    { id: 'ds-economy-fr', name: 'DS Economy line', estimatedDays: '9 - 13', fee: 3.00, country: 'fr' },
    { id: 'ds-standard-fr', name: 'DS Standard line', estimatedDays: '5 - 8', fee: 3.50, country: 'fr' },
    { id: 'ds-express-fr', name: 'DS Express line', estimatedDays: '2 - 4', fee: 6.00, country: 'fr' },
  ],
  jp: [
    { id: 'ds-economy-jp', name: 'DS Economy line', estimatedDays: '7 - 10', fee: 2.50, country: 'jp' },
    { id: 'ds-standard-jp', name: 'DS Standard line', estimatedDays: '4 - 6', fee: 3.00, country: 'jp' },
    { id: 'ds-express-jp', name: 'DS Express line', estimatedDays: '2 - 3', fee: 4.50, country: 'jp' },
  ],
  cn: [
    { id: 'ds-economy-cn', name: 'DS Economy line', estimatedDays: '5 - 8', fee: 1.50, country: 'cn' },
    { id: 'ds-standard-cn', name: 'DS Standard line', estimatedDays: '3 - 5', fee: 2.00, country: 'cn' },
    { id: 'ds-express-cn', name: 'DS Express line', estimatedDays: '1 - 2', fee: 3.50, country: 'cn' },
  ],
}

// 预定义的产品数据，包含多行产品名称
const predefinedProducts = [
  {
    id: 'PC-1001',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    productName: '多层设计小型动物笼子\n配备三个梯子和多个平台层\n让小型动物可以奔跑攀爬和玩耍',
    price: 89.99,
    shippingFrom: 'beijing',
    shippingMethod: 'ds-economy-uk',
    shippingCost: 3.07,
    totalAmount: 93.06,
    brandConnections: {
      logo: { connected: true, brandItemId: 'logo-001', brandItemName: '企业Logo - 大尺寸' },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'PC-1002',
    productImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    productName: '高品质天然木材制作\n安全无毒为您的宠物提供健康环境\n易于清洁的设计让日常维护变得简单',
    price: 156.50,
    shippingFrom: 'shanghai',
    shippingMethod: 'ds-standard-us',
    shippingCost: 4.80,
    totalAmount: 161.30,
    brandConnections: {
      logo: { connected: false },
      card: { connected: true, brandItemId: 'card-001', brandItemName: '名片设计 - 中尺寸' },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'PC-1003',
    productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    productName: '多功能存储底部配有储物架\n可以存放宠物用品和食物\n让您的生活空间更加整洁有序',
    price: 234.75,
    shippingFrom: 'guangzhou',
    shippingMethod: 'ds-express-ca',
    shippingCost: 6.80,
    totalAmount: 241.55,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'PC-1004',
    productImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop',
    productName: '五层设置提供了充足的空间\n让您的宠物可以自由活动\n同时保持清洁和有序的环境',
    price: 198.00,
    shippingFrom: 'shenzhen',
    shippingMethod: 'ds-economy-au',
    shippingCost: 5.50,
    totalAmount: 203.50,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: 'PC-1005',
    productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    productName: '可拆卸的组件便于深度清洁\n采用天然木材制作安全无毒\n为您的宠物提供健康的生活环境',
    price: 145.25,
    shippingFrom: 'hangzhou',
    shippingMethod: 'ds-standard-de',
    shippingCost: 3.20,
    totalAmount: 148.45,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: 'PC-1006',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    productName: '仓鼠游乐场豪宅\n配备三个梯子和多个平台层\n让小型动物可以奔跑攀爬和玩耍',
    price: 112.80,
    shippingFrom: 'nanjing',
    shippingMethod: 'ds-express-fr',
    shippingCost: 6.00,
    totalAmount: 118.80,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'PC-1007',
    productImage: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop',
    productName: '小型动物笼子\n多层设计配备三个梯子\n多个平台层让小型动物可以奔跑',
    price: 167.40,
    shippingFrom: 'beijing',
    shippingMethod: 'ds-economy-jp',
    shippingCost: 2.50,
    totalAmount: 169.90,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-26'),
  },
  {
    id: 'PC-1008',
    productImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
    productName: '高品质材料采用天然木材制作\n安全无毒为您的宠物提供健康环境\n易于清洁的设计让日常维护变得简单',
    price: 203.60,
    shippingFrom: 'shanghai',
    shippingMethod: 'ds-standard-cn',
    shippingCost: 2.00,
    totalAmount: 205.60,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-27'),
  },
  {
    id: 'PC-1009',
    productImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    productName: '多功能存储底部配有储物架\n可以存放宠物用品和食物\n让您的生活空间更加整洁有序',
    price: 89.99,
    shippingFrom: 'guangzhou',
    shippingMethod: 'ds-economy-uk',
    shippingCost: 3.07,
    totalAmount: 93.06,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-28'),
  },
  {
    id: 'PC-1010',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    productName: '五层设置提供了充足的空间\n让您的宠物可以自由活动\n同时保持清洁和有序的环境',
    price: 156.50,
    shippingFrom: 'shenzhen',
    shippingMethod: 'ds-standard-us',
    shippingCost: 4.80,
    totalAmount: 161.30,
    brandConnections: {
      logo: { connected: false },
      card: { connected: false },
      productPackaging: { connected: false },
      shippingPackaging: { connected: false },
    },
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-29'),
  },
]

// 运输方式选项（用于下拉选择）
export const shippingMethodOptions = Object.values(shippingMethodsByCountry).flat().map(method => ({
  value: method.id,
  label: `${method.name} (${method.estimatedDays} 天) - $${method.fee}`,
}))

// 生成产品连接数据
export const productConnections = predefinedProducts
