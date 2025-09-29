import { faker } from '@faker-js/faker'
import { type WalletRecord, type WalletStats } from './schema'
import { walletRecordTypes, walletRecordStatuses, paymentMethods, customers } from './data'

// 生成钱包记录数据
export const walletRecords: WalletRecord[] = Array.from({ length: 100 }, () => {
  const type = faker.helpers.arrayElement(walletRecordTypes)
  const status = faker.helpers.arrayElement(walletRecordStatuses)
  const customer = faker.helpers.arrayElement(customers)
  const amount = faker.number.float({ min: 10, max: 10000, fractionDigits: 2 })
  const date = faker.date.past()
  const createdAt = faker.date.past()
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

  // 生成返现金额（30%概率有返现）
  const hasCashback = faker.datatype.boolean({ probability: 0.3 })
  const cashback = hasCashback ? faker.number.float({ min: 1, max: amount * 0.1, fractionDigits: 2 }) : undefined

  // 生成备注（50%概率有备注）
  const hasNotes = faker.datatype.boolean({ probability: 0.5 })
  const notes = hasNotes ? faker.lorem.sentence() : undefined

  const baseRecord = {
    id: `WR-${faker.number.int({ min: 10000, max: 99999 })}`,
    type: type.value,
    description: type.value === 'recharge' 
      ? faker.helpers.arrayElement([
          '账户充值',
          '余额充值',
          '钱包充值',
          '在线充值',
          '快速充值',
          '批量充值',
          '自动充值',
          '手动充值'
        ])
      : faker.helpers.arrayElement([
          '发票申请',
          '发票开具',
          '发票下载',
          '发票打印',
          '发票邮寄'
        ]),
    paymentMethod: type.value === 'recharge' 
      ? faker.helpers.arrayElement(paymentMethods).value
      : faker.helpers.arrayElement(['支付宝', '微信支付', '银行卡', '信用卡', 'PayPal']),
    date,
    amount,
    cashback,
    notes,
    status: status.value,
    createdAt,
    updatedAt,
    // 保持向后兼容的字段
    orderNumber: `ORD-${faker.number.int({ min: 100000, max: 999999 })}`,
    customerName: customer.label,
  }

  // 根据类型添加特定字段
  if (type.value === 'recharge') {
    return {
      ...baseRecord,
      transactionId: `TXN-${faker.string.alphanumeric(12).toUpperCase()}`,
    }
  } else {
    return {
      ...baseRecord,
      invoiceNumber: `INV-${faker.number.int({ min: 100000, max: 999999 })}`,
      invoiceUrl: `https://example.com/invoices/${baseRecord.id}.pdf`,
    }
  }
})

// 生成钱包统计信息
export const walletStats: WalletStats = {
  accountBalance: 125680.50,
  totalRecharge: 250000.00,
  totalInvoice: 124319.50,
  pendingAmount: 8500.00,
}
