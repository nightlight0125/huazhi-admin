import { z } from 'zod'

// 询价状态枚举
export const quoteStatuses = ['processing', 'success', 'failed'] as const

// 目标质量枚举
export const qualityLevels = ['high', 'medium', 'low'] as const

// 询价数据模式
export const quoteSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, '产品名称不能为空'),
  productUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  images: z.array(z.string()).min(1, '至少需要上传一张产品图片'),
  sku: z.string().optional(),
  status: z.enum(quoteStatuses),
  price: z.number().optional(),
  budget: z.number().min(0, '预算不能为负数').optional(),
  quality: z.enum(qualityLevels),
  acceptSimilar: z.boolean().default(false),
  description: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Quote = z.infer<typeof quoteSchema>
export type QuoteStatus = typeof quoteStatuses[number]
export type QualityLevel = typeof qualityLevels[number]

// 询价表单模式
export const quoteFormSchema = quoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sku: true,
  status: true,
  price: true,
})

export type QuoteFormData = z.infer<typeof quoteFormSchema>
