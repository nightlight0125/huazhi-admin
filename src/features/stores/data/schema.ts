import { z } from 'zod'

// 店铺平台枚举
export const storePlatforms = ['shopify', 'ebay', 'tiktok', 'amazon'] as const

// 店铺状态枚举
export const storeStatuses = ['active', 'inactive', 'suspended', 'pending'] as const

// 店铺数据模式
export const storeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '店铺名称不能为空'),
  platform: z.enum(storePlatforms),
  status: z.enum(storeStatuses),
  description: z.string().optional(),
  logo: z.string().optional(),
  url: z.string().url('请输入有效的店铺URL').optional(),
  connectedAt: z.date().optional(),
  lastSyncAt: z.date().optional(),
  productCount: z.number().min(0).default(0),
  orderCount: z.number().min(0).default(0),
  revenue: z.number().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Store = z.infer<typeof storeSchema>
export type StorePlatform = typeof storePlatforms[number]
export type StoreStatus = typeof storeStatuses[number]

// 平台配置
export const platformConfig = {
  shopify: {
    name: 'Shopify',
    description: '全球领先的电商平台，提供完整的在线商店解决方案',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  ebay: {
    name: 'eBay',
    description: '全球最大的在线拍卖和购物网站',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  tiktok: {
    name: 'TikTok Shop',
    description: 'TikTok的电商平台，结合短视频和购物体验',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
  },
  amazon: {
    name: 'Amazon Store',
    description: '亚马逊商店，全球最大的电商平台之一',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
} as const
