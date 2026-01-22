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
  
  // 用于跟踪已经处理过的变体 ID（防止重复调用 API）
  const processedVariantIdsRef = useRef<Set<string>>(new Set())

  // 规格选择状态：key 是规格ID，value 是选中的规格值ID
  const [selectedSpecs, setSelectedSpecs] = useState<
    Record<string, string>
  >(initialSelectedSpecs)

  // 已选变体列表：基于选中的规格组合生成
  const [selectedVariants, setSelectedVariants] = useState<
    Array<{
      id: string
      specValues: Record<string, string> // 规格ID -> 规格值ID
      quantity: number
      sku?: string // SKU 号
      price?: number // SKU 价格
      image?: string // SKU 图片
      loading?: boolean // 是否正在加载
    }>
  >([])

  // 辅助函数：从可能的多语言对象中提取名称
  const extractName = (name: unknown): string => {
    if (typeof name === 'string') {
      return name
    }
    if (name && typeof name === 'object') {
      // 如果是对象，尝试获取 zh_CN 或 GLang 或第一个字符串值
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

  console.log('apiProduct------------111:', apiProduct)
  // 使用 API 产品数据
  const displayProduct = apiProduct
    ? {
        id: apiProduct.id || productId,
        name: extractName(apiProduct.name) || 'Product',
        price: apiProduct.hzkj_pur_price || 0,
        image: apiProduct.hzkj_picurl_tag || '',
        sku: apiProduct.number || productId,
      }
    : {
        id: productId,
        name: 'Product',
        price: 0,
        image: '',
        sku: productId,
      }

  const totalPrice = (
    selectedVariants.reduce(
      (sum, v) => {
        const variantPrice = v.price ?? displayProduct.price
        return sum + v.quantity * (typeof variantPrice === 'number' ? variantPrice : 0)
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

  // 仓库选择（示例选项，可后续接 API）
  const [selectedWarehouse, setSelectedWarehouse] = useState<
    string | undefined
  >()
  const warehouseOptions = [
    { value: 'gz', label: 'Guangzhou Warehouse' },
    { value: 'us', label: 'USA Warehouse' },
    { value: 'eu', label: 'EU Warehouse' },
  ]

  // 是否已有收货地址（后续可从接口/状态中读取）
  const hasShippingAddress = false

  // 当弹框打开时，同步初始选择的规格值，并自动生成变体
  useEffect(() => {
    if (open) {
      // 如果有初始值，更新选择的规格
      if (Object.keys(initialSelectedSpecs).length > 0) {
        setSelectedSpecs(initialSelectedSpecs)

        // 检查是否所有规格都已选择
        const allSpecsSelected = skuSpecs.every(
          (s) =>
            s.hzkj_sku_spec_id &&
            initialSelectedSpecs[s.hzkj_sku_spec_id] !== undefined &&
            initialSelectedSpecs[s.hzkj_sku_spec_id] !== ''
        )

        if (allSpecsSelected && skuSpecs.length > 0) {
          // 生成变体ID（使用所有规格值的ID组合）
          const variantId = Object.values(initialSelectedSpecs).join('-')
          // 检查是否已存在该变体，如果不存在则添加
          setSelectedVariants((prev) => {
            const existingVariant = prev.find(
              (v) =>
                JSON.stringify(v.specValues) ===
                JSON.stringify(initialSelectedSpecs)
            )
            if (!existingVariant) {
              return [
                {
                  id: variantId,
                  specValues: initialSelectedSpecs,
                  quantity: 1,
                },
              ]
            }
            return prev
          })
        } else {
          // 如果规格未全部选择，清空变体列表
          setSelectedVariants([])
        }
      } else {
        // 如果没有初始值，重置状态
        setSelectedSpecs({})
        setSelectedVariants([])
      }
    }
  }, [open, initialSelectedSpecs, skuSpecs])

  // 当弹框打开时，调用 API 获取每个变体的 SKU 数据
  useEffect(() => {
    // 弹框关闭时重置已处理的变体 ID 列表
    if (!open) {
      processedVariantIdsRef.current = new Set()
      return
    }

    // 弹框打开时，如果有变体，则调用 API
    const fetchSkuData = async () => {
      if (!productId || selectedVariants.length === 0) return

      // 筛选出需要获取数据的变体（还没有处理过且没有 SKU 数据的变体）
      const variantsToFetch = selectedVariants.filter(
        (variant) =>
          !processedVariantIdsRef.current.has(variant.id) &&
          !variant.sku &&
          !variant.loading
      )

      if (variantsToFetch.length === 0) return

      // 标记这些变体为已处理（在调用 API 之前就标记，防止重复调用）
      variantsToFetch.forEach((variant) => {
        processedVariantIdsRef.current.add(variant.id)
      })

      // 先标记所有需要获取数据的变体为加载中
      setSelectedVariants((prev) =>
        prev.map((v) =>
          variantsToFetch.some((vf) => vf.id === v.id)
            ? { ...v, loading: true }
            : v
        )
      )

      // 为每个变体获取 SKU 数据
      const promises = variantsToFetch.map(async (variant) => {
        // 提取规格值ID列表（specIds）
        const specIds = Object.values(variant.specValues).filter(
          (id) => id && id !== ''
        )

        if (specIds.length === 0) {
          return { ...variant, loading: false }
        }

        try {
          // 调用 API
          const response = await selectSpecGetSku({
            productId,
            specIds,
          })

          // 安全地提取 API 返回的数据
          const skuData = response.data
          const skuValue = typeof skuData?.sku === 'string' ? skuData.sku : variant.id
          const defaultPrice = typeof displayProduct.price === 'number' ? displayProduct.price : 0
          const priceValue = typeof skuData?.price === 'number' ? skuData.price : defaultPrice
          const defaultImage = typeof displayProduct.image === 'string' ? displayProduct.image : ''
          const imageValue = typeof skuData?.image === 'string' ? skuData.image : defaultImage

          // 返回更新后的变体数据
          return {
            ...variant,
            sku: skuValue,
            price: priceValue as number,
            image: imageValue as string,
            loading: false,
          }
        } catch (error) {
          console.error('Failed to fetch SKU data:', error)
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to load SKU data. Please try again.'
          )
          // 如果失败，从已处理列表中移除，允许重试
          processedVariantIdsRef.current.delete(variant.id)
          return {
            ...variant,
            loading: false,
          }
        }
      })

      const fetchedVariants = await Promise.all(promises)

      // 一次性更新所有变体数据（使用函数式更新，避免依赖 selectedVariants）
      setSelectedVariants((prev) => {
        const fetchedMap = new Map(
          fetchedVariants.map((v) => [v.id, v])
        )
        return prev.map((v) => fetchedMap.get(v.id) || v)
      })
    }

    // 使用 setTimeout 确保在状态更新完成后再调用
    const timer = setTimeout(() => {
      void fetchSkuData()
    }, 0)

    return () => clearTimeout(timer)
  }, [open, productId, selectedVariants.length]) // 只监听变体数量变化，而不是整个数组

  // Buy Now：根据模式处理确认订单；不再在此处跳转路由
  const handleBuyNow = () => {
    if (mode === 'stock') {
      if (!selectedWarehouse) {
        // 未选择仓库时不跳转，可根据需要改为 toast
        return
      }
    }

    // 构建确认订单数据
    const orderItems: ConfirmOrderItem[] = selectedVariants.map((variant) => {
      // 根据选中的规格值构建显示名称
      const specNames: string[] = []
      for (const spec of skuSpecs) {
        const selectedValueId = variant.specValues[spec.hzkj_sku_spec_id || '']
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
      // 使用 API 返回的 SKU，如果没有则使用默认格式
      const sku = variant.sku || `${displayProduct.sku}-${Object.values(variant.specValues).join('-')}`
      // 使用 API 返回的价格，如果没有则使用产品默认价格
      const itemPrice = variant.price ?? displayProduct.price
      const itemTotal = (typeof itemPrice === 'number' ? itemPrice : 0) * variant.quantity
      // 使用 API 返回的图片，如果没有则使用产品默认图片
      const defaultImage = typeof displayProduct.image === 'string' ? displayProduct.image : ''
      const variantImage = (typeof variant.image === 'string' ? variant.image : '') || defaultImage

      return {
        id: variant.id,
        image: variantImage as string,
        name: `${displayProduct.name} - ${displayName}`,
        sku: sku,
        price: typeof itemPrice === 'number' ? itemPrice : 0,
        discountedPrice: typeof itemPrice === 'number' ? itemPrice : 0,
        weight: 45,
        quantity: variant.quantity,
        fee: itemTotal,
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
                  {typeof displayProduct.image === 'string' && displayProduct.image ? (
                    <img
                      src={displayProduct.image}
                      alt={displayProduct.name}
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
                <h2 className='text-xl font-semibold'>{displayProduct.name}</h2>
                <div className='text-muted-foreground text-sm'>
                  Product Price:{' '}
                  <span className='text-primary text-2xl font-bold'>
                    ${typeof displayProduct.price === 'number' ? displayProduct.price.toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  SPU: <span className='font-medium'>{displayProduct.sku}</span>
                </div>
              </div>
            </div>

            {/* 下方：左侧选项，右侧变体列表（左右各自滚动，外层不滚动） */}
            <div className='mt-4 grid grid-cols-[240px_minmax(0,1fr)] gap-0 border-t pt-4'>
              {/* 左侧：产品选项（带右侧分割线，可滚动） */}
              <div className='max-h-[320px] overflow-y-auto border-r pr-4'>
                {/* 动态渲染所有规格选项 */}
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

                              // 根据选中的规格组合生成变体
                              // 检查是否所有规格都已选择
                              const allSpecsSelected = skuSpecs.every(
                                (s) =>
                                  newSelectedSpecs[s.hzkj_sku_spec_id || ''] !==
                                  undefined
                              )

                              if (allSpecsSelected) {
                                // 生成变体ID（使用所有规格值的ID组合）
                                const variantId = Object.values(
                                  newSelectedSpecs
                                ).join('-')
                                // 检查是否已存在该变体
                                const existingVariant = selectedVariants.find(
                                  (v) =>
                                    JSON.stringify(v.specValues) ===
                                    JSON.stringify(newSelectedSpecs)
                                )
                                if (!existingVariant) {
                                  setSelectedVariants((prev) => [
                                    ...prev,
                                    {
                                      id: variantId,
                                      specValues: newSelectedSpecs,
                                      quantity: 1,
                                    },
                                  ])
                                }
                              }
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
                    {selectedVariants.map((variant) => {
                      // 根据选中的规格值构建显示名称
                      const specNames: string[] = []
                      for (const spec of skuSpecs) {
                        const selectedValueId =
                          variant.specValues[spec.hzkj_sku_spec_id || '']
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
                      // 使用 API 返回的 SKU，如果没有则使用默认格式
                      const sku = (typeof variant.sku === 'string' ? variant.sku : '') || `${displayProduct.sku}-${Object.values(variant.specValues).join('-')}`
                      // 使用 API 返回的价格，如果没有则使用产品默认价格
                      const variantPrice = typeof variant.price === 'number' ? variant.price : (typeof displayProduct.price === 'number' ? displayProduct.price : 0)
                      // 使用 API 返回的图片，如果没有则使用产品默认图片
                      const variantImage = (typeof variant.image === 'string' ? variant.image : '') || (typeof displayProduct.image === 'string' ? displayProduct.image : '')

                      return (
                        <div
                          key={variant.id}
                          className='flex items-center gap-3 rounded-lg border p-3'
                        >
                          {variant.loading ? (
                            <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                              Loading...
                            </div>
                          ) : variantImage ? (
                            <img
                              src={variantImage}
                              alt={displayName}
                              className='h-12 w-12 rounded object-cover'
                            />
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-[10px] text-gray-400'>
                              No Img
                            </div>
                          )}
                          <div className='flex-1'>
                            <div className='mb-0.5 text-sm font-medium'>
                              {displayName}
                            </div>
                            <div className='text-muted-foreground mb-1 text-[11px]'>
                              SKU: {sku}
                            </div>
                            <div className='text-primary text-sm font-semibold'>
                              ${typeof variantPrice === 'number' ? variantPrice.toFixed(2) : '0.00'}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setSelectedVariants((prev) =>
                                  prev.map((v) =>
                                    v.id === variant.id
                                      ? {
                                          ...v,
                                          quantity: Math.max(0, v.quantity - 1),
                                        }
                                      : v
                                  )
                                )
                              }}
                              disabled={variant.quantity <= 0}
                            >
                              <Minus className='h-4 w-4' />
                            </Button>
                            <Input
                              type='number'
                              value={variant.quantity}
                              onChange={(e) => {
                                const newQuantity = Math.max(
                                  0,
                                  parseInt(e.target.value) || 0
                                )
                                setSelectedVariants((prev) =>
                                  prev.map((v) =>
                                    v.id === variant.id
                                      ? { ...v, quantity: newQuantity }
                                      : v
                                  )
                                )
                              }}
                              className='h-7 w-14 text-center text-xs'
                              min={0}
                            />
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setSelectedVariants((prev) =>
                                  prev.map((v) =>
                                    v.id === variant.id
                                      ? { ...v, quantity: v.quantity + 1 }
                                      : v
                                  )
                                )
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
                >
                  <SelectTrigger className='h-8 w-[200px] text-xs'>
                    <SelectValue placeholder='Please select warehouse' />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.map((wh) => (
                      <SelectItem key={wh.value} value={wh.value}>
                        {wh.label}
                      </SelectItem>
                    ))}
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
