import { faker } from '@faker-js/faker'
import { type Order, type OrderStatus } from './schema'
import { 
  orderStatuses, 
  platformOrderStatuses, 
  platformFulfillmentStatuses, 
  // logisticsStatuses,
  stores,
  logistics,
  shippingOrigins,
  countries
} from './data'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const orders: Order[] = Array.from({ length: 100 }, () => {
  // 生成订单状态时跳过表示 “All” 的空值
  const orderStatus = faker.helpers
    .arrayElement(orderStatuses.slice(1))
    .value as OrderStatus
  const platformOrderStatus = faker.helpers.arrayElement(platformOrderStatuses).value
  const platformFulfillmentStatus = faker.helpers.arrayElement(platformFulfillmentStatuses).value
  // const logisticsStatus = faker.helpers.arrayElement(logisticsStatuses).value
  const store = faker.helpers.arrayElement(stores)
  const logisticsProvider = faker.helpers.arrayElement(logistics)
  const shippingOrigin = faker.helpers.arrayElement(shippingOrigins)
  const country = faker.helpers.arrayElement(countries)

  const shippingCost = faker.number.float({ min: 10, max: 100, fractionDigits: 2 })
  const otherCosts = faker.number.float({ min: 0, max: 50, fractionDigits: 2 })
  const totalCost = shippingCost + otherCosts + faker.number.float({ min: 50, max: 500, fractionDigits: 2 })

  // 生成产品列表
  const productCount = faker.number.int({ min: 1, max: 5 })
  const productList = Array.from({ length: productCount }, () => {
    const price = faker.number.float({ min: 10, max: 200, fractionDigits: 2 })
    const quantity = faker.number.int({ min: 1, max: 10 })
    const totalPrice = price * quantity

    return {
      id: faker.string.uuid(),
      productName: faker.commerce.productName(),
      productVariant: [
        {
          id: faker.string.uuid(),
          name: '颜色',
          value: faker.helpers.arrayElement(['红色', '蓝色', '绿色', '黑色', '白色'])
        },
        {
          id: faker.string.uuid(),
          name: '尺寸',
          value: faker.helpers.arrayElement(['S', 'M', 'L', 'XL', 'XXL'])
        }
      ],
      quantity,
      productImageUrl: faker.image.url({ width: 200, height: 200 }),
      productLink: faker.internet.url(),
      price,
      totalPrice
    }
  })

  // 生成地址信息
  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '山东省', '河南省', '四川省']
  const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '成都市', '武汉市']
  
  const province = faker.helpers.arrayElement(provinces)
  const city = faker.helpers.arrayElement(cities)

  return {
    id: `ORD-${faker.number.int({ min: 10000, max: 99999 })}`,
    // 新字段
    store: store.value,
    orderNumber: `ORD-${faker.number.int({ min: 100000, max: 999999 })}`,
    customerName: faker.person.fullName(),
    country: country.label,
    province,
    city,
    address: faker.location.streetAddress(),
    phoneNumber: faker.phone.number(),
    email: faker.internet.email(),
    postalCode: faker.location.zipCode(),
    taxNumber: faker.string.alphanumeric(15).toUpperCase(),
    productList,
    
    // 保留原有字段以兼容现有代码
    storeName: store.label,
    platformOrderNumber: `PO-${faker.number.int({ min: 100000, max: 999999 })}`,
    customerOrderNumber: `CO-${faker.number.int({ min: 100000, max: 999999 })}`,
    customer: faker.person.fullName(),
    trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
    shippingCost,
    otherCosts,
    totalCost,
    shippingStock: faker.helpers.arrayElement(['有库存', '缺货', '待补货']),
    productName: faker.commerce.productName(),
    logistics: logisticsProvider.value,
    platformOrderStatus,
    platformFulfillmentStatus,
    shippingOrigin: shippingOrigin.value,
    status: orderStatus,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
