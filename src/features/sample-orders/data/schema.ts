import { z } from 'zod'

// 订单状态枚举
export const sampleOrderStatusSchema = z.enum([
  'all',           // 全部
  'quoting',       // 报价中
  'pending',       // 待处理
  'paid',          // 已付款
  'processing',    // 处理中
  'shipped',       // 已发货
  'completed',     // 已完成
  'canceled',      // 已取消
  'pay_in_progress', // 支付中
])

// 产品变体结构
export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
})

// 产品列表项结构
export const sampleOrderProductSchema = z.object({
  id: z.string(),
  productName: z.string(),         // 产品名称
  productVariant: z.array(productVariantSchema), // 产品变体
  quantity: z.number(),            // 数量
  productImageUrl: z.string(),     // 产品图片URL
  productLink: z.string(),         // 产品链接
  price: z.number(),               // 单价
  totalPrice: z.number(),          // 总价
})

// 订单数据结构
export const sampleOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),         // 订单号
  sku: z.string(),                 // SKU
  createdAt: z.date(),             // 创建时间
  cost: z.object({
    total: z.number(),             // 总价
    product: z.number(),           // 产品价格
    shipping: z.number(),          // 运费
    other: z.number(),             // 其他费用
    qty: z.number(),               // 数量
  }),
  address: z.object({
    name: z.string(),              // 姓名
    country: z.string(),            // 国家
    address: z.string(),           // 地址
  }),
  shippingMethod: z.string(),      // 物流方式
  trackId: z.string(),             // 跟踪ID
  remark: z.string(),              // 备注
  status: sampleOrderStatusSchema, // 订单状态
  productList: z.array(sampleOrderProductSchema), // 产品列表
  // API 原始字段（用于兼容）
  billno: z.string().optional(), // 订单号（原始字段）
  createtime: z.string().optional(), // 创建时间（原始字段）
  hzkj_order_amount: z.number().optional(), // 订单金额
  // 客户名称（原始字段），结构较为动态，这里使用 any 保持兼容
  hzkj_customer_name: z.any().optional(),
  hzkj_country_code: z.string().optional().nullable(), // 国家代码
  trackingNumber: z.string().optional(), // 跟踪号
})

export type SampleOrder = z.infer<typeof sampleOrderSchema>
export type SampleOrderProduct = z.infer<typeof sampleOrderProductSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type SampleOrderStatus = z.infer<typeof sampleOrderStatusSchema>

