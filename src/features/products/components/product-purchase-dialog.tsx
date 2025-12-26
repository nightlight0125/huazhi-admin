import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Minus, Plus } from 'lucide-react'
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
import { products } from '../data/data'
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
}

export function ProductPurchaseDialog({
  open,
  onOpenChange,
  productId,
  mode,
  onConfirmOrder,
}: ProductPurchaseDialogProps) {
  const navigate = useNavigate()

  // 产品变体选择状态
  const [selectedLightSource, setSelectedLightSource] = useState('christmas')
  const [selectedLightColor, setSelectedLightColor] = useState('white')
  const [selectedVariants, setSelectedVariants] = useState<
    Array<{
      id: string
      lightSource: string
      lightColor: string
      quantity: number
    }>
  >([
    { id: '1', lightSource: 'christmas', lightColor: 'white', quantity: 1 },
    { id: '2', lightSource: 'christmas', lightColor: 'black', quantity: 1 },
    { id: '3', lightSource: 'halloween', lightColor: 'white', quantity: 1 },
    { id: '4', lightSource: 'halloween', lightColor: 'black', quantity: 1 },
  ])

  // 查找产品数据
  const product = products.find((p) => p.id === productId)

  if (!product) {
    return null
  }

  const totalPrice = (
    selectedVariants.reduce((sum, v) => sum + v.quantity * product.price, 0) ||
    0
  ).toFixed(2)

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
      const displayName = `${variant.lightSource
        .charAt(0)
        .toUpperCase()}${variant.lightSource.slice(1)} pattern ${
        variant.lightSource === 'christmas' ? 'lights' : 'light'
      }-${variant.lightColor.charAt(0).toUpperCase()}${variant.lightColor.slice(
        1
      )} shell`
      const sku = `${product.sku}-${displayName}`
      const itemPrice = product.price
      const itemTotal = itemPrice * variant.quantity

      return {
        id: variant.id,
        image: product.image,
        name: `${product.name} - ${displayName}`,
        sku: sku,
        price: itemPrice,
        discountedPrice: itemPrice, // 可以根据需要添加折扣逻辑
        weight: 45, // 示例重量，后续可以从产品数据中获取
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
                  <img
                    src={product.image}
                    alt={product.name}
                    className='h-full w-full object-cover'
                  />
                </div>
              </div>

              {/* 右侧：产品标题、价格、SPU */}
              <div className='flex flex-col justify-center space-y-2 md:col-span-9'>
                <h2 className='text-xl font-semibold'>{product.name}</h2>
                <div className='text-muted-foreground text-sm'>
                  Product Price:{' '}
                  <span className='text-primary text-2xl font-bold'>
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className='text-muted-foreground text-sm'>
                  SPU: <span className='font-medium'>{product.sku}</span>
                </div>
              </div>
            </div>

            {/* 下方：左侧选项，右侧变体列表（左右各自滚动，外层不滚动） */}
            <div className='mt-4 grid grid-cols-[240px_minmax(0,1fr)] gap-0 border-t pt-4'>
              {/* 左侧：产品选项（带右侧分割线，可滚动） */}
              <div className='max-h-[320px] overflow-y-auto border-r pr-4'>
                {/* Color 列表 */}
                <div className='mb-6'>
                  <h3 className='mb-2 text-xs font-semibold'>Color</h3>
                  <div className='space-y-2'>
                    {[
                      { id: 'christmas', label: 'Three-dimensional old man' },
                      { id: 'snow', label: '3d snowman' },
                      { id: 'bear', label: '3d bear' },
                      { id: 'faceless', label: 'Faceless old man' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedLightSource(option.id)}
                        className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                          selectedLightSource === option.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background hover:bg-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specification 列表 */}
                <div>
                  <h3 className='mb-2 text-xs font-semibold'>Specification</h3>
                  <div className='space-y-2'>
                    {[
                      { id: 'single', label: 'Single carton' },
                      { id: 'double', label: 'Double carton' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedLightColor(option.id)}
                        className={`flex w-full items-center rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                          selectedLightColor === option.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-background hover:bg-accent'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧：已选变体列表（可滚动） + 列表内部总价 */}
              <div className='flex max-h-[320px] flex-col overflow-y-auto pl-4'>
                <div className='space-y-2 pr-1'>
                  <h3 className='text-xs font-semibold'>Selected Variants</h3>
                  <div className='space-y-2'>
                    {selectedVariants.map((variant) => {
                      const displayName = `${variant.lightSource
                        .charAt(0)
                        .toUpperCase()}${variant.lightSource.slice(
                        1
                      )} pattern ${
                        variant.lightSource === 'christmas' ? 'lights' : 'light'
                      }-${variant.lightColor
                        .charAt(0)
                        .toUpperCase()}${variant.lightColor.slice(1)} shell`
                      const sku = `${product.sku}-${displayName}`

                      return (
                        <div
                          key={variant.id}
                          className='flex items-center gap-3 rounded-lg border p-3'
                        >
                          <img
                            src={product.image}
                            alt={displayName}
                            className='h-12 w-12 rounded object-cover'
                          />
                          <div className='flex-1'>
                            <div className='mb-0.5 text-sm font-medium'>
                              {displayName}
                            </div>
                            <div className='text-muted-foreground mb-1 text-[11px]'>
                              SKU: {sku}
                            </div>
                            <div className='text-primary text-sm font-semibold'>
                              ${product.price.toFixed(2)}
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
