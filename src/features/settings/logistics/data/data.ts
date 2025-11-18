import { faker } from '@faker-js/faker'
import { type Logistics } from './schema'

const shippingMethods = ['YUNTU', 'DHL', 'FedEx', 'UPS', 'USPS', 'EMS']
const shippingFromLocations = ['HANGZHOU', 'SHANGHAI', 'GUANGZHOU', 'SHENZHEN', 'BEIJING']
const shippingToLocations = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan']

export const logisticsData: Logistics[] = Array.from({ length: 50 }, (_, i) => {
  return {
    id: `LOG-${faker.string.alphanumeric(8).toUpperCase()}`,
    sku: `SKU:${faker.string.numeric(7)}`,
    variant: `POD/${faker.number.int({ min: 5, max: 12 })}*${faker.number.int({ min: 8, max: 14 })}/Customized on demand`,
    qty: faker.number.int({ min: 1, max: 10 }),
    shippingMethod: faker.helpers.arrayElement(shippingMethods),
    shippingFrom: faker.helpers.arrayElement(shippingFromLocations),
    shippingTo: faker.helpers.arrayElement(shippingToLocations),
    shippingTime: `${faker.number.int({ min: 3, max: 7 })}-${faker.number.int({ min: 10, max: 20 })}days`,
    shippingPrice: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
    productImage: 'https://via.placeholder.com/80',
  }
})

