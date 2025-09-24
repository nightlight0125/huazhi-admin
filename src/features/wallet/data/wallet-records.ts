import { faker } from '@faker-js/faker'
import { type WalletRecord, type WalletStats } from './schema'
import { walletRecordTypes, walletRecordStatuses, paymentMethods, customers } from './data'

// 生成钱包记录数据
export const walletRecords: WalletRecord[] = Array.from({ length: 100 }, () => {
  const type = faker.helpers.arrayElement(walletRecordTypes)
  const status = faker.helpers.arrayElement(walletRecordStatuses)
  const customer = faker.helpers.arrayElement(customers)
  const amount = faker.number.float({ min: 10, max: 10000, fractionDigits: 2 })
  const createdAt = faker.date.past()
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

  const baseRecord = {
    id: `WR-${faker.number.int({ min: 10000, max: 99999 })}`,
    type: type.value,
    orderNumber: `ORD-${faker.number.int({ min: 100000, max: 999999 })}`,
    customerName: customer.label,
    amount,
    status: status.value,
    description: type.value === 'recharge' 
      ? `客户 ${customer.label} 充值 ${amount} 元`
      : `客户 ${customer.label} 发票 ${amount} 元`,
    createdAt,
    updatedAt,
  }

  // 根据类型添加特定字段
  if (type.value === 'recharge') {
    const paymentMethod = faker.helpers.arrayElement(paymentMethods)
    return {
      ...baseRecord,
      paymentMethod: paymentMethod.value,
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
