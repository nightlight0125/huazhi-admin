import { z } from 'zod'

// 订单状态枚举
export const orderStatusSchema = z.enum([
  'all',           // 全部
  'pending',       // 待付款
  'authorized',    // 已授权
  'partially_paid', // 部分付款
  'paid',          // 已付款
  'refunded',      // 已退款
  'partially_refunded', // 部分退款
  'voided',        // 已作废
  'expired',       // 已过期
])

// 平台订单状态
export const platformOrderStatusSchema = z.enum([
  '0',   // 取消
  'no',  // 未关联本地sku
  '1',   // 待支付
  '2',   // 已支付
  '3',   // 处理中
  '4',   // 已发货
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
  // 后端原始字段
  hzkj_picture: z.string().optional(), // 产品图片
  hzkj_variant_name: z.string().optional(), // 变体名称
  hzkj_sku_values: z.string().optional(), // SKU值
  hzkj_shop_sku: z.string().optional(), // 店铺SKU
  hzkj_shop_price: z.string().optional().nullable(), // 店铺价格
  hzkj_src_qty: z.string().optional().nullable(), // 源数量
  hzkj_local_sku: z.string().optional(), // 本地SKU
  hzkj_amount: z.string().optional().nullable(), // 金额
  hzkj_qty: z.string().optional().nullable(), // 数量
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
  // 后端原始字段
  hzkj_country_code: z.string().optional().nullable(), // 国家二字码
  hzkj_orderstatus: z.string().optional(), // 订单状态（原始字段）
  hzkj_fulfillment_status: z.string().optional().nullable(), // 履行状态（原始字段）
  hzkj_order_amount: z.number().optional(), // 订单金额
  hzkj_pack_weight_total: z.number().optional(), // 包装重量总计
  // API 原始字段（用于兼容）
  lingItems: z.array(z.any()).optional(), // 产品列表（原始字段）
  // 店铺名称（原始字段），后端结构较为灵活，这里使用 any 以保持兼容
  hzkj_shop_name: z.any().optional(),
  billno: z.string().optional(), // 订单号（原始字段）
  createtime: z.string().optional(), // 创建时间（原始字段）
  // 客户名称（原始字段），结构同样较为动态，使用 any
  hzkj_customer_name: z.any().optional(),
  providers: z.string().optional(), // 物流提供商（原始字段）
  hzkj_actual_cost: z.number().optional(), // 实际成本
})

export type Order = z.infer<typeof orderSchema>
export type OrderProduct = z.infer<typeof orderProductSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type PlatformOrderStatus = z.infer<typeof platformOrderStatusSchema>
export type PlatformFulfillmentStatus = z.infer<typeof platformFulfillmentStatusSchema>
export type LogisticsStatus = z.infer<typeof logisticsStatusSchema>
