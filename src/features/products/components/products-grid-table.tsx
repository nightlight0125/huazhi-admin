import { DataGridTable } from '@/components/data-table'
import { categories, locations, priceRanges } from '../data/data'
import { type Product } from '../data/schema'
import { productsColumns as columns } from './products-columns'
import { Heart, Store } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

type DataTableProps = {
  data: Product[]
  category?: 'public' | 'recommended' | 'favorites' | 'my-store'
}

export function ProductsGridTable({ data, category = 'public' }: DataTableProps) {
  const navigate = useNavigate()
  
  // 根据分类配置不同的筛选器
  const getFilters = () => {
    // 只有公共目录显示完整的筛选器
    if (category === 'public') {
        return [
          {
            columnId: 'shippingLocation',
            title: '国家',
            options: locations,
          },
          {
            columnId: 'category',
            title: '类别',
            options: categories,
          },
          {
            columnId: 'price',
            title: '价格区间',
            options: priceRanges,
          },
        ]
    }
    // 其他分类只显示基本筛选器
        return [
          {
            columnId: 'shippingLocation',
            title: '国家',
            options: locations,
          },
          {
            columnId: 'category',
            title: '类别',
            options: categories,
          },
        ]
  }

  return (
    <DataGridTable
      data={data}
      columns={columns}
      searchPlaceholder={`在${getCategoryName(category)}中搜索产品名称或SKU...`}
      routePath="/_authenticated/products/"
      filters={getFilters()}
      gridCols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      renderConfig={{
        titleField: 'name',
        subtitleField: 'sku',
        badges: [
          {
            field: 'shippingLocation',
            title: '发货地',
            options: locations.map(location => ({
              ...location,
              variant: 'secondary' as const,
            })),
          },
        ],
        customRender: (item: Product) => (
          <div 
            className="group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer"
            onClick={() => navigate({ to: '/products/$productId', params: { productId: item.id } })}
          >
            {/* 产品图片 */}
            <div className="aspect-square overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            {/* 产品信息 */}
            <div className="p-4">
              {/* 产品名称 - 固定2行高度 */}
              <h3 className="font-medium text-sm h-10 line-clamp-2 mb-3 leading-5">
                {item.name}
              </h3>
              
              {/* 发货地和价格在一行 */}
              <div className="flex items-center justify-between">
                {/* 国家标签 */}
                <div>
                  {(() => {
                    const location = locations.find(loc => loc.value === item.shippingLocation)
                    return location ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {location.icon && <location.icon />}
                        {location.label}
                      </span>
                    ) : null
                  })()}
                </div>
                
                {/* 价格 */}
                <div className="text-lg font-bold text-primary">
                  ${item.price.toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Hover 操作按钮 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                className="bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 p-1.5 rounded-full shadow-sm transition-colors"
                title="喜欢"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: 实现喜欢功能
                  console.log('喜欢产品:', item.id)
                }}
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                className="bg-white/90 hover:bg-white text-gray-700 hover:text-blue-500 p-1.5 rounded-full shadow-sm transition-colors"
                title="发布到店铺"
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: 实现发布到店铺功能
                  console.log('发布到店铺:', item.id)
                }}
              >
                <Store className="h-4 w-4" />
              </button>
            </div>
          </div>
        ),
      }}
    />
  )
}

function getCategoryName(category: string): string {
  switch (category) {
    case 'public':
      return '公共目录'
    case 'recommended':
      return '推荐产品'
    case 'favorites':
      return '喜欢的产品'
    case 'my-store':
      return '我的店铺产品'
    default:
      return '产品'
  }
}
