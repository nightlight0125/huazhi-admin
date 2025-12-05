import { faker } from '@faker-js/faker'
import { type Address } from './schema'

const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia']
const provinces = {
  USA: ['Alabama', 'California', 'Texas', 'New York', 'Florida'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia'],
  France: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
}

function generateAddresses(count: number): Address[] {
  return Array.from({ length: count }, (_, i) => {
    const country = faker.helpers.arrayElement(countries)
    const province = faker.helpers.arrayElement(provinces[country as keyof typeof provinces] || ['Unknown'])
    const createdAt = faker.date.past({ years: 2 })
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

    return {
      id: `addr-${i + 1}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.datatype.boolean() ? faker.location.secondaryAddress() : undefined,
      country,
      province,
      city: faker.location.city(),
      postcode: faker.location.zipCode(),
      taxId: faker.datatype.boolean() ? faker.string.numeric(9) : undefined,
      createdAt,
      updatedAt,
    }
  })
}

export const addresses: Address[] = generateAddresses(50)

