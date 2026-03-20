import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addStock } from '@/lib/api/orders'
import type { ApiProductItem } from '@/lib/api/products'
import { selectSpecGetSku } from '@/lib/api/products'
import { useWarehouses } from '@/hooks/use-warehouses'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  ConfirmOrderItem,
  ConfirmOrderPayload,
} from './confirm-order-view'

interface ProductPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  mode: 'sample' | 'stock'
  onConfirmOrder?: (payload: ConfirmOrderPayload) => void
  apiProduct?: ApiProductItem | null
  initialSelectedSpecs?: Record<string, string> // 初始已选择的规格值
  defaultQuantity?: number // 从详情页传入的默认数量（Buy Sample / Buy Stock 时携带）
}

export function ProductPurchaseDialog({
  open,
  onOpenChange,
  productId,
  mode,
  onConfirmOrder,
  apiProduct,
  initialSelectedSpecs = {},
  defaultQuantity,
}: ProductPurchaseDialogProps) {
  void defaultQuantity
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  // 左侧规格多选：Record<specId, valueId[]>
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string[]>>(
    () =>
      Object.fromEntries(
        Object.entries(initialSelectedSpecs || {}).map(([k, v]) => [
          k,
          v ? [v] : [],
        ])
      )
  )

  // 全部 SKU 列表（弹框打开时一次性拉取）
  const [allSkus, setAllSkus] = useState<any[]>([])
  const [isLoadingAllSkus, setIsLoadingAllSkus] = useState(false)

  // 每个 SKU 独立数量，key 为 skuId，切换时保持
  const [variantQuantities, setVariantQuantities] = useState<
    Record<string, number>
  >({})

  const extractName = (name: unknown): string => {
    if (typeof name === 'string') {
      return name
    }
    if (name && typeof name === 'object') {
      const nameObj = name as Record<string, unknown>
      return (
        (nameObj.zh_CN as string) ||
        (nameObj.GLang as string) ||
        (nameObj.en as string) ||
        (Object.values(nameObj).find((v) => typeof v === 'string') as string) ||
        ''
      )
    }
    return ''
  }

  // 根据左侧规格多选筛选右侧 SKU：未选规格时显示全部，选了则过滤
  const displayedVariants = useMemo(() => {
    if (!allSkus.length) return []
    const hasAnySpec = Object.values(selectedSpecs).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    )
    if (!hasAnySpec) return allSkus
    return allSkus.filter((sku) => {
      const skuSpecValues = sku.specValues as Record<string, string> | undefined
      if (!skuSpecValues) return true
      for (const [specId, selectedVals] of Object.entries(selectedSpecs)) {
        if (!Array.isArray(selectedVals) || selectedVals.length === 0) continue
        if (!selectedVals.includes(skuSpecValues[specId])) return false
      }
      return true
    })
  }, [allSkus, selectedSpecs])

  const totalPrice = (
    displayedVariants.length === 1
      ? (() => {
          const v = displayedVariants[0]
          const skuId = v?.id ? String(v.id) : ''
          const qty = Math.max(1, variantQuantities[skuId] ?? 1)
          const variantPrice =
            v?.price ??
            (typeof apiProduct?.hzkj_pur_price === 'number'
              ? apiProduct.hzkj_pur_price
              : 0)
          return (qty * (typeof variantPrice === 'number' ? variantPrice : 0)).toFixed(2)
        })()
      : '0.00'
  )

  const updateQuantity = (
    skuId: string,
    deltaOrValue: number | 'set',
    value?: number
  ) => {
    setVariantQuantities((prev) => {
      const current = prev[skuId] ?? 0
      const next =
        deltaOrValue === 'set' && value !== undefined
          ? Math.max(0, value)
          : Math.max(0, current + (deltaOrValue as number))
      if (next === 0 && !(skuId in prev)) return prev
      return { ...prev, [skuId]: next }
    })
  }

  // 获取规格数据
  const skuSpecs =
    apiProduct &&
    Array.isArray((apiProduct as Record<string, unknown>)?.hzkj_sku_spec_e)
      ? ((apiProduct as Record<string, unknown>).hzkj_sku_spec_e as Array<{
          hzkj_sku_spec_id?: string
          hzkj_sku_spec_name?: string
          hzkj_sku_spec_enname?: string
          hzkj_sku_specvalue_e?: Array<{
            hzkj_sku_specvalue_id?: string
            hzkj_sku_specvalue_name?: string
            hzkj_sku_specvalue_enname?: string
            [key: string]: unknown
          }>
          [key: string]: unknown
        }>)
      : []

  // 仓库选择（使用 API 获取）
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    string | undefined
  >()
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } =
    useWarehouses()

  const hasShippingAddress = false

  // 弹框打开时：保留外层传入的规格筛选，重置数量
  useEffect(() => {
    if (open) {
      if (
        initialSelectedSpecs &&
        Object.keys(initialSelectedSpecs).length > 0
      ) {
        setSelectedSpecs(
          Object.fromEntries(
            Object.entries(initialSelectedSpecs).map(([k, v]) => [
              k,
              v ? [v] : [],
            ])
          )
        )
      } else {
        setSelectedSpecs({})
      }
      setVariantQuantities({})
    }
  }, [open])

  // 弹框打开时拉取全部 SKU（遍历所有规格组合）
  useEffect(() => {
    if (!open || !productId || !apiProduct) {
      setAllSkus([])
      return
    }

    const fetchAllSkus = async () => {
      if (skuSpecs.length === 0) {
        // 无规格时尝试空 specIds
        setIsLoadingAllSkus(true)
        try {
          const res = await selectSpecGetSku({ productId, specIds: [] })
          const data = Array.isArray(res.data) ? res.data : []
          const withSpec = data.map((item: any) => ({
            ...item,
            specValues: {} as Record<string, string>,
          }))
          setAllSkus(withSpec)
        } catch {
          setAllSkus([])
        } finally {
          setIsLoadingAllSkus(false)
        }
        return
      }

      // 生成所有规格组合的笛卡尔积
      const valueArrays = skuSpecs
        .filter(
          (s) => s.hzkj_sku_spec_id && Array.isArray(s.hzkj_sku_specvalue_e)
        )
        .map((s) =>
          (s.hzkj_sku_specvalue_e || []).map((v) => ({
            specId: s.hzkj_sku_spec_id!,
            valueId: v.hzkj_sku_specvalue_id || '',
          }))
        )
        .filter((arr) => arr.length > 0)

      if (valueArrays.length === 0) {
        setAllSkus([])
        return
      }

      const cartesian = <T,>(arrays: T[][]): T[][] =>
        arrays.reduce(
          (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
          [[]] as T[][]
        )

      const combinations = cartesian(valueArrays) as {
        specId: string
        valueId: string
      }[][]

      setIsLoadingAllSkus(true)
      const seenIds = new Set<string>()
      const merged: any[] = []

      try {
        await Promise.all(
          combinations.map(async (combo) => {
            const specIds = combo.map((c) => c.valueId).filter(Boolean)
            if (specIds.length === 0) return
            const specValues = combo.reduce(
              (acc, c) => ({ ...acc, [c.specId]: c.valueId }),
              {} as Record<string, string>
            )
            try {
              const res = await selectSpecGetSku({ productId, specIds })
              const data = Array.isArray(res.data) ? res.data : []
              for (const item of data) {
                const id = item?.id ? String(item.id) : ''
                if (id && !seenIds.has(id)) {
                  seenIds.add(id)
                  merged.push({ ...item, specValues })
                }
              }
            } catch {
              // 单个组合失败忽略
            }
          })
        )
        setAllSkus(merged)
      } catch (error) {
        console.error('Failed to fetch all SKUs:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load SKUs. Please try again.'
        )
        setAllSkus([])
      } finally {
        setIsLoadingAllSkus(false)
      }
    }

    void fetchAllSkus()
  }, [open, productId, apiProduct, skuSpecs])

  const canBuyNow = displayedVariants.length === 1

  const handleBuyNow = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!canBuyNow) {
      toast.error('Please select complete SKU')
      return
    }

    const singleVariant = displayedVariants[0]
    const skuId = String(singleVariant?.id ?? '')
    const qty = Math.max(1, variantQuantities[skuId] ?? 1)
    const validVariants = [
      { ...singleVariant, quantity: qty },
    ]

    void doBuyNow(validVariants)
  }

  const doBuyNow = async (validVariants: any[]) => {

    if (mode === 'stock') {
      if (!selectedWarehouse) {
        toast.error('Please select warehouse')
        return
      }
      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('Customer ID not found. Please sign in again.')
        return
      }
      try {
        const stockItems = validVariants
          .map((v: any) => ({
            skuId: String(v.id),
            qty: Math.max(0, Number(v.quantity) || 0),
          }))
          .filter((item) => item.qty > 0)
        await addStock({
          stockType: '1',
          stockItems,
          warehouseId: selectedWarehouse,
          customerId: String(customerId),
        })
        toast.success('Stock added successfully')
        onOpenChange(false)
        navigate({ to: '/stock-orders' })
        return
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to add stock. Please try again.'
        )
        return
      }
    }

    // 构建确认订单数据（sample 模式或走确认订单流程）

    const orderItems: ConfirmOrderItem[] = validVariants.map((variant: any) => {
      const specValues = variant.specValues || {}
      const specNames: string[] = []
      for (const spec of skuSpecs) {
        const selectedValueId = specValues[spec.hzkj_sku_spec_id || '']
        if (selectedValueId) {
          const value = spec.hzkj_sku_specvalue_e?.find(
            (v) => v.hzkj_sku_specvalue_id === selectedValueId
          )
          if (value) {
            specNames.push(
              value.hzkj_sku_specvalue_enname ||
                value.hzkj_sku_specvalue_name ||
                ''
            )
          }
        }
      }
      const displayName = specNames.join(' - ') || 'Default'

      // 产品主标题：优先用后端 hzkj_enname 的 GLang 或 zh_CN
      const en = (apiProduct as Record<string, unknown>)?.hzkj_enname
      let productTitle = extractName(apiProduct?.name) || 'Product'
      if (en != null && typeof en === 'string') productTitle = en
      else if (en != null && typeof en === 'object') {
        const obj = en as Record<string, unknown>
        productTitle =
          (obj.GLang as string) || (obj.zh_CN as string) || productTitle
      }

      return {
        id: variant.id,
        image:
          (typeof variant.pic === 'string' ? variant.pic : '') ||
          (typeof variant.image === 'string' ? variant.image : '') ||
          (typeof apiProduct?.hzkj_picurl_tag === 'string'
            ? apiProduct.hzkj_picurl_tag
            : ''),
        name: `${productTitle} - ${displayName}`,
        sku:
          variant.sku ||
          variant.number ||
          variant.id ||
          `${apiProduct?.number || productId}`,
        price:
          typeof variant.price === 'number'
            ? variant.price
            : typeof apiProduct?.hzkj_pur_price === 'number'
              ? apiProduct.hzkj_pur_price
              : 0,
        discountedPrice:
          typeof variant.price === 'number'
            ? variant.price
            : typeof apiProduct?.hzkj_pur_price === 'number'
              ? apiProduct.hzkj_pur_price
              : 0,
        weight: 45,
        quantity: variant.quantity ?? 0,
        fee:
          (typeof variant.price === 'number'
            ? variant.price
            : typeof apiProduct?.hzkj_pur_price === 'number'
              ? apiProduct.hzkj_pur_price
              : 0) * (variant.quantity ?? 0),
      }
    })

    const payload: ConfirmOrderPayload = {
      productId: productId,
      items: orderItems,
      mode: mode,
      totalPrice: parseFloat(totalPrice),
      discountedTotalPrice: parseFloat(totalPrice), // 可以根据需要添加折扣逻辑
      selectedWarehouse: selectedWarehouse,
      hasShippingAddress: hasShippingAddress,
    }

    // 调用回调而不是跳转路由
    if (onConfirmOrder) {
      onConfirmOrder(payload)
    } else {
      // 如果没有提供回调，保持原有行为（向后兼容）
      if (mode === 'sample') {
        navigate({ to: '/sample-orders' })
      } else {
        navigate({ to: '/stock-orders' })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl lg:max-w-3xl'>
        <DialogHeader>
          <DialogTitle className='text-lg'>
            {mode === 'sample'
              ? 'Create a sample order'
              : 'Create a stock order'}
          </DialogTitle>
        </DialogHeader>

        <div>
          <CardContent className='p-2'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
              <div className='w-full max-w-[240px] md:col-span-3'>
                <div className='aspect-square overflow-hidden rounded-lg border bg-gray-100'>
                  {typeof apiProduct?.hzkj_picurl_tag === 'string' &&
                  apiProduct.hzkj_picurl_tag ? (
                    <img
                      src={apiProduct.hzkj_picurl_tag}
                      alt={extractName(apiProduct?.name) || 'Product'}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-gray-400'>
                      No Image
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧：产品标题、价格、SPU */}
              <div className='flex flex-col justify-center space-y-2 md:col-span-9'>
                <h2 className='text-xl font-semibold'>
                  {(() => {
                    const en = (apiProduct as Record<string, unknown>)
                      ?.hzkj_enname
                    if (en != null && typeof en === 'string') return en
                    if (en != null && typeof en === 'object') {
                      const obj = en as Record<string, unknown>
                      return (
                        (obj.GLang as string) || (obj.zh_CN as string) || ''
                      )
                    }
                    return extractName(apiProduct?.name) || 'Product'
                  })()}
                </h2>
                <div className='text-muted-foreground text-sm'>
                  Product Price:{' '}
                  <span className='text-primary text-2xl font-bold'>
                    $
                    {typeof apiProduct?.hzkj_pur_price === 'number'
                      ? apiProduct.hzkj_pur_price.toFixed(2)
                      : '0.00'}
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  SPU:{' '}
                  <span className='font-medium'>
                    {apiProduct?.number || productId}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-[240px_minmax(0,1fr)] gap-0 border-t pt-4'>
              {/* 左侧：规格多选筛选（可选，用于过滤右侧 SKU） */}
              <div className='max-h-[320px] overflow-y-auto border-r pr-4'>
                <p className='text-muted-foreground mb-2 text-xs'>
                  Filter by spec (optional, multi-select)
                </p>
                {skuSpecs.map((spec) => {
                  const specId = spec.hzkj_sku_spec_id || ''
                  const selectedVals = selectedSpecs[specId] ?? []
                  return (
                    <div key={specId} className='mb-6'>
                      <h3 className='mb-2 text-xs font-semibold'>
                        {spec.hzkj_sku_spec_enname || ''}
                      </h3>
                      <div className='space-y-2'>
                        {Array.isArray(spec.hzkj_sku_specvalue_e) &&
                          spec.hzkj_sku_specvalue_e.map((value) => {
                            const valueId = value.hzkj_sku_specvalue_id || ''
                            const isChecked = selectedVals.includes(valueId)
                            return (
                              <button
                                key={valueId}
                                onClick={() => {
                                  setSelectedSpecs((prev) => {
                                    const curr = prev[specId] ?? []
                                    const next = isChecked
                                      ? curr.filter((id) => id !== valueId)
                                      : [...curr, valueId]
                                    return { ...prev, [specId]: next }
                                  })
                                }}
                                className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                                  isChecked
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border bg-background hover:bg-accent'
                                }`}
                              >
                                {value.hzkj_sku_specvalue_enname || ''}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 右侧：全部/筛选后的 SKU 列表，每个 SKU 独立数量 */}
              <div className='flex max-h-[320px] flex-col overflow-y-auto pl-4'>
                <div className='space-y-2 pr-1'>
                  <h3 className='text-xs font-semibold'>
                    {Object.values(selectedSpecs).some(
                      (arr) => Array.isArray(arr) && arr.length > 0
                    )
                      ? 'Filtered Variants'
                      : 'All Variants'}
                  </h3>
                  <div className='space-y-2'>
                    {isLoadingAllSkus ? (
                      <div className='flex items-center justify-center gap-2 rounded-lg border p-6'>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        <span className='text-muted-foreground text-sm'>
                          Loading SKUs...
                        </span>
                      </div>
                    ) : displayedVariants.length === 0 ? (
                      <div className='text-muted-foreground py-4 text-center text-sm'>
                        No variant available
                      </div>
                    ) : (
                      displayedVariants.map((variant: any) => {
                        const skuId = String(variant.id ?? '')
                        const qty = variantQuantities[skuId] ?? 0
                        return (
                          <div
                            key={variant.id}
                            className='flex items-center gap-3 rounded-lg border p-3'
                          >
                            {variant.pic ? (
                              <img
                                src={variant.pic}
                                alt=''
                                className='h-12 w-12 rounded object-cover'
                              />
                            ) : (
                              <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                                No Img
                              </div>
                            )}
                            <div className='flex-1'>
                              <div className='mb-0.5 text-sm font-medium'>
                                {variant.enname?.GLang || ''}
                              </div>
                              <div className='text-muted-foreground mb-1 text-[11px]'>
                                SKU: {variant.id}
                              </div>
                              <div className='text-primary text-sm font-semibold'>
                                $
                                {typeof variant.price === 'number'
                                  ? variant.price.toFixed(2)
                                  : '0.00'}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => updateQuantity(skuId, -1)}
                                disabled={qty <= 0}
                              >
                                <Minus className='h-4 w-4' />
                              </Button>
                              <Input
                                type='number'
                                value={qty}
                                onChange={(e) => {
                                  const v = Math.max(
                                    0,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                  updateQuantity(skuId, 'set', v)
                                }}
                                className='h-7 w-14 text-center text-xs'
                                min={0}
                              />
                              <Button
                                variant='outline'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => updateQuantity(skuId, 1)}
                              >
                                <Plus className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className='mt-3 border-t pt-2'>
                  <div className='flex items-center justify-between text-sm font-semibold'>
                    <span>Total:</span>
                    <span className='text-primary'>${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        <div className='mt-4 flex flex-col gap-3 border-t pt-3 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1 text-sm md:mr-auto'>
            {mode === 'stock' && (
              <div className='flex items-center gap-2'>
                <span>Shipping Warehouse:</span>
                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                  disabled={isLoadingWarehouses}
                >
                  <SelectTrigger className='h-8 w-[200px] text-xs'>
                    <SelectValue
                      placeholder={
                        isLoadingWarehouses
                          ? 'Loading...'
                          : 'Please select warehouse'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.length > 0 ? (
                      warehouseOptions.map((wh) => (
                        <SelectItem key={wh.value} value={wh.value}>
                          {wh.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value='' disabled>
                        {isLoadingWarehouses
                          ? 'Loading...'
                          : 'No warehouse available'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className='flex flex-wrap justify-end gap-2'>
            <Button
              type='button'
              size='sm'
              className='min-w-[120px] bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50'
              onClick={(e) => handleBuyNow(e)}
              disabled={!canBuyNow}
              title={!canBuyNow ? 'Please select complete SKU' : undefined}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
