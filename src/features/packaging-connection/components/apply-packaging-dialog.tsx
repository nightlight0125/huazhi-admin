import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { type PackagingProduct, type StoreSku } from '../data/schema'

// 模拟包装产品数据
const mockPackagingProducts: PackagingProduct[] = [
  {
    id: '1',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 4.5,
    relatedTime: new Date(),
  },
  {
    id: '2',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 4.5,
    relatedTime: new Date(),
  },
  {
    id: '3',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 5.0,
    relatedTime: new Date(),
  },
  {
    id: '4',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 4.5,
    relatedTime: new Date(),
  },
  {
    id: '5',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 5.0,
    relatedTime: new Date(),
  },
  {
    id: '6',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&h=100&fit=crop',
    name: 'Dust-proof suede velvet drawstring drawstring storage bag',
    sku: 'SU00009859-Beige',
    variant: 'Small 30*30cm, 40*40cm, Large 45*50cm',
    price: 4.5,
    relatedTime: new Date(),
  },
]

interface ApplyPackagingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeSku: StoreSku | null
  onConfirm?: (selectedProducts: PackagingProduct[]) => void
}

export function ApplyPackagingDialog({
  open,
  onOpenChange,
  storeSku,
  onConfirm,
}: ApplyPackagingDialogProps) {
  const [skuSearch, setSkuSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  )
  const [applyToSpu, setApplyToSpu] = useState(false)

  // 过滤包装产品
  const filteredProducts = useMemo(() => {
    let filtered = [...mockPackagingProducts]

    // 根据 SKU 搜索过滤
    if (skuSearch.trim()) {
      const searchTerm = skuSearch.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.sku.toLowerCase().includes(searchTerm) ||
          product.name.toLowerCase().includes(searchTerm)
      )
    }

    // 根据选中的类型过滤（这里简化处理，实际应该根据产品类型字段过滤）
    // 暂时返回所有产品

    return filtered
  }, [skuSearch, selectedTypes])

  // Note: handleProductToggle is commented out because product selection checkboxes are currently disabled
  // const handleProductToggle = (productId: string) => {
  //   setSelectedProducts((prev) => {
  //     const next = new Set(prev)
  //     if (next.has(productId)) {
  //       next.delete(productId)
  //     } else {
  //       next.add(productId)
  //     }
  //     return next
  //   })
  // }

  const handleSearch = () => {
    // 搜索逻辑已在 useMemo 中处理
  }

  const handleConfirm = () => {
    const products = filteredProducts.filter((p) => selectedProducts.has(p.id))
    onConfirm?.(products)
    // 重置状态
    setSkuSearch('')
    setSelectedTypes(new Set())
    setSelectedProducts(new Set())
    setApplyToSpu(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    // 重置状态
    setSkuSearch('')
    setSelectedTypes(new Set())
    setSelectedProducts(new Set())
    setApplyToSpu(false)
    onOpenChange(false)
  }

  if (!storeSku) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex h-full w-full flex-col sm:!w-[65vw] sm:!max-w-none lg:!w-[960px]'
      >
        <div className='border-b px-4 py-3'>
          <h2 className='text-lg leading-tight font-semibold'>
            Apply Packaging to Product
          </h2>
        </div>

        <div className='flex-1 space-y-6 overflow-y-auto px-4 py-4'>
          {/* 产品详情区域 */}
          <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
            <div className='flex items-center gap-3'>
              <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border'>
                <img
                  src={storeSku.image}
                  alt={storeSku.name}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-image.png'
                  }}
                />
              </div>
              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{storeSku.name}</span>
                  <span className='rounded bg-green-100 px-2 py-0.5 text-xs text-green-800'>
                    SKU
                  </span>
                  <span className='rounded bg-green-100 px-2 py-0.5 text-xs text-green-800'>
                    Current
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  SKU: {storeSku.sku}
                </div>
                <div className='text-muted-foreground text-sm'>
                  Variant ID: {storeSku.variantId}
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='apply-to-spu'
                    checked={applyToSpu}
                    onCheckedChange={(checked) =>
                      setApplyToSpu(checked === true)
                    }
                  />
                  <Label
                    htmlFor='apply-to-spu'
                    className='cursor-pointer text-sm'
                  >
                    Apply to SPU
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* 搜索区域 */}
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>My Packaging</h3>
            <h3 className='text-sm font-medium'>Please search for SKU</h3>
            <div className='flex items-center gap-2'>
              <Input
                placeholder='SKU'
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                className='flex-1'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              {/* <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={handleSearch}
              >
                <Search className='h-4 w-4' />
              </Button> */}
            </div>
          </div>

          {/* 包装产品类型选择 */}
          {/* <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Packaging Products Type</h3>
            <div className='grid grid-cols-4 gap-3'>
              {packagingTypes.map((type) => (
                <div key={type} className='flex items-center gap-2'>
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.has(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className='flex-1 cursor-pointer text-sm'
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div> */}

          {/* 包装产品列表 */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Packaging Products</h3>
            <div className='grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3'>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className='hover:bg-muted/50 space-y-2 rounded-lg border p-3 transition-colors'
                >
                  <div className='relative h-32 w-full overflow-hidden rounded-md border'>
                    <img
                      src={product.image}
                      alt={product.name}
                      className='h-full w-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder-image.png'
                      }}
                    />
                  </div>
                  <div className='space-y-1'>
                    {/* <div className='text-muted-foreground line-clamp-2 text-xs'>
                      {product.variant}
                    </div> */}
                    <div className='text-sm font-medium'>
                      ${product.price.toFixed(2)}
                    </div>
                    <div className='text-muted-foreground line-clamp-1 text-xs'>
                      SKU: {product.sku}
                    </div>
                    <div className='text-muted-foreground line-clamp-2 text-xs'>
                      {product.name}
                    </div>
                  </div>
                  {/* <div className='flex items-center gap-2 pt-2'>
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                    />
                    <Label
                      htmlFor={`product-${product.id}`}
                      className='cursor-pointer text-xs'
                    >
                      Select
                    </Label>
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 border-t px-4 py-3'>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className='bg-orange-600 text-white hover:bg-orange-700'
          >
            Confirm
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
