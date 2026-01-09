import { faker } from '@faker-js/faker'
import { type StockOrder } from './schema'
import { 
  stockOrderStatuses, 
  logistics,
} from './data'

// Set a different seed for stock orders data
faker.seed(67890)

export const stockOrders: StockOrder[] = Array.from({ length: 50 }, () => {
  const orderStatus = faker.helpers.arrayElement(stockOrderStatuses).value
  const logisticsProvider = faker.helpers.arrayElement(logistics)

  const shippingCost = faker.number.float({ min: 5, max: 50, fractionDigits: 2 })
  const otherCosts = faker.number.float({ min: 0, max: 25, fractionDigits: 2 })
  const productPrice = faker.number.float({ min: 10, max: 200, fractionDigits: 2 })
  const quantity = faker.number.int({ min: 1, max: 5 })
  const totalCost = shippingCost + otherCosts + (productPrice * quantity)

  // 生成产品列表
  const productCount = faker.number.int({ min: 1, max: 3 })
  const productList = Array.from({ length: productCount }, () => {
    const price = faker.number.float({ min: 10, max: 200, fractionDigits: 2 })
    const qty = faker.number.int({ min: 1, max: 5 })
    const totalPrice = price * qty

    return {
      id: faker.string.uuid(),
      productName: faker.commerce.productName(),
      productVariant: [
        {
          id: faker.string.uuid(),
          name: 'Color',
          value: faker.helpers.arrayElement(['Red', 'Blue', 'Green', 'Black', 'White'])
        },
        {
          id: faker.string.uuid(),
          name: 'Size',
          value: faker.helpers.arrayElement(['S', 'M', 'L', 'XL', 'XXL'])
        },
      ],
      quantity: qty,
      productImageUrl: faker.image.url({ width: 100, height: 100 }),
      productLink: faker.internet.url(),
      price,
      totalPrice,
    }
  })

  // "" 表示 All，不是有效后端状态，这里映射为 pending
  const validStatus = orderStatus === '' ? 'pending' : orderStatus

  return {
    id: faker.string.uuid(),
    orderNumber: faker.string.numeric(10),
    sku: faker.string.numeric(4),
    createdAt: faker.date.recent({ days: 30 }),
    cost: {
      total: totalCost,
      product: productPrice * quantity,
      shipping: shippingCost,
      other: otherCosts,
      qty: quantity,
    },
    address: {
      name: faker.person.firstName(),
      country: faker.location.country(),
      address: faker.location.streetAddress(),
    },
    shippingMethod: logisticsProvider.label,
    trackId: faker.string.numeric(9),
    remark: faker.lorem.sentence(),
    status: validStatus as 'quoting' | 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'canceled' | 'pay_in_progress',
    productList,
  }
})

