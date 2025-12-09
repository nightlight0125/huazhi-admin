import { type LikedProduct } from './schema'

export const likedProductsData: LikedProduct[] = [
  {
    id: 'PROD-1513', // 匹配 products 数据中的测试产品
    name: 'Pet dog food dispenser reward tennis machine toy dog interactive toy',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop',
    description: 'Pet dog food dispenser reward tennis machine toy dog interactive toy',
    spu: 'SU00001778',
    priceMin: 5.48,
    priceMax: 11.12,
    addDate: new Date('2025-10-27T11:20:45'),
  },
  {
    id: 'PROD-2000', // 使用一个可能存在的产品 ID 格式
    name: 'Wireless Bluetooth Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
    description: 'High-quality wireless Bluetooth headphones with noise cancellation',
    spu: 'SU00001779',
    priceMin: 29.99,
    priceMax: 49.99,
    addDate: new Date('2025-10-26T14:30:20'),
  },
  {
    id: 'PROD-3000', // 使用一个可能存在的产品 ID 格式
    name: 'Smart Watch Fitness Tracker',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
    description: 'Smart watch with fitness tracking and heart rate monitor',
    spu: 'SU00001780',
    priceMin: 79.99,
    priceMax: 129.99,
    addDate: new Date('2025-10-25T09:15:10'),
  },
]

