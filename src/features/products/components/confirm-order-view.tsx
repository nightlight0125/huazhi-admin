import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { calcuFreight } from '@/lib/api/logistics'
import { buyProduct } from '@/lib/api/products'
import { getAddress, type AddressItem } from '@/lib/api/users'
import { useLogisticsChannels } from '@/hooks/use-logistics-channels'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface ConfirmOrderItem {
  id: string
  image: string
  name: string
  sku: string
  price: number
  discountedPrice: number
  weight: number
  quantity: number
  fee: number
}

export interface ConfirmOrderPayload {
  productId: string
  items: ConfirmOrderItem[]
  mode: 'sample' | 'stock'
  totalPrice: number
  discountedTotalPrice?: number
  selectedWarehouse?: string
  hasShippingAddress: boolean
  shippingCost?: number
}

interface ConfirmOrderViewProps {
  orderData: ConfirmOrderPayload
  onBack: () => void
}

export function ConfirmOrderView({ orderData, onBack }: ConfirmOrderViewProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    string | undefined
  >()
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<AddressItem | null>(
    null
  )
  const [shippingCostFromApi, setShippingCostFromApi] = useState<number | null>(
    null
  )
  const [isLoadingFreight, setIsLoadingFreight] = useState(false)

  // 使用 hook 获取物流渠道数据
  const { channels: shippingMethodOptions, isLoading: isLoadingChannels } =
    useLogisticsChannels()

  const handleAddAddress = () => {
    // 保存确认订单数据，返回后可恢复视图
    sessionStorage.setItem(
      'confirm-order-return',
      JSON.stringify({ payload: orderData })
    )
    const returnTo = `/products/${orderData.productId}`
    navigate({
      to: '/settings',
      search: { tab: 'address', returnTo },
    })
  }

  const handlePay = async () => {
    const customerId = auth.user?.customerId

    if (!customerId) {
      toast.error('Customer ID not found. Please login again.')
      return
    }

    if (!shippingAddress) {
      toast.error('Please add a shipping address before paying')
      return
    }

    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method')
      return
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const returnUrl = origin
        ? `${origin}/order/payment-callback?session_id={CHECKOUT_SESSION_ID}`
        : undefined
      const returnFailUrl = origin ? `${origin}/order/payment-fail` : undefined

      const response = await buyProduct({
        customerId: String(customerId),
        customChannelId: selectedShippingMethod,
        // 支付完成后回调地址（带 session_id 占位符，支付平台会替换为真实 ID）
        ...(returnUrl ? { returnUrl } : {}),
        ...(returnFailUrl ? { returnFailUrl } : {}),
        // 地址信息映射
        firstName: shippingAddress.hzkj_customer_first_name ?? '',
        lastName: shippingAddress.hzkj_customer_last_name ?? '',
        phone: shippingAddress.hzkj_phone ?? '',
        countryId: String(shippingAddress.hzkj_country_id ?? ''),
        admindivisionId: String(shippingAddress.hzkj_admindivision2_id ?? ''),
        city: shippingAddress.hzkj_city ?? '',
        address1: shippingAddress.hzkj_textfield ?? '',
        address2: shippingAddress.hzkj_address2 ?? '',
        postCode: shippingAddress.hzkj_textfield1 ?? '',
        taxId: shippingAddress.hzkj_tax_id1 ?? '',
        note: shippingAddress.hzkj_textfield3 ?? '',
        detail: orderData.items.map((item) => ({
          skuId: item.id,
          quantity: item.quantity,
          flag: 0,
        })),
      })

      const paymentUrl =
        typeof response.data === 'string'
          ? response.data
          : response.data && typeof (response.data as any).url === 'string'
            ? ((response.data as any).url as string)
            : ''

      if (paymentUrl) {
        toast.success('Redirecting to payment page...')
        // 在当前窗口中跳转到支付页面
        window.location.href = paymentUrl
      } else if (response.message) {
        toast.error(response.message)
      } else {
        toast.error('Failed to create payment session. Please try again.')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to place order. Please try again.'
      )
    }
  }

  // 获取地址信息 - 组件加载时调用
  useEffect(() => {
    const fetchAddress = async () => {
      const userId = auth.user?.id
      try {
        const address = await getAddress(String(userId))
        setShippingAddress(address)
      } catch (error) {
        console.error('Failed to load address:', error)
      }
    }

    void fetchAddress()
  }, [])

  // 选中物流方式后调用 calcuFreight 获取运费，更新 Total
  useEffect(() => {
    if (!selectedShippingMethod || !shippingAddress || !orderData.productId) {
      setShippingCostFromApi(null)
      return
    }
    const destinationId = 
      String(shippingAddress.hzkj_country2_id ?? '').trim()
    if (!destinationId) {
      setShippingCostFromApi(null)
      return
    }
    const fetchFreight = async () => {
      setIsLoadingFreight(true)
      setShippingCostFromApi(null)
      try {
        const options = await calcuFreight({
          spuId: orderData.productId,
          destinationId,
        })
        const matched = options.find(
          (opt) => opt.logsId === selectedShippingMethod
        )
        if (matched != null && typeof matched.freight === 'number') {
          setShippingCostFromApi(matched.freight)
        } else {
          setShippingCostFromApi(0)
        }
      } catch (error) {
        console.error('Failed to calculate freight:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to calculate freight.'
        )
        setShippingCostFromApi(null)
      } finally {
        setIsLoadingFreight(false)
      }
    }
    void fetchFreight()
  }, [selectedShippingMethod, shippingAddress, orderData.productId])

  const productTotal = orderData.items.reduce((sum, item) => sum + item.fee, 0)
  const shippingCost = shippingCostFromApi ?? orderData.shippingCost ?? 0
  const finalTotal = productTotal + shippingCost
  const totalAmount = finalTotal

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* 返回按钮和标题 */}
      <div className='mb-6 flex items-center gap-4'>
        <Button
          variant='ghost'
          onClick={onBack}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          <span>
            Confirm Order{' '}
            <span className='text-muted-foreground text-xs'>
              Please confirm the content of each of your order information.
            </span>
          </span>
        </Button>
      </div>

      <div className='text-muted-foreground mb-4 text-sm'></div>
      <div className='space-y-6'>
        <div className='rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Delivery information</h3>
          {!shippingAddress?.hzkj_address2 ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <p className='text-muted-foreground mb-4 text-sm'>No address</p>
              <Button
                onClick={handleAddAddress}
                className='bg-orange-600 text-white hover:bg-orange-700'
              >
                Add address
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='text-sm'>
                <span className='font-medium'>Shipping Address:</span>{' '}
                <span className='text-muted-foreground'>
                  {shippingAddress?.hzkj_address2 || 'No address available'}
                </span>
              </div>
            </div>
          )}

          {/* Shipping Method */}
          <div className='mt-4 flex items-center gap-4'>
            <label className='text-sm font-medium'>Shipping Method:</label>
            <Select
              value={selectedShippingMethod}
              onValueChange={setSelectedShippingMethod}
            >
              <SelectTrigger className='h-9 w-[250px]'>
                <SelectValue placeholder='Please select' />
              </SelectTrigger>
              <SelectContent>
                {isLoadingChannels ? (
                  <SelectItem value='loading' disabled>
                    Loading...
                  </SelectItem>
                ) : shippingMethodOptions.length > 0 ? (
                  shippingMethodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value='no-options' disabled>
                    No shipping methods available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product 区域 */}
        <div className='rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Product</h3>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price($)</TableHead>
                  <TableHead>Discounted Price($)</TableHead>
                  <TableHead>Weight(g)</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Fee($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderData.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <img
                          src={item.image}
                          alt={item.name}
                          className='h-16 w-16 rounded object-cover'
                        />
                        <div>
                          <div className='text-sm font-medium'>
                            {(() => {
                              const raw = (
                                item as unknown as Record<string, unknown>
                              ).hzkj_enname
                              let text = item.name
                              if (raw != null) {
                                if (typeof raw === 'string') text = raw
                                else if (typeof raw === 'object') {
                                  const obj = raw as Record<string, unknown>
                                  text =
                                    (obj.GLang as string) ||
                                    (obj.zh_CN as string) ||
                                    item.name
                                }
                              }
                              const displayText =
                                text.length > 60
                                  ? `${text.substring(0, 60)}...`
                                  : text
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='cursor-default'>
                                      {displayText}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side='top'
                                    className='max-w-sm break-words'
                                  >
                                    {text}
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })()}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {item.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${item.discountedPrice.toFixed(2)}</TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell
                      className='cursor-pointer font-medium hover:underline'
                      onClick={() => setIsDetailDialogOpen(true)}
                    >
                      Total: $
                      {isLoadingFreight
                        ? '...'
                        : (
                            item.fee +
                            (orderData.items.length > 0
                              ? shippingCost / orderData.items.length
                              : 0)
                          ).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className='flex flex-col gap-4 rounded-lg px-6 py-4 md:flex-row md:items-center md:justify-end'>
          {/* 右侧 Total + Pay */}
          <div className='flex items-center justify-end gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold'>Total Amounts:</span>
              <span className='text-lg font-bold text-orange-600'>
                ${isLoadingFreight ? '...' : totalAmount.toFixed(2)}
              </span>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 px-2 text-xs text-orange-600 hover:text-orange-700'
                onClick={() => setIsDetailDialogOpen(true)}
              >
                Detail <ChevronDown className='ml-1 h-3 w-3' />
              </Button>
            </div>
            <Button
              onClick={handlePay}
              className='bg-orange-600 px-8 text-white hover:bg-orange-700'
              size='lg'
              disabled={isLoadingFreight}
            >
              Pay
            </Button>
          </div>
        </div>
      </div>

      {/* 详情弹框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Product Price:</span>
              <span className='font-medium'>${productTotal.toFixed(2)}</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Shipping Cost:</span>
              <span className='font-medium'>
                ${isLoadingFreight ? '...' : shippingCost.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className='flex items-center justify-between text-base font-semibold'>
              <span>Total:</span>
              <span className='text-orange-600'>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
