import { z } from 'zod'

// 产品类别枚举
export const productCategories = ['electronics', 'clothing', 'home', 'books', 'sports', 'beauty'] as const

// 发货地枚举
export const shippingLocations = ['china', 'usa', 'japan', 'germany', 'uk', 'france'] as const

// 产品数据模式
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '产品名称不能为空'),
  image: z.string().url('请输入有效的图片URL'),
  shippingLocation: z.enum(shippingLocations),
  price: z.number().min(0, '价格不能为负数'),
  sku: z.string().min(1, 'SKU不能为空'),
  category: z.enum(productCategories),
  sales: z.number().min(0, '销量不能为负数').default(0),
  // 分类相关字段
  isPublic: z.boolean().default(true), // 是否在公共目录
  isRecommended: z.boolean().default(false), // 是否为推荐产品
  isFavorite: z.boolean().default(false), // 是否为喜欢的产品
  isMyStore: z.boolean().default(false), // 是否为我的店铺产品
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Product = z.infer<typeof productSchema>
export type ProductCategory = typeof productCategories[number]
export type ShippingLocation = typeof shippingLocations[number]

// 产品表单模式（用于编辑）
export const productFormSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sales: true,
})

export type ProductFormData = z.infer<typeof productFormSchema>
