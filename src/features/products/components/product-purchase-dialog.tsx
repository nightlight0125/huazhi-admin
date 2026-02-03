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
import { useWarehouses } from '@/hooks/use-warehouses'
import type { ApiProductItem } from '@/lib/api/products'
import { selectSpecGetSku } from '@/lib/api/products'
import { useNavigate } from '@tanstack/react-router'
import { Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
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
}

export function ProductPurchaseDialog({
  open,
  onOpenChange,
  productId,
  mode,
  onConfirmOrder,
  apiProduct,
  initialSelectedSpecs = {},
}: ProductPurchaseDialogProps) {
  const navigate = useNavigate()


  const processedVariantIdsRef = useRef<Set<string>>(new Set())

  const [selectedSpecs, setSelectedSpecs] = useState<
    Record<string, string>
  >(initialSelectedSpecs)

  const [selectedVariants, setSelectedVariants] = useState<
    any[]
  >([])

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

  const totalPrice = (
    selectedVariants.reduce(
      (sum, v) => {
        const variantPrice = v.price ?? (typeof apiProduct?.hzkj_pur_price === 'number' ? apiProduct.hzkj_pur_price : 0)
        return sum + (v.quantity || 1) * (typeof variantPrice === 'number' ? variantPrice : 0)
      },
      0
    ) || 0
  ).toFixed(2)

  // 获取规格数据
  const skuSpecs =
    apiProduct &&
    Array.isArray(
      (apiProduct as Record<string, unknown>)?.hzkj_sku_spec_e
    )
      ? ((apiProduct as Record<string, unknown>)
          .hzkj_sku_spec_e as Array<{
          hzkj_sku_spec_id?: string
          hzkj_sku_spec_name?: string
          hzkj_sku_specvalue_e?: Array<{
            hzkj_sku_specvalue_id?: string
            hzkj_sku_specvalue_name?: string
            [key: string]: unknown
          }>
          [key: string]: unknown
        }>)
      : []

  // 仓库选择（使用 API 获取）
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    string | undefined
  >()
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } = useWarehouses()

  const hasShippingAddress = false

  useEffect(() => {
    if (open) {
      if (Object.keys(initialSelectedSpecs).length > 0) {
        setSelectedSpecs(initialSelectedSpecs)
      } else {
        setSelectedSpecs({})
      }
      setSelectedVariants([])
    }
  }, [open, initialSelectedSpecs])

  useEffect(() => {
    if (!open) {
      processedVariantIdsRef.current = new Set()
      return
    }

    const fetchSkuData = async () => {
      // 检查是否所有规格都已选择
      const allSpecsSelected = skuSpecs.every(
        (s) =>
          s.hzkj_sku_spec_id &&
          selectedSpecs[s.hzkj_sku_spec_id] !== undefined &&
          selectedSpecs[s.hzkj_sku_spec_id] !== ''
      )

      if (!allSpecsSelected || skuSpecs.length === 0) {
        setSelectedVariants([])
        return
      }

      // 提取规格值ID列表（specIds）
      const specIds = Object.values(selectedSpecs)
        .filter((id): id is string => typeof id === 'string' && id !== '')

      if (specIds.length === 0) {
        setSelectedVariants([])
        return
      }

      // 检查是否已经处理过这个规格组合
      const specKey = specIds.join('-')
      if (processedVariantIdsRef.current.has(specKey)) {
        return
      }

      processedVariantIdsRef.current.add(specKey)

      // 设置加载状态
      setSelectedVariants([{ loading: true }])

      const test = {
        "productId":"2395215103260637184",
        "specIds":[
          "2366744046996603904",
          "2395147055661068288"
        ]
      }

      try {
        // 调用 API 获取 SKU 数据
        const response = await selectSpecGetSku({
          // productId,
          // specIds,
          ...test,
        })
        const skuData = response.data
        console.log(skuData, 'skuData==========11111111111==========')
        // API 返回的数据是数组，需要遍历处理
        if (Array.isArray(skuData) && skuData.length > 0) {
          const variants = skuData.map((item) => ({
            ...item,
            specValues: selectedSpecs,
            quantity: item.quantity || 1,
          }))
          console.log('Setting selectedVariants:', variants)
          setSelectedVariants(variants)
        } else {
          console.log('skuData is not an array or is empty')
          setSelectedVariants([])
        }

        // 只使用 API 返回的数据
        // if (skuData && skuData.id) {
        //   setSelectedVariants([
        //     {
        //       id: skuData.id,
        //       sku: skuData.sku,
        //       price: skuData.price,
        //       image: skuData.image,
        //       specValues: selectedSpecs,
        //       quantity: 1,
        //       loading: false,
        //     },
        //   ])
        // } else {
        //   setSelectedVariants([])
        // }
      } catch (error) {
        console.error('Failed to fetch SKU data:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load SKU data. Please try again.'
        )
        processedVariantIdsRef.current.delete(specKey)
        setSelectedVariants([])
      }
    }
    fetchSkuData()
  }, [open, productId, selectedSpecs, skuSpecs]) 

  const handleBuyNow = () => {
    if (mode === 'stock') {
      if (!selectedWarehouse) {
        return
      }
      navigate({ to: '/stock-orders' })
    }

    // 构建确认订单数据
    if (!selectedVariants || selectedVariants.length === 0) {
      toast.error('Please select a variant')
      return
    }

    const orderItems: ConfirmOrderItem[] = selectedVariants.map((variant) => {
      // 根据选中的规格值构建显示名称
      const specNames: string[] = []
      const specValues = variant.specValues || selectedSpecs
      for (const spec of skuSpecs) {
        const selectedValueId = specValues[spec.hzkj_sku_spec_id || '']
        if (selectedValueId) {
          const value = spec.hzkj_sku_specvalue_e?.find(
            (v) => v.hzkj_sku_specvalue_id === selectedValueId
          )
          if (value) {
            specNames.push(value.hzkj_sku_specvalue_name || '')
          }
        }
      }
      const displayName = specNames.join(' - ') || 'Default'

      return {
        id: variant.id,
        image: (typeof variant.pic === 'string' ? variant.pic : '') || (typeof variant.image === 'string' ? variant.image : '') || (typeof apiProduct?.hzkj_picurl_tag === 'string' ? apiProduct.hzkj_picurl_tag : ''),
        name: `${extractName(apiProduct?.name) || 'Product'} - ${displayName}`,
        sku: variant.sku || variant.number || variant.id || `${apiProduct?.number || productId}`,
        price: typeof variant.price === 'number' ? variant.price : (typeof apiProduct?.hzkj_pur_price === 'number' ? apiProduct.hzkj_pur_price : 0),
        discountedPrice: typeof variant.price === 'number' ? variant.price : (typeof apiProduct?.hzkj_pur_price === 'number' ? apiProduct.hzkj_pur_price : 0),
        weight: 45,
        quantity: variant.quantity || 1,
        fee: ((typeof variant.price === 'number' ? variant.price : (typeof apiProduct?.hzkj_pur_price === 'number' ? apiProduct.hzkj_pur_price : 0)) * (variant.quantity || 1)),
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
                  {typeof apiProduct?.hzkj_picurl_tag === 'string' && apiProduct.hzkj_picurl_tag ? (
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
                <h2 className='text-xl font-semibold'>{extractName(apiProduct?.name) || 'Product'}</h2>
                <div className='text-muted-foreground text-sm'>
                  Product Price:{' '}
                  <span className='text-primary text-2xl font-bold'>
                    ${typeof apiProduct?.hzkj_pur_price === 'number' ? apiProduct.hzkj_pur_price.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  SPU: <span className='font-medium'>{apiProduct?.number || productId}</span>
                </div>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-[240px_minmax(0,1fr)] gap-0 border-t pt-4'>
              <div className='max-h-[320px] overflow-y-auto border-r pr-4'>
                {skuSpecs.map((spec) => (
                  <div key={spec.hzkj_sku_spec_id || ''} className='mb-6'>
                    <h3 className='mb-2 text-xs font-semibold'>
                      {spec.hzkj_sku_spec_name || ''}
                    </h3>
                    <div className='space-y-2'>
                      {Array.isArray(spec.hzkj_sku_specvalue_e) &&
                        spec.hzkj_sku_specvalue_e.map((value) => (
                          <button
                            key={value.hzkj_sku_specvalue_id || ''}
                            onClick={() => {
                              const newSelectedSpecs = {
                                ...selectedSpecs,
                                [spec.hzkj_sku_spec_id || '']:
                                  value.hzkj_sku_specvalue_id || '',
                              }
                              setSelectedSpecs(newSelectedSpecs)
                            }}
                            className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                              selectedSpecs[spec.hzkj_sku_spec_id || ''] ===
                              value.hzkj_sku_specvalue_id
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border bg-background hover:bg-accent'
                            }`}
                          >
                            {value.hzkj_sku_specvalue_name || ''}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 右侧：已选变体列表（可滚动） + 列表内部总价 */}
              <div className='flex max-h-[320px] flex-col overflow-y-auto pl-4'>
                <div className='space-y-2 pr-1'>
                  <h3 className='text-xs font-semibold'>Selected Variants</h3>
                  <div className='space-y-2'>
                    {selectedVariants.length === 0 ? (
                      <div className='text-muted-foreground text-center text-sm py-4'>
                        No variant selected
                      </div>
                    ) : selectedVariants.map((variant: any) => {
                      if (variant.loading) {
                        return (
                          <div
                            key="loading"
                            className='flex items-center justify-center rounded-lg border p-3'
                          >
                            <div className='text-muted-foreground text-sm'>Loading...</div>
                          </div>
                        )
                      }
                      return (
                        <div
                          key={variant.id}
                          className='flex items-center gap-3 rounded-lg border p-3'
                        >
                          {variant.pic ? (
                            <img
                              src={variant.pic}
                              className='h-12 w-12 rounded object-cover'
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                              No Img
                            </div>
                          )}
                          <div className='flex-1'>
                            <div className='mb-0.5 text-sm font-medium'>
                              {variant.name?.GLang || ''}
                            </div>
                            <div className='text-muted-foreground mb-1 text-[11px]'>
                              SKU: {variant.id}
                            </div>
                            <div className='text-primary text-sm font-semibold'>
                              ${typeof variant.price === 'number' ? variant.price.toFixed(2) : '0.00'}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setSelectedVariants((prev: any[]) => {
                                  if (!Array.isArray(prev)) return prev
                                  return prev.map((v) =>
                                    v.id === variant.id
                                      ? {
                                          ...v,
                                          quantity: Math.max(0, (v.quantity || 1) - 1),
                                        }
                                      : v
                                  )
                                })
                              }}
                              disabled={(variant.quantity || 1) <= 0}
                            >
                              <Minus className='h-4 w-4' />
                            </Button>
                            <Input
                              type='number'
                              value={variant.quantity || 1}
                              onChange={(e) => {
                                const newQuantity = Math.max(
                                  0,
                                  parseInt(e.target.value) || 0
                                )
                                setSelectedVariants((prev: any[]) => {
                                  if (!Array.isArray(prev)) return prev
                                  return prev.map((v) =>
                                    v.id === variant.id
                                      ? { ...v, quantity: newQuantity }
                                      : v
                                  )
                                })
                              }}
                              className='h-7 w-14 text-center text-xs'
                              min={0}
                            />
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setSelectedVariants((prev: any[]) => {
                                  if (!Array.isArray(prev)) return prev
                                  return prev.map((v) =>
                                    v.id === variant.id
                                      ? { ...v, quantity: (v.quantity || 1) + 1 }
                                      : v
                                  )
                                })
                              }}
                            >
                              <Plus className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 列表下方：总价条（在右侧列表内部底部） */}
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

        {/* 底部操作按钮区域，贴近弹框底部（不再包含 Total） */}
        <div className='mt-4 flex flex-col gap-3 border-t pt-3 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1 text-sm md:mr-auto'>
            {/* {mode === 'sample' &&
              (hasShippingAddress ? (
                <div>Shipping Address: 广东省广州市天河区</div>
              ) : (
                <button
                  type='button'
                  className='text-primary text-left text-sm underline underline-offset-2'
                  onClick={() => navigate({ to: '/settings' })}
                >
                  Please go to Settings to set your shipping address
                </button>
              ))} */}

            {mode === 'stock' && (
              <div className='flex items-center gap-2'>
                <span>Shipping Warehouse:</span>
                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                  disabled={isLoadingWarehouses}
                >
                  <SelectTrigger className='h-8 w-[200px] text-xs'>
                    <SelectValue placeholder={isLoadingWarehouses ? 'Loading...' : 'Please select warehouse'} />
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
                        {isLoadingWarehouses ? 'Loading...' : 'No warehouse available'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className='flex flex-wrap justify-end gap-2'>
            <Button
              size='sm'
              className='min-w-[120px] bg-orange-500 text-white hover:bg-orange-600'
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
