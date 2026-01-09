import { useEffect, useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Heart, Search, ShoppingCart, Store } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getStatesList, type StateItem } from '@/lib/api/logistics'
import {
  collectProduct,
  queryGoodClassList,
  type GoodClassItem,
} from '@/lib/api/products'
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
import { priceRanges } from '@/features/products/data/data'
import { type Product } from '@/features/products/data/schema'

const route = getRouteApi('/_authenticated/all-products')

type AllProductsGridProps = {
  data: Product[]
}

// Category item type
type CategoryItem = {
  label: string
  value: string
  children?: CategoryItem[]
}

// Convert API data to category tree structure
function convertToCategoryTree(items: GoodClassItem[]): CategoryItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  // Create a map for quick lookup
  const itemMap = new Map<string, GoodClassItem>()
  items.forEach((item) => {
    const id = String(item.id || item.number || '')
    if (id) {
      itemMap.set(id, item)
    }
  })

  // Build tree structure
  const tree: CategoryItem[] = []
  const processed = new Set<string>()

  // First pass: find root items (items with hzkj_parent_id === "0" or empty)
  items.forEach((item) => {
    const id = String(item.id || item.number || '')
    if (!id || processed.has(id)) return

    // Use hzkj_parent_id, fallback to parent_id for backward compatibility
    const parentId = String(item.hzkj_parent_id || item.parent_id || '')

    // Root items: parent_id is "0" or empty, or parent not in the list
    if (parentId === '0' || !parentId || !itemMap.has(parentId)) {
      const categoryItem: CategoryItem = {
        label: String(item.name || item.number || ''),
        value: id,
      }
      tree.push(categoryItem)
      processed.add(id)
    }
  })

  // Second pass: add children recursively
  const addChildren = (parent: CategoryItem) => {
    items.forEach((item) => {
      const id = String(item.id || item.number || '')
      // Use hzkj_parent_id, fallback to parent_id for backward compatibility
      const parentId = String(item.hzkj_parent_id || item.parent_id || '')

      // If this item's parent matches the current parent and hasn't been processed
      if (id && parentId === parent.value && !processed.has(id)) {
        if (!parent.children) {
          parent.children = []
        }
        const categoryItem: CategoryItem = {
          label: String(item.name || item.number || ''),
          value: id,
        }
        parent.children.push(categoryItem)
        processed.add(id)
        // Recursively add children of this item
        addChildren(categoryItem)
      }
    })
  }

  // Add children to all root items
  tree.forEach(addChildren)

  // If no tree structure found, return flat list
  if (tree.length === 0) {
    return items.map((item) => ({
      label: String(item.name || item.number || ''),
      value: String(item.id || item.number || ''),
    }))
  }

  return tree
}

export function AllProductsGrid({ data }: AllProductsGridProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
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
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([])

  // Fetch category data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await queryGoodClassList('00000001', 1, 100)
        const tree = convertToCategoryTree(categories)
        setCategoryTree(tree)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load categories. Please try again.'
        )
        setCategoryTree([])
      }
    }

    void fetchCategories()
  }, [])

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
  }, [data, globalFilter, selectedCategories, categoryTree])

  const pageSize = pagination.pageSize || 8
  const pageIndex = (pagination.pageIndex || 0) + 1
  const startIndex = (pageIndex - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const [locationOptions, setLocationOptions] = useState<StateItem[]>([])

  const toggleFavorite = async (productId: string) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Please login first')
      return
    }

    try {
      // 调用收藏产品 API
      await collectProduct(productId, String(customerId))

      // 更新本地状态
      setSelectedItems((prev) => {
        const next = new Set(prev)
        if (next.has(productId)) {
          next.delete(productId)
          toast.success('Product removed from favorites')
        } else {
          next.add(productId)
          toast.success('Product added to favorites')
        }
        return next
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update favorite status. Please try again.'
      )
    }
  }

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

  useEffect(() => {
    const fetchLocationOptions = async () => {
      const locationOptions = await getStatesList()
      setLocationOptions(locationOptions)
    }
    void fetchLocationOptions()
  }, [])

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
                <SelectItem key={option.id} value={option.id}>
                  {option.hzkj_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
              <div className='relative aspect-[5/4] overflow-hidden bg-gray-100'>
                <img
                  src={product.image}
                  alt={product.name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
              </div>

              <div className='space-y-1.5 p-2.5'>
                <h3
                  className='overflow-hidden text-sm font-semibold break-words'
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.5',
                    maxHeight: '3em',
                    transform: 'translateZ(0)',
                  }}
                >
                  {product.name.trim().replace(/\s+/g, ' ')}
                </h3>

                <p className='font-mono text-xs text-gray-600'>
                  SPU:{product.sku}
                </p>

                <div className='text-base font-bold'>
                  ${product.price.toFixed(2)}
                </div>

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
      {filteredData.length === 0 && (
        <div className='text-muted-foreground flex h-24 items-center justify-center'>
          No products found.
        </div>
      )}
    </div>
  )
}
