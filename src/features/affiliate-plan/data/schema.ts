import { z } from 'zod'

export const commissionRecordSchema = z.object({
  id: z.string(),
  referee: z.string(), // Masked referee identifier like "***us" or "***er"
  dateTime: z.date(),
  commission: z.number(), // Commission amount in USD
})

export type CommissionRecord = z.infer<typeof commissionRecordSchema>

export const withdrawRecordSchema = z.object({
  id: z.string(),
  account: z.string(),
  accountType: z.string(),
  amount: z.number(),
  dateTime: z.date(),
  status: z.string(),
  remarks: z.string().optional(),
})

export type WithdrawRecord = z.infer<typeof withdrawRecordSchema>

export const recommendedListRecordSchema = z.object({
  id: z.string(),
  referee: z.string(),
  registrationTime: z.string(),
  commissionAmount: z.number(),
})

export type RecommendedListRecord = z.infer<typeof recommendedListRecordSchema>

