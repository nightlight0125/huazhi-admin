import { faker } from '@faker-js/faker'
import { type Store } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(12345)

// Sample store data
const sampleStores: Store[] = [
  {
    name: 'zeloship',
    id: '1983790749921185792',
    bindtime: 'Oct. 30, 2025 15:01:46',
    createtime: 'Oct. 30, 2025 14:59:06',
    platform: 'Shopify',
  },
]

// Generate more store data
const generatedStores: Store[] = Array.from({ length: 50 }, () => {
  const platforms = ['Shopify', 'WooCommerce', 'eBay', 'Tiktok', 'Etsy', 'Amazon Store']
  
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
    name: faker.company.name() + ' Store',
    id: faker.string.numeric(19),
    bindtime: `${formatDate(authDate)} ${formatTime(authDate)}`,
    createtime: `${formatDate(createDate)} ${formatTime(createDate)}`,
    platform: faker.helpers.arrayElement(platforms),
  }
})

// Export all stores
export const stores: Store[] = [...sampleStores, ...generatedStores]

