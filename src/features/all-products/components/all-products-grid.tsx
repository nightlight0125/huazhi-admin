import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Heart, Search, ShoppingCart, Store } from 'lucide-react'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { locations, priceRanges } from '@/features/products/data/data'
import { type Product } from '@/features/products/data/schema'

const route = getRouteApi('/_authenticated/all-products')

type AllProductsGridProps = {
  data: Product[]
}

// Category tree data
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

export function AllProductsGrid({ data }: AllProductsGridProps) {
  const navigate = useNavigate()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    string | undefined
  >(undefined)
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined
  )
  const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>(
    undefined
  )

  // Synced with URL states
  const { globalFilter, onGlobalFilterChange, pagination } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 8 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [],
  })

  // Filter and paginate data
  const filteredData = useMemo(() => {
    let result = data

    // Apply search filter
    if (globalFilter) {
      const searchValue = String(globalFilter).toLowerCase()
      result = result.filter((product) => {
        const name = product.name.toLowerCase()
        const sku = product.sku.toLowerCase()
        return name.includes(searchValue) || sku.includes(searchValue)
      })
    }

    // Apply category filter
    if (selectedCategories.size > 0) {
      result = result.filter((product) => {
        // Check if product category matches any selected category
        // This is a simplified check - adjust based on your data structure
        if (!product.category) return false

        // Check direct match or parent-child relationship
        return Array.from(selectedCategories).some((selectedCat) => {
          if (product.category === selectedCat) return true
          // Check if product category is a child of selected parent
          const parentCategory = categoryTree.find(
            (cat) => cat.value === selectedCat
          )
          if (parentCategory?.children) {
            return parentCategory.children.some(
              (child) => child.value === product.category
            )
          }
          // Check if selected category is a child of product's parent
          const productParent = categoryTree.find((cat) =>
            cat.children?.some((child) => child.value === product.category)
          )
          if (productParent?.value === selectedCat) return true
          return false
        })
      })
    }

    return result
  }, [data, globalFilter, selectedCategories])

  const pageSize = pagination.pageSize || 8
  const pageIndex = (pagination.pageIndex || 0) + 1
  const startIndex = (pageIndex - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

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

  // Suppliers options
  const suppliers = [
    { label: 'All suppliers', value: 'all' },
    { label: 'Supplier A', value: 'supplier-a' },
    { label: 'Supplier B', value: 'supplier-b' },
    { label: 'Supplier C', value: 'supplier-c' },
  ]

  const handleCategoryChange = (value: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(value)
      } else {
        next.delete(value)
      }
      return next
    })
  }

  const priceRangeOptions = [
    { label: 'Price range', value: 'all' },
    ...priceRanges.map((range) => ({ label: range.label, value: range.value })),
  ]

  const locationOptions = [
    { label: 'Ship from anywhere', value: 'all' },
    ...locations.map((loc) => ({ label: loc.label, value: loc.value })),
  ]

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            type='text'
            placeholder='Search'
            value={globalFilter || ''}
            onChange={(e) => onGlobalFilterChange?.(e.target.value)}
            className='pl-9'
          />
        </div>
        {/* <Button variant='outline' size='lg'>
          <Search className='h-3.5 w-3.5' />
          Search
        </Button> */}

        {/* Filter Dropdowns */}
        <div className='flex flex-wrap items-center gap-2'>
          <CategoryTreeFilterPopover
            title='All categories'
            categories={categoryTree}
            selectedValues={selectedCategories}
            onValueChange={handleCategoryChange}
          />

          <Select
            value={selectedPriceRange || 'all'}
            onValueChange={(value) =>
              setSelectedPriceRange(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='min-w-[140px]'>
              <SelectValue placeholder='Price range' />
            </SelectTrigger>
            <SelectContent>
              {priceRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation || 'all'}
            onValueChange={(value) =>
              setSelectedLocation(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='min-w-[160px]'>
              <SelectValue placeholder='Ship from anywhere' />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedSupplier || 'all'}
            onValueChange={(value) =>
              setSelectedSupplier(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className='min-w-[140px]'>
              <SelectValue placeholder='All suppliers' />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Layout */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'>
        {paginatedData.map((product) => {
          const isFavorite = selectedItems.has(product.id)

          return (
            <div
              key={product.id}
              className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
              onClick={() =>
                navigate({
                  to: '/products/$productId',
                  params: { productId: product.id },
                  search: { from: undefined },
                })
              }
            >
              {/* Product Image */}
              <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              </div>

              {/* Product Info */}
              <div className='space-y-1.5 p-2.5'>
                {/* Product Title */}
                <h3 className='line-clamp-2 text-sm leading-tight font-semibold'>
                  {product.name}
                </h3>

                {/* SPU */}
                <p className='font-mono text-xs text-gray-600'>
                  HZ SPU : {product.sku}
                </p>

                {/* Price */}
                <div className='text-base font-bold'>
                  ${product.price.toFixed(2)}
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
                      toggleFavorite(product.id)
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
                      console.log('Add to cart:', product.id)
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
                      console.log('Add to store:', product.id)
                    }}
                  >
                    <Store className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {/* {filteredData.length > 0 && <DataTablePagination table={mockTable} />} */}

      {/* No Results */}
      {filteredData.length === 0 && (
        <div className='text-muted-foreground flex h-24 items-center justify-center'>
          No products found.
        </div>
      )}
    </div>
  )
}
