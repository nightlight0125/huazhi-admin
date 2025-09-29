import { z } from 'zod'

// 品牌类型
export const brandTypeSchema = z.enum(['logo', 'card', 'product_packaging', 'shipping_packaging'])

// 尺寸选项
export const sizeOptionsSchema = z.enum(['large', 'medium', 'small'])

// 文件类型
export const fileTypeSchema = z.enum(['pdf', 'ai'])

// 品牌项目（每个品牌类型下的具体项目）
export const brandItemSchema = z.object({
  id: z.string(),
  brandType: brandTypeSchema,
  name: z.string(),
  size: sizeOptionsSchema,
  fileType: fileTypeSchema,
  fileName: z.string(),
  fileSize: z.number().optional(), // 文件大小（字节）
  file: z.any().optional(), // 文件对象
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// 品牌类型组
export const brandTypeGroupSchema = z.object({
  type: brandTypeSchema,
  label: z.string(),
  items: z.array(brandItemSchema),
})

export type BrandType = z.infer<typeof brandTypeSchema>
export type SizeOption = z.infer<typeof sizeOptionsSchema>
export type FileType = z.infer<typeof fileTypeSchema>
export type BrandItem = z.infer<typeof brandItemSchema>
export type BrandTypeGroup = z.infer<typeof brandTypeGroupSchema>

// 添加 Brand 类型（用于品牌列表）
export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  components: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Brand = z.infer<typeof brandSchema>
