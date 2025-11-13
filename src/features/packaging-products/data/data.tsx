import { faker } from '@faker-js/faker'
import { type PackagingProduct } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(54321)

const categories = [
  'paper-boxes',
  'plastic-boxes',
  'leather-boxes',
  'wooden-boxes',
  'bamboo-boxes',
  'cartons',
  'card',
  'sticker',
  'shipping-bag',
  'ziplock-bag',
] as const

const sizeTemplates = [
  ['Small 36*36cm', 'Medium 40*40cm', 'Large 45*45cm'],
  ['Small 33*33cm', 'Medium 40*40cm', 'Large 45*56cm'],
  ['Small 36*36cm', 'Medium 40*40cm', 'Large 45*56cm'],
  ['11x11+4cm', '13x13+4cm', '15x15+4cm'],
  ['11x13+4cm', '13x15+4cm', '15x18+4cm'],
  ['11x16+4cm', '13x18+4cm', '15x21+4cm'],
  ['12x18+4cm', '13x21+4cm', '15x24+4cm'],
  ['23.5*13*8cm', '20*15*10cm', '25*18*12cm'],
]

export const packagingProducts: PackagingProduct[] = Array.from(
  { length: 100 },
  () => {
    const category = faker.helpers.arrayElement(categories)
    const sizeTemplate = faker.helpers.arrayElement(sizeTemplates)
    const sizes = sizeTemplate.map((label, index) => ({
      label,
      value: `size-${index}`,
    }))

    return {
      id: `PKG-${faker.number.int({ min: 1000, max: 9999 })}`,
      image: faker.image.url({ width: 200, height: 200 }),
      name: faker.commerce.productName(),
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      category,
      sizes,
      price: parseFloat(faker.commerce.price({ min: 0.2, max: 10 })),
      description: faker.commerce.productDescription(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  }
)

