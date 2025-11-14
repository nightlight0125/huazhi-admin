import { faker } from '@faker-js/faker'
import { type Store } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

// Sample store data
const sampleStores: Store[] = [
  {
    storeName: 'zeloship',
    storeId: '1983790749921185792',
    authorizationTime: {
      date: 'Oct. 30, 2025',
      time: '15:01:46',
    },
    createTime: {
      date: 'Oct. 30, 2025',
      time: '14:59:06',
    },
    storeStatus: 'Normal',
    authorizationStatus: 'Normal',
    platformType: 'Shopify',
  },
]

// Generate more store data
const generatedStores: Store[] = Array.from({ length: 50 }, () => {
  const platforms = ['Shopify', 'WooCommerce', 'eBay', 'Tiktok', 'Etsy', 'Amazon Store']
  const statuses = ['Normal', 'Active', 'Inactive', 'Suspended', 'Pending']
  const authStatuses = ['Normal', 'Active', 'Pending']
  
  const createDate = faker.date.recent({ days: 30 })
  const authDate = faker.date.between({ 
    from: createDate, 
    to: new Date() 
  })

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month}. ${day}, ${year}`
  }

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return {
    storeName: faker.company.name() + ' Store',
    storeId: faker.string.numeric(19),
    authorizationTime: {
      date: formatDate(authDate),
      time: formatTime(authDate),
    },
    createTime: {
      date: formatDate(createDate),
      time: formatTime(createDate),
    },
    storeStatus: faker.helpers.arrayElement(statuses),
    authorizationStatus: faker.helpers.arrayElement(authStatuses),
    platformType: faker.helpers.arrayElement(platforms),
  }
})

// Export all stores
export const stores: Store[] = [...sampleStores, ...generatedStores]

