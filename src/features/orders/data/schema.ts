import { z } from 'zod'

// 订单状态枚举
export const orderStatusSchema = z.enum([
  'all',           // 全部
  'pending_quote', // 待报价
  'pending_payment', // 待付款
  'paid',          // 已付款
  'processing',    // 处理中
  'shipped',       // 已发货
  'out_of_stock',  // 缺货
  'cancelled',     // 已取消
  'on_hold',       // 订单搁置
])

// 平台订单状态
export const platformOrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])

// 平台履行状态
export const platformFulfillmentStatusSchema = z.enum([
  'unfulfilled',
  'partial',
  'fulfilled',
  'restocked',
])

// 物流状态
export const logisticsStatusSchema = z.enum([
  'pending',
  'picked_up',
  'in_transit',
  'delivered',
  'exception',
])

// 产品变体结构
export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.string(),
})

// 产品列表项结构
export const orderProductSchema = z.object({
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
export const orderSchema = z.object({
  id: z.string(),
  store: z.string(),               // 店铺
  orderNumber: z.string(),         // 订单号
  customerName: z.string(),        // 客户名称
  country: z.string(),             // 国家
  province: z.string(),            // 省/州
  city: z.string(),                // 城市
  address: z.string(),             // 地址
  phoneNumber: z.string(),         // 电话号码
  email: z.string(),               // 电子邮件
  postalCode: z.string(),          // 邮政编码
  taxNumber: z.string(),           // 税号
  productList: z.array(orderProductSchema), // 产品列表
  
  // 保留原有字段以兼容现有代码
  storeName: z.string(),           // 店铺名称
  platformOrderNumber: z.string(), // 平台订单号
  customerOrderNumber: z.string(), // 客户订单号
  customer: z.string(),            // 客户
  trackingNumber: z.string(),      // 跟踪号
  shippingCost: z.number(),        // 运费
  otherCosts: z.number(),          // 其他费用
  totalCost: z.number(),           // 总成本
  shippingStock: z.string(),       // Shipping Stock
  productName: z.string(),         // 产品名称
  logistics: z.string(),           // 物流
  platformOrderStatus: platformOrderStatusSchema, // 平台订单状态
  platformFulfillmentStatus: platformFulfillmentStatusSchema, // 平台履行状态
  shippingOrigin: z.string(),      // 发货地
  status: orderStatusSchema,       // 订单状态
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Order = z.infer<typeof orderSchema>
export type OrderProduct = z.infer<typeof orderProductSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type PlatformOrderStatus = z.infer<typeof platformOrderStatusSchema>
export type PlatformFulfillmentStatus = z.infer<typeof platformFulfillmentStatusSchema>
export type LogisticsStatus = z.infer<typeof logisticsStatusSchema>
