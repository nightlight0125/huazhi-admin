import { faker } from '@faker-js/faker'
import { type StoreSku, type PackagingProduct } from './schema'

// 设置固定种子以确保数据生成的一致性
faker.seed(12345)

// 生成包装产品数据
const generatePackagingProduct = (): PackagingProduct => ({
  id: faker.string.uuid(),
  image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
  name: faker.commerce.productName() + ' ' + faker.commerce.productDescription(),
  sku: `SU${faker.string.numeric(8)}-${faker.commerce.productAdjective()}`,
  variant: faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial(),
  price: parseFloat(faker.commerce.price({ min: 2, max: 10 })),
  relatedTime: faker.date.recent({ days: 30 }),
})

// 生成店铺SKU数据
export const packagingConnections: StoreSku[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    name: '黑色 / 3XS / 化纤',
    sku: 'T-shirs124',
    variantId: '43941683757171',
    storeName: 'zeloship',
    price: 50.00,
    isConnected: false,
    packagingProducts: [
      {
        id: 'p1',
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
        name: 'Dust-proof suede velvet drawstring drawstring storage bagKhaki trumpet 30*30cm',
        sku: 'SU00009859-Khaki trumpet 30*30cm',
        variant: 'Khaki trumpet 30*30cm',
        price: 4.50,
        relatedTime: new Date('2025-10-30T17:47:44'),
      },
    ],
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    name: '黑色 / 3XS / 纯棉',
    sku: 'T-shirs123',
    variantId: '43941683724403',
    storeName: 'zeloship',
    price: 50.00,
    isConnected: false,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    name: '白色 / M / 化纤',
    sku: 'T-shirs125',
    variantId: '43941683757172',
    storeName: 'zeloship',
    price: 55.00,
    isConnected: true,
    hzProductId: 'HZ-001',
    hzProductImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    hzProductSku: 'HZ-T-SHIRT-001',
    packagingProducts: [
      generatePackagingProduct(),
      generatePackagingProduct(),
    ],
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    name: '红色 / L / 纯棉',
    sku: 'T-shirs126',
    variantId: '43941683724404',
    storeName: 'zeloship',
    price: 60.00,
    isConnected: true,
    hzProductId: 'HZ-002',
    hzProductImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    hzProductSku: 'HZ-T-SHIRT-002',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    name: '蓝色 / XL / 化纤',
    sku: 'T-shirs127',
    variantId: '43941683757173',
    storeName: 'zeloship',
    price: 65.00,
    isConnected: false,
    packagingProducts: [
      generatePackagingProduct(),
    ],
  },
]

// 店铺名称选项
export const storeNameOptions = [
  { value: 'zeloship', label: 'zeloship' },
  { value: 'store2', label: 'Store 2' },
  { value: 'store3', label: 'Store 3' },
]

