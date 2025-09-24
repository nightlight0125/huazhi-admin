import { type Product } from '../data/schema'
import { categories, locations } from '../data/data'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ProductsGridViewProps {
  products: Product[]
}

export function ProductsGridView({ products }: ProductsGridViewProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {products.map((product) => {
        const category = categories.find(cat => cat.value === product.category)
        const location = locations.find(loc => loc.value === product.shippingLocation)
        
        return (
          <div
            key={product.id}
            className='group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md'
          >
            {/* 产品图片 */}
            <div className='aspect-square overflow-hidden'>
              <img
                src={product.image}
                alt={product.name}
                className='h-full w-full object-cover transition-transform group-hover:scale-105'
              />
            </div>
            
            {/* 产品信息 */}
            <div className='p-4 space-y-3'>
              {/* 产品名称 */}
              <h3 className='font-semibold leading-none tracking-tight line-clamp-2'>
                {product.name}
              </h3>
              
              {/* SKU */}
              <p className='text-sm text-muted-foreground font-mono'>
                SKU: {product.sku}
              </p>
              
              {/* 价格 */}
              <div className='flex items-center justify-between'>
                <span className='text-2xl font-bold text-primary'>
                  ¥{product.price.toFixed(2)}
                </span>
                <span className='text-sm text-muted-foreground'>
                  销量: {product.sales.toLocaleString()}
                </span>
              </div>
              
              {/* 类别和发货地 */}
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-1'>
                  {category?.icon && <category.icon />}
                  <span>{category?.label}</span>
                </div>
                <div className='flex items-center gap-1'>
                  {location?.icon && <location.icon />}
                  <span>{location?.label}</span>
                </div>
              </div>
              
              {/* 创建日期 */}
              <p className='text-xs text-muted-foreground'>
                {format(product.createdAt, 'yyyy-MM-dd', { locale: zhCN })}
              </p>
            </div>
            
            {/* 操作按钮 */}
            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <DataTableRowActions row={{ original: product }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
