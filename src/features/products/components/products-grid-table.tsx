import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Heart, ShoppingCart, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataGridTable } from '@/components/data-table'
import { locations, priceRanges, suppliers } from '../data/data'
import { type Product } from '../data/schema'
import { productsColumns as columns } from './products-columns'

type DataTableProps = {
  data: Product[]
  category?: 'public' | 'recommended' | 'favorites' | 'my-store'
}

export function ProductsGridTable({
  data,
  category = 'public',
}: DataTableProps) {
  const navigate = useNavigate()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const toggleFavorite = (productId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  // 分类树结构数据
  const categoryTree = [
    {
      label: 'Animals & Pet Supplies',
      value: 'animals-pet-supplies',
      children: [
        { label: 'Live Animals', value: 'live-animals' },
        { label: 'Pet Supplies', value: 'pet-supplies' },
      ],
    },
    {
      label: 'Apparel & Accessories',
      value: 'apparel-accessories',
      children: [
        { label: 'Clothing', value: 'clothing' },
        { label: 'Accessories', value: 'accessories' },
      ],
    },
    {
      label: 'Arts & Entertainment',
      value: 'arts-entertainment',
      children: [
        { label: 'Art Supplies', value: 'art-supplies' },
        { label: 'Entertainment', value: 'entertainment' },
      ],
    },
    {
      label: 'Baby & Toddler',
      value: 'baby-toddler',
      children: [
        { label: 'Baby Care', value: 'baby-care' },
        { label: 'Toddler Items', value: 'toddler-items' },
      ],
    },
    {
      label: 'Business & Industrial',
      value: 'business-industrial',
      children: [
        { label: 'Office Supplies', value: 'office-supplies' },
        { label: 'Industrial Equipment', value: 'industrial-equipment' },
      ],
    },
    {
      label: 'Cameras & Optics',
      value: 'cameras-optics',
      children: [
        { label: 'Cameras', value: 'cameras' },
        { label: 'Optics', value: 'optics' },
      ],
    },
  ]

  // 根据分类配置不同的筛选器
  const getFilters = () => {
    // 只有公共目录显示完整的筛选器
    if (category === 'public') {
      return [
        {
          columnId: 'category',
          title: 'All categories',
          useCategoryTree: true,
          categories: categoryTree,
        },
        {
          columnId: 'price',
          title: 'Price range',
          options: priceRanges,
        },
        {
          columnId: 'shippingLocation',
          title: 'Ship from anywhere',
          options: locations,
        },
        {
          columnId: 'supplier',
          title: 'All suppliers',
          options: suppliers,
        },
      ]
    }
    // 其他分类只显示基本筛选器
    return [
      {
        columnId: 'category',
        title: 'All categories',
        useCategoryTree: true,
        categories: categoryTree,
      },
      {
        columnId: 'shippingLocation',
        title: '国家',
        options: locations,
      },
    ]
  }

  return (
    <DataGridTable
      data={data}
      columns={columns}
      searchPlaceholder='Search'
      // searchPlaceholder={`在${getCategoryName(category)}中搜索产品名称或SKU...`}
      routePath='/_authenticated/products/'
      filters={getFilters()}
      gridCols='grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      renderConfig={{
        titleField: 'name',
        subtitleField: 'sku',
        badges: [
          {
            field: 'shippingLocation',
            title: '发货地',
            options: locations.map((location) => ({
              ...location,
              variant: 'secondary' as const,
            })),
          },
        ],
        customRender: (item: Product) => {
          const isFavorite = selectedItems.has(item.id)

          return (
            <div
              className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
              onClick={() =>
                navigate({
                  to: '/products/$productId',
                  params: { productId: item.id },
                })
              }
            >
              {/* Product Image */}
              <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                <img
                  src={item.image}
                  alt={item.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              </div>

              {/* Product Info */}
              <div className='space-y-1.5 p-2.5'>
                {/* Product Title */}
                <h3 className='line-clamp-2 text-sm leading-tight font-semibold'>
                  {item.name}
                </h3>

                {/* SPU */}
                <p className='font-mono text-xs text-gray-600'>
                  HZ SPU : {item.sku}
                </p>

                {/* Price */}
                <div className='text-base font-bold'>
                  ${item.price.toFixed(2)}
                </div>

                {/* Action Buttons - Bottom */}
                <div className='flex gap-1.5 pt-1.5'>
                  <Button
                    variant='outline'
                    size='sm'
                    className={`h-7 flex-1 px-1 ${
                      isFavorite
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : ''
                    }`}
                    title='Favorite'
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(item.id)
                    }}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`}
                    />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 flex-1 px-1'
                    title='Add to Cart'
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Add to cart:', item.id)
                    }}
                  >
                    <ShoppingCart className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7 flex-1 px-1'
                    title='Add to Store'
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Add to store:', item.id)
                    }}
                  >
                    <Store className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          )
        },
      }}
    />
  )
}
