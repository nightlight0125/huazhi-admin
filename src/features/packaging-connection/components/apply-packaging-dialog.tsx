import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  addCuOdPdPackageAPI,
  addCuShopPackage,
  queryBindMaterialApi,
  queryCustomerBindPackageAPI,
  type PackMaterialItem,
} from '@/lib/api/products'
import { getUserShopOptions, type ShopOption } from '@/lib/utils/shop-utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { type PackagingProduct, type StoreSku } from '../data/schema'

interface ApplyPackagingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeSku: StoreSku | null
  onConfirm?: (selectedProducts: PackagingProduct[]) => void
  hideProductDetails?: boolean
  tabType?: 'products' | 'order' | 'stores'
}

export function ApplyPackagingDialog({
  open,
  onOpenChange,
  storeSku,
  onConfirm,
  hideProductDetails = false,
  tabType = 'products',
}: ApplyPackagingDialogProps) {
  const [skuSearch, setSkuSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  )
  const [applyToSpu, setApplyToSpu] = useState(false)
  const [packagingTypes, setPackagingTypes] = useState<PackMaterialItem[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)
  const [packagingProducts, setPackagingProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [shopOptions, setShopOptions] = useState<ShopOption[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [isLoadingShops, setIsLoadingShops] = useState(false)
  const { auth } = useAuthStore()

  // 获取包装材料类型列表
  useEffect(() => {
    if (!open) return

    const fetchPackagingTypes = async () => {
      setIsLoadingTypes(true)
      try {
        const result = await queryBindMaterialApi({
          data: {},
          pageSize: 100,
          pageNo: 1,
        })
        setPackagingTypes(result.rows)
      } catch (error) {
        console.error('Failed to fetch packaging types:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load packaging types. Please try again.'
        )
        setPackagingTypes([])
      } finally {
        setIsLoadingTypes(false)
      }
    }

    void fetchPackagingTypes()
  }, [open])

  // 加载店铺列表
  useEffect(() => {
    if (!open) return

    const userId = auth.user?.id
    if (!userId) return

    const fetchShops = async () => {
      setIsLoadingShops(true)
      try {
        const options = await getUserShopOptions(String(userId), 0, 100)
        setShopOptions(options)
        if (options.length > 0) {
          const raw = storeSku as Record<string, unknown>
          const storeShopId = String(
            raw.hzkj_od_pd_shop_id ??
              raw.hzkj_pk_shop_id ??
              raw.hzkj_shop_id ??
              ''
          )
          const match = options.find((o) => o.value === storeShopId)
          setSelectedShopId(match ? storeShopId : options[0].value)
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load shops. Please try again.'
        )
      } finally {
        setIsLoadingShops(false)
      }
    }

    void fetchShops()
  }, [open, auth.user?.id, storeSku])

  // 处理类型选择切换
  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(typeId)) {
        next.delete(typeId)
      } else {
        next.add(typeId)
      }
      return next
    })
  }

  // 当选择的类型变化时，调用API获取包装产品列表
  useEffect(() => {
    if (!open || !storeSku) return

    const customerId = auth.user?.customerId
    if (!customerId) return

    // 如果没有选择任何类型，清空列表
    if (selectedTypes.size === 0) {
      setPackagingProducts([])
      return
    }

    const fetchPackagingProducts = async () => {
      setIsLoadingProducts(true)
      try {
        const materialIds = Array.from(selectedTypes)
        const result = await queryCustomerBindPackageAPI({
          data: {
            number: skuSearch.trim() || undefined,
            hzkj_pack_material_id:
              materialIds.length > 0 ? materialIds : undefined,
            hzkj_cus_id: String(customerId),
            // hzkj_good_hzkj_goodtype_id: storeSku.id,
            hzkj_good_hzkj_goodtype_id: '2355273729791020032',
          },
          pageSize: 100,
          pageNo: 1,
        })
        setPackagingProducts(result.rows as any[])
      } catch (error) {
        console.error('Failed to fetch packaging products:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load packaging products. Please try again.'
        )
        setPackagingProducts([])
      } finally {
        setIsLoadingProducts(false)
      }
    }

    void fetchPackagingProducts()
  }, [open, storeSku, selectedTypes, skuSearch, auth.user?.customerId])

  // 过滤包装产品（使用从API获取的数据）
  const filteredProducts = useMemo(() => {
    let filtered = [...packagingProducts]

    // 根据 SKU 搜索过滤（如果API没有根据number过滤，这里可以再次过滤）
    if (skuSearch.trim()) {
      const searchTerm = skuSearch.toLowerCase()
      filtered = filtered.filter((product: any) => {
        const productSku =
          product.sku || product.number || product.hzkj_sku || ''
        const productName = product.name || product.hzkj_name || ''
        return (
          productSku.toLowerCase().includes(searchTerm) ||
          productName.toLowerCase().includes(searchTerm)
        )
      })
    }

    return filtered
  }, [packagingProducts, skuSearch])

  // 选择包装产品（单选）
  const handleProductSelect = (productId: string) => {
    setSelectedProducts(new Set([productId]))
  }

  const handleSearch = () => {
    // 搜索逻辑已在 useMemo 中处理
  }

  const handleConfirm = async () => {
    if (!storeSku) return

    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer ID not found. Please login again.')
      return
    }

    if (!selectedShopId?.trim()) {
      toast.error('Please select a store')
      return
    }

    const [selectedProduct] = filteredProducts.filter((p: any) =>
      selectedProducts.has(String(p.id || p.hzkj_sku_record_id))
    )

    if (!selectedProduct) {
      toast.error('Please select a packaging product')
      return
    }

    try {
      const orderProductId = String(storeSku.id || '')
      const packageId = String(
        selectedProduct.id ||
          selectedProduct.hzkj_shop_package_id ||
          selectedProduct.hzkj_shop_pd_package_id
      )

      // Add New Packaging（hideProductDetails）：店铺绑定包装 → addCuShopPackage
      if (hideProductDetails) {
        await addCuShopPackage({
          data: [
            {
              hzkj_shop_id: String(selectedShopId),
              hzkj_shop_pk_entry: [
                { hzkj_shop_package_id: packageId },
              ],
            },
          ],
        })
      } else {
        const payload = {
          data: [
            {
              id: orderProductId,
              hzkj_shop_pd_package_id: packageId,
              // 规则：Products tab = 2；Order/Store tab = 1
              hzkj_package_type: tabType === 'products' ? '2' : '1',
              hzkj_order_pd_pk_qty: 1,
            },
          ],
        }

        await addCuOdPdPackageAPI(payload)
      }

      toast.success('Packaging applied successfully')

      // 通知父组件，保留已有回调逻辑
      if (onConfirm) {
        onConfirm([selectedProduct] as any)
      }

      // 重置状态并关闭
      setSkuSearch('')
      setSelectedTypes(new Set())
      setSelectedProducts(new Set())
      setApplyToSpu(false)
      setSelectedShopId('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to apply packaging:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to apply packaging. Please try again.'
      )
    }
  }

  const handleCancel = () => {
    // 重置状态
    setSkuSearch('')
    setSelectedTypes(new Set())
    setSelectedProducts(new Set())
    setApplyToSpu(false)
    setSelectedShopId('')
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
            Apply Packaging to Store
          </h2>
        </div>

        <div className='flex-1 space-y-6 overflow-y-auto px-4 py-4'>
          {!hideProductDetails && (
            <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
              <div className='flex items-center gap-3'>
                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border'>
                  <img
                    src={storeSku.hzkj_variant_picture || storeSku.image || ''}
                    alt={
                      storeSku.hzkj_local_sku_hzkj_name ||
                      storeSku.hzkj_shop_package_hzkj_name ||
                      storeSku.name ||
                      ''
                    }
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <div className='text-sm font-medium'>
                    {storeSku.hzkj_local_sku_hzkj_name ||
                      storeSku.hzkj_shop_package_hzkj_name ||
                      storeSku.name}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    SKU:{' '}
                    {storeSku.hzkj_shop_sku ||
                      storeSku.hzkj_shop_package_number ||
                      storeSku.sku}
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Variant ID:{' '}
                    {storeSku.hzkj_variantid || storeSku.variantId || '---'}
                  </div>
                  <div className='mt-2 flex items-center gap-2'>
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
          )}

          {/* 店铺选择 */}
          <div className='space-y-2'>
            <Label htmlFor='store-select'>Store</Label>
            <Select
              value={selectedShopId}
              onValueChange={setSelectedShopId}
              disabled={isLoadingShops}
            >
              <SelectTrigger id='store-select'>
                <SelectValue
                  placeholder={
                    isLoadingShops
                      ? 'Loading stores...'
                      : shopOptions.length === 0
                        ? 'No stores available'
                        : 'Please select a store'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {shopOptions.map((shop) => (
                  <SelectItem key={shop.value} value={shop.value}>
                    {shop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 包装产品类型选择区域 */}
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>Packaging Products Type</h3>
            {isLoadingTypes ? (
              <div className='text-muted-foreground text-sm'>
                Loading types...
              </div>
            ) : (
              <div className='flex flex-wrap gap-3'>
                {packagingTypes.map((type) => (
                  <div key={type.id} className='flex items-center gap-2'>
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedTypes.has(type.id)}
                      onCheckedChange={() => handleTypeToggle(type.id)}
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className='cursor-pointer text-sm'
                    >
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
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
            </div>
          </div>

          {/* 包装产品列表 */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Packaging Products</h3>
            {isLoadingProducts ? (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                {selectedTypes.size === 0
                  ? 'Please select packaging types to view products'
                  : 'No products found'}
              </div>
            ) : (
              <div className='grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto md:grid-cols-3'>
                {filteredProducts.map((product: any) => {
                  const productId = String(
                    product.id || product.hzkj_sku_record_id
                  )
                  const isSelected = selectedProducts.has(productId)
                  return (
                    <div
                      key={productId}
                      className={`cursor-pointer space-y-2 rounded-lg border p-3 transition-colors ${
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleProductSelect(productId)}
                    >
                      <div className='relative h-32 w-full overflow-hidden rounded-md border'>
                        <img
                          src={product.hzkj_picturefield || ''}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <div className='space-y-1'>
                        <div>{product.hzkj_name || '---'}</div>
                        <div className='text-sm font-medium'>
                          $
                          {typeof product.hzkj_pur_price === 'number'
                            ? product.hzkj_pur_price.toFixed(2)
                            : '0.00'}
                        </div>
                        <div className='text-muted-foreground line-clamp-1 text-xs'>
                          SKU: {product.hzkj_sku_value || '---'}
                        </div>
                        <div className='text-muted-foreground line-clamp-1 text-xs'>
                          SPU: {product.number || '---'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-2 border-t px-4 py-3'>
          <Button variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedShopId?.trim()}
            className='bg-orange-600 text-white hover:bg-orange-700'
          >
            Confirm
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
