import { faker } from '@faker-js/faker'
import {
    type CommissionRecord,
    type RecommendedListRecord,
    type WithdrawRecord,
} from './schema'

// Generate mock commission records
export function generateCommissionRecords(count: number): CommissionRecord[] {
  const referees = ['***us', '***er']
  
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    referee: faker.helpers.arrayElement(referees),
    dateTime: faker.date.recent({ days: 30 }),
    commission: parseFloat(faker.finance.amount({ min: 0.05, max: 0.5, dec: 2 })),
  }))
}

// Mock data - 174 records total
export const commissionRecords: CommissionRecord[] = generateCommissionRecords(174)

// Generate mock withdraw records
export function generateWithdrawRecords(count: number): WithdrawRecord[] {
  const accountTypes = ['Bank Account', 'PayPal', 'Alipay', 'WeChat Pay']
  const statuses = ['Pending', 'Completed', 'Failed', 'Processing']
  
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    account: faker.string.numeric(10),
    accountType: faker.helpers.arrayElement(accountTypes),
    amount: parseFloat(faker.finance.amount({ min: 10, max: 1000, dec: 2 })),
    dateTime: faker.date.recent({ days: 30 }),
    status: faker.helpers.arrayElement(statuses),
    remarks: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  }))
}

// Mock data - 100 records
export const withdrawRecords: WithdrawRecord[] = generateWithdrawRecords(100)

// Generate mock recommended list records
export function generateRecommendedListRecords(
  count: number
): RecommendedListRecord[] {
  const referees = ['***us', '***er', '***ue']
  
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    referee: faker.helpers.arrayElement(referees),
    registrationTime: faker.date.recent({ days: 90 }),
    commissionAmount: parseFloat(
      faker.finance.amount({ min: 0, max: 50, dec: 2 })
    ),
  }))
}

// Mock data - 50 records
const generatedRecommendedRecords = generateRecommendedListRecords(50)

// Add some hardcoded test data to ensure data is available
export const recommendedListRecords: RecommendedListRecord[] = [
  ...generatedRecommendedRecords,
  {
    id: '51',
    referee: '***us',
    registrationTime: new Date('2025-09-01T11:47:16'),
    commissionAmount: 21.62,
  },
  {
    id: '52',
    referee: '***er',
    registrationTime: new Date('2025-10-27T16:52:25'),
    commissionAmount: 4.30,
  },
  {
    id: '53',
    referee: '***ue',
    registrationTime: new Date('2025-08-13T10:58:19'),
    commissionAmount: 0.00,
  },
]

