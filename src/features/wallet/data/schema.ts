import { z } from 'zod'

// 钱包记录类型
export const walletRecordTypeSchema = z.enum(['recharge', 'invoice'])

// 钱包记录状态
export const walletRecordStatusSchema = z.enum(['pending', 'completed', 'failed', 'cancelled'])

// 钱包记录数据结构
export const walletRecordSchema = z.object({
  id: z.string(),
  type: walletRecordTypeSchema, // 记录类型：充值记录或发票记录
  description: z.string(), // 描述
  paymentMethod: z.string(), // 充值方式
  date: z.date(), // 日期
  amount: z.number(), // 金额
  cashback: z.number().optional(), // 返现
  notes: z.string().optional(), // 备注
  status: walletRecordStatusSchema, // 充值状态
  createdAt: z.date(), // 创建时间
  updatedAt: z.date(), // 更新时间
  // 其他字段（保持向后兼容）
  orderNumber: z.string().optional(), // 客户订单号
  customerName: z.string().optional(), // 客户名称
  transactionId: z.string().optional(), // 交易ID
  invoiceNumber: z.string().optional(), // 发票号
  invoiceUrl: z.string().optional(), // 发票下载链接
})

export type WalletRecord = z.infer<typeof walletRecordSchema>
export type WalletRecordType = z.infer<typeof walletRecordTypeSchema>
export type WalletRecordStatus = z.infer<typeof walletRecordStatusSchema>

// 钱包统计信息
export const walletStatsSchema = z.object({
  accountBalance: z.number(), // 账户余额
  totalRecharge: z.number(), // 总充值金额
  totalInvoice: z.number(), // 总发票金额
  pendingAmount: z.number(), // 待处理金额
})

export type WalletStats = z.infer<typeof walletStatsSchema>
