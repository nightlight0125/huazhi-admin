import { products } from '@/features/products/data/data'
import { type Product } from '@/features/products/data/schema'

// Winning products are products with high sales
export const winningProducts: Product[] = products
  .filter((product) => product.sales > 500)
  .sort((a, b) => b.sales - a.sales)

