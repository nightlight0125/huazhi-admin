import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Heart, ShoppingCart, Store } from 'lucide-react'
import { toast } from 'sonner'
import { queryGoodClassList, type GoodClassItem } from '@/lib/api/products'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { CategoryTreeFilterPopover } from '@/components/category-tree-filter-popover'
import { FilterToolbar } from '@/components/filter-toolbar'
import { ImageSearchInput } from '@/components/image-search-input'
import { PriceRangePopover } from '@/components/price-range-popover'
import { type Product } from '@/features/products/data/schema'

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

type ProductsGridProps = {
  data: Product[]
  search: any
  navigate: any
}

export function ProductsGrid({ data, search, navigate }: ProductsGridProps) {
  const nav = useNavigate()
  const location = useLocation()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<
    { min: number; max: number } | undefined
  >(undefined)
  const [categoryTree, setCategoryTree] = useState<CategoryItem[]>([])

  // Fetch category data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await queryGoodClassList('00000001', 1, 100)
        const tree = convertToCategoryTree(categories)
        setCategoryTree(tree)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
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
  // TODO: Location and supplier filters will be implemented in the future
  // const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
  //   undefined
  // )
  // const [selectedSupplier, setSelectedSupplier] = useState<string | undefined>(
  //   undefined
  // )

  // Synced with URL states
  const { globalFilter, onGlobalFilterChange, pagination } = useTableUrlState({
    search,
    navigate: navigate as any,
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

    // Apply price range filter
    if (selectedPriceRange) {
      result = result.filter(
        (product) =>
          product.price >= selectedPriceRange.min &&
          product.price <= selectedPriceRange.max
      )
    }

    // Apply location filter
    // TODO: Implement location filter when selectedLocation is used
    // if (selectedLocation) {
    //   result = result.filter(
    //     (product) => product.shippingLocation === selectedLocation
    //   )
    // }

    return result
  }, [
    data,
    globalFilter,
    selectedCategories,
    selectedPriceRange,
    categoryTree,
    // selectedLocation,
  ])

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

  // TODO: Location and supplier options will be used when filters are implemented
  // const locationOptions = [
  //   { label: ' Ship from anywhere', value: 'all' },
  //   ...locations.map((loc) => ({ label: loc.label, value: loc.value })),
  // ]

  // const supplierOptions = [
  //   { label: 'All suppliers', value: 'all' },
  //   ...suppliers
  //     .filter((s) => s.value !== 'all')
  //     .map((s) => ({ label: s.label, value: s.value })),
  // ]

  return (
    <div className='space-y-4'>
      <FilterToolbar
        showSearch={false}
        searchPlaceholder='Search'
        searchValue={globalFilter || ''}
        onSearchChange={(value) => onGlobalFilterChange?.(value)}
        filters={[
          <ImageSearchInput
            value={globalFilter || ''}
            onChange={(e) => onGlobalFilterChange?.(e.target.value)}
            onImageSearchClick={() => {
              /* 打开上传图片 / 图片搜索弹窗 */
            }}
          />,
          <CategoryTreeFilterPopover
            key='category'
            title='All categories'
            categories={categoryTree}
            selectedValues={selectedCategories}
            onValueChange={handleCategoryChange}
          />,
          <PriceRangePopover
            key='price'
            value={selectedPriceRange}
            onChange={setSelectedPriceRange}
          />,
        ]}
      />

      {/* Grid Layout */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6'>
        {paginatedData.map((product) => {
          const isFavorite = selectedItems.has(product.id)

          return (
            <div
              key={product.id}
              className='group bg-card relative cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md'
              onClick={() => {
                // 根据当前路由确定来源
                let fromValue: string | undefined = undefined
                if (location.pathname.includes('/winning-products')) {
                  fromValue = 'winning-products'
                } else if (location.pathname.includes('/all-products')) {
                  fromValue = 'all-products'
                }

                nav({
                  to: '/products/$productId',
                  params: { productId: product.id },
                  search: { from: fromValue },
                })
              }}
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
                <h3 className='line-clamp-2 h-10 text-sm leading-tight font-semibold'>
                  {product.name}
                </h3>

                {/* SPU */}
                <p className='font-mono text-xs text-gray-600'>
                  SPU:{product.sku}
                </p>

                {/* Price */}
                <div className='text-base font-bold text-orange-500'>
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

      {/* No Results */}
      {filteredData.length === 0 && (
        <div className='text-muted-foreground flex h-24 items-center justify-center'>
          No products found.
        </div>
      )}
    </div>
  )
}
