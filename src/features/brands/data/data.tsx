import { faker } from '@faker-js/faker'
import { type BrandTypeGroup, type BrandItem, type BrandType } from './schema'

// 设置固定种子以确保数据生成的一致性
faker.seed(12345)

// 品牌类型选项
export const brandTypeOptions = [
  { value: 'logo', label: 'Logo' },
  { value: 'card', label: '卡片' },
  { value: 'product_packaging', label: '产品包装' },
  { value: 'shipping_packaging', label: '运输包装' },
]

// 尺寸选项
export const sizeOptions = [
  { value: 'large', label: '大' },
  { value: 'medium', label: '中' },
  { value: 'small', label: '小' },
]

// 文件类型选项
export const fileTypeOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'ai', label: 'AI' },
]

// 生成品牌项目数据
const generateBrandItem = (brandType: BrandType): BrandItem => {
  const fileTypes = ['pdf', 'ai'] as const
  const sizes = ['large', 'medium', 'small'] as const
  const fileType = faker.helpers.arrayElement(fileTypes)
  const size = faker.helpers.arrayElement(sizes)
  
  const typeNames = {
    logo: ['企业Logo', '品牌标识', '公司标志', '品牌符号'],
    card: ['名片设计', '商务卡片', '联系卡片', '个人名片'],
    product_packaging: ['产品包装盒', '商品外包装', '产品标签', '包装设计'],
    shipping_packaging: ['运输包装', '快递包装', '物流包装', '运输标签'],
  }
  
  const names = typeNames[brandType] || ['品牌项目']
  const name = faker.helpers.arrayElement(names)
  
  return {
    id: faker.string.uuid(),
    brandType,
    name: `${name} - ${faker.commerce.productName()}`,
    size,
    fileType,
    fileName: `${name.replace(/\s+/g, '_')}_${size}.${fileType}`,
    fileSize: faker.number.int({ min: 1024, max: 10485760 }), // 1KB - 10MB
    notes: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
}

// 预定义的品牌类型组数据
const predefinedBrandTypeGroups: BrandTypeGroup[] = [
  {
    type: 'logo',
    label: 'Logo',
    items: [
      generateBrandItem('logo'),
      generateBrandItem('logo'),
      generateBrandItem('logo'),
    ],
  },
  {
    type: 'card',
    label: '卡片',
    items: [
      generateBrandItem('card'),
      generateBrandItem('card'),
      generateBrandItem('card'),
    ],
  },
  {
    type: 'product_packaging',
    label: '产品包装',
    items: [
      generateBrandItem('product_packaging'),
      generateBrandItem('product_packaging'),
      generateBrandItem('product_packaging'),
    ],
  },
  {
    type: 'shipping_packaging',
    label: '运输包装',
    items: [
      generateBrandItem('shipping_packaging'),
      generateBrandItem('shipping_packaging'),
      generateBrandItem('shipping_packaging'),
    ],
  },
]

export const brandTypeGroups = predefinedBrandTypeGroups

// 根据品牌类型获取品牌项目
export const getBrandItemsByType = (brandType: BrandType): BrandItem[] => {
  const group = brandTypeGroups.find(group => group.type === brandType)
  return group?.items || []
}

// 获取所有品牌项目
export const getAllBrandItems = (): BrandItem[] => {
  return brandTypeGroups.flatMap(group => group.items)
}

// 根据ID获取品牌项目
export const getBrandItemById = (id: string): BrandItem | undefined => {
  return getAllBrandItems().find(item => item.id === id)
}
