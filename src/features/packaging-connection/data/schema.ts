import { z } from 'zod'

// 包装产品数据模型
export const packagingProductSchema = z.object({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  sku: z.string(),
  variant: z.string(),
  price: z.number(),
  relatedTime: z.date(),
})

// 店铺SKU数据模型
export const storeSkuSchema = z.object({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  sku: z.string(),
  variantId: z.string(),
  storeName: z.string(),
  price: z.number(),
  isConnected: z.boolean(),
  hzProductId: z.string().optional(),
  hzProductImage: z.string().optional(),
  hzProductSku: z.string().optional(),
  packagingProducts: z.array(packagingProductSchema).optional(),
  // API原始字段（可选）
  hzkj_variant_picture: z.string().optional(),
  hzkj_local_sku_hzkj_name: z.string().optional(),
  hzkj_shop_sku: z.string().optional(),
  hzkj_variantid: z.string().optional(),
  hzkj_shop_pd_package_hzkj_picturefield: z.string().optional(),
  hzkj_local_sku_hzkj_sku_value: z.string().optional(),
  hzkj_local_sku_number: z.string().optional(),
  hzkj_od_pd_shop_name: z.string().optional(),
  hzkj_variant_price: z.number().optional(),
  // Additional API fields for different data sources
  hzkj_shop_package_hzkj_pur_price: z.string().optional(),
  hzkj_shop_package_hzkj_name: z.string().optional(),
  hzkj_shop_package_number: z.string().optional(),
  hzkj_local_sku_hzkj_picturefield: z.string().optional(),
  hzkj_pk_shop_name: z.string().optional(),
})

export type PackagingProduct = z.infer<typeof packagingProductSchema>
export type StoreSku = z.infer<typeof storeSkuSchema>

