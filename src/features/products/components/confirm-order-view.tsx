import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronDown,
  Coins,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { calcuNewOrderFreight, type FreightOption } from '@/lib/api/logistics'
import { getCustomerBalance } from '@/lib/api/orders'
import { buyProduct, buyProductByWall } from '@/lib/api/products'
import { getAddress, type AddressItem } from '@/lib/api/users'
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
import { IconPaypal, IconStripe } from '@/assets/brand-icons'
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
  /** 详情页 calcuFreight 返回的选项，与 calcuNewOrderFreight 结果合并去重 */
  carriedFreightOptions?: FreightOption[]
  /** 详情页用户选中的物流 logsId，合并后若在列表中则默认选中 */
  preferredShippingMethodId?: string
}

/** 以接口列表为准追加携带项：同 logsId 或同 logsNumber（去空白）视为重复 */
export function mergeCarriedAndApiFreightOptions(
  apiList: FreightOption[],
  carried?: FreightOption[]
): FreightOption[] {
  const normalize = (o: FreightOption): FreightOption => ({
    ...o,
    logsId: String(o.logsId ?? ''),
    logsNumber: String(o.logsNumber ?? ''),
    freight: typeof o.freight === 'number' ? o.freight : Number(o.freight) || 0,
    time: typeof o.time === 'string' ? o.time : String(o.time ?? ''),
  })

  const apiNorm: FreightOption[] = []
  const apiSeenIds = new Set<string>()
  for (const o of apiList.map(normalize)) {
    if (!o.logsId || apiSeenIds.has(o.logsId)) continue
    apiSeenIds.add(o.logsId)
    apiNorm.push(o)
  }
  const result: FreightOption[] = [...apiNorm]
  const seenIds = new Set(apiNorm.map((o) => o.logsId))
  const seenNumbers = new Set(
    apiNorm.map((o) => o.logsNumber.trim()).filter(Boolean)
  )

  for (const raw of carried ?? []) {
    const c = normalize(raw)
    const id = c.logsId
    const num = c.logsNumber.trim()
    if (id && seenIds.has(id)) continue
    if (num && seenNumbers.has(num)) continue
    if (!id && !num) continue
    result.push(c)
    if (id) seenIds.add(id)
    if (num) seenNumbers.add(num)
  }
  return result
}

interface ConfirmOrderViewProps {
  orderData: ConfirmOrderPayload
  onBack: () => void
}

type PaymentMethod = 'balance' | 'credit_card' | 'airwallex'

export function ConfirmOrderView({ orderData, onBack }: ConfirmOrderViewProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<
    string | undefined
  >()
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('credit_card')
  const [shippingAddress, setShippingAddress] = useState<AddressItem | null>(
    null
  )
  const [shippingCostFromApi, setShippingCostFromApi] = useState<number | null>(
    null
  )
  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([])
  const [isLoadingFreight, setIsLoadingFreight] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

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

  const handlePay = async (
    paymentMethod: PaymentMethod = selectedPaymentMethod
  ) => {
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

    if (
      paymentMethod === 'balance' &&
      !isLoadingBalance &&
      availableBalance < totalAmount
    ) {
      toast.error('Insufficient balance. Please recharge and try again.')
      return
    }

    try {
      setIsPaying(true)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const payTypeThirdParty =
        paymentMethod === 'credit_card' ? 0 : paymentMethod === 'airwallex' ? 1 : undefined
      const returnUrl = origin
        ? paymentMethod === 'airwallex'
          ? `${origin}/order/payment-callback?payType=1`
          : `${origin}/order/payment-callback?session_id={CHECKOUT_SESSION_ID}`
        : undefined
      const returnFailUrl = origin ? `${origin}/order/payment-fail` : undefined

      const useWallet = paymentMethod === 'balance'

      /** 弹窗内选 Balance：走 buyProductByWall；选 Credit card：走 buyProduct（第三方支付） */
      const addressPayload = {
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
          skuId: String(item.id),
          quantity: item.quantity,
          flag: 0,
        })),
      }

      if (useWallet) {
        await buyProductByWall({
          customerId: String(customerId),
          customChannelId: selectedShippingMethod,
          firstName: addressPayload.firstName,
          lastName: addressPayload.lastName,
          phone: addressPayload.phone,
          countryId: addressPayload.countryId,
          adminDivisionId: addressPayload.admindivisionId,
          city: addressPayload.city,
          address1: addressPayload.address1,
          address2: addressPayload.address2,
          postCode: addressPayload.postCode,
          taxId: addressPayload.taxId,
          note: addressPayload.note,
          detail: addressPayload.detail,
        })
        toast.success('Wallet payment completed successfully')
        setIsPayDialogOpen(false)
        return
      }

      const response = await buyProduct({
        customerId: String(customerId),
        customChannelId: selectedShippingMethod,
        ...(payTypeThirdParty !== undefined ? { payType: payTypeThirdParty } : {}),
        ...(returnUrl ? { returnUrl } : {}),
        ...(returnFailUrl ? { returnFailUrl } : {}),
        ...addressPayload,
      })

      const paymentUrl =
        typeof response.data === 'string'
          ? response.data
          : response.data && typeof (response.data as any).url === 'string'
            ? ((response.data as any).url as string)
            : ''

      if (paymentUrl) {
        toast.success('Redirecting to payment page...')
        setIsPayDialogOpen(false)
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
    } finally {
      setIsPaying(false)
    }
  }

  // 获取地址信息 - 组件加载时调用
  useEffect(() => {
    const fetchAddress = async () => {
      const userId = auth.user?.customerId
      try {
        const address = await getAddress(String(userId))
        setShippingAddress(address)
      } catch (error) {
        console.error('Failed to load address:', error)
      }
    }

    void fetchAddress()
  }, [])

  useEffect(() => {
    const customerId = auth.user?.customerId
    if (!customerId || !shippingAddress || orderData.items.length === 0) {
      setFreightOptions([])
      setSelectedShippingMethod(undefined)
      setShippingCostFromApi(null)
      return
    }
    const countryId = String(
      shippingAddress.hzkj_country_id ?? shippingAddress.hzkj_country2_id ?? ''
    ).trim()
    if (!countryId) {
      setFreightOptions([])
      setSelectedShippingMethod(undefined)
      setShippingCostFromApi(null)
      return
    }
    // 运费 API 使用 variant/SKU id (item.id) 作为 skuId
    const skuIdToQty: Record<string, string> = orderData.items.reduce(
      (acc, item) => {
        const id = item.id
        acc[id] = String(Number(acc[id] ?? 0) + item.quantity)
        return acc
      },
      {} as Record<string, string>
    )
    const fetchFreight = async () => {
      setIsLoadingFreight(true)
      setFreightOptions([])
      setSelectedShippingMethod(undefined)
      setShippingCostFromApi(null)
      try {
        const options = await calcuNewOrderFreight({
          skuIdToQty,
          countryId,
          customerId: String(customerId),
        })
        const merged = mergeCarriedAndApiFreightOptions(
          options,
          orderData.carriedFreightOptions
        )
        setFreightOptions(merged)

        const preferred = orderData.preferredShippingMethodId?.trim()
        if (preferred && merged.some((o) => String(o.logsId) === preferred)) {
          setSelectedShippingMethod(preferred)
        }
      } catch (error) {
        console.error('Failed to calculate freight:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to calculate freight.'
        )
        const fallback = mergeCarriedAndApiFreightOptions(
          [],
          orderData.carriedFreightOptions
        )
        setFreightOptions(fallback)
        const preferred = orderData.preferredShippingMethodId?.trim()
        if (preferred && fallback.some((o) => String(o.logsId) === preferred)) {
          setSelectedShippingMethod(preferred)
        }
      } finally {
        setIsLoadingFreight(false)
      }
    }
    void fetchFreight()
  }, [
    shippingAddress,
    orderData.items,
    orderData.carriedFreightOptions,
    orderData.preferredShippingMethodId,
    auth.user?.customerId,
    auth.user?.id,
  ])

  useEffect(() => {
    const customerId = auth.user?.customerId
    if (!isPayDialogOpen || !customerId) return
    let cancelled = false
    setIsLoadingBalance(true)
    getCustomerBalance({ customerId: String(customerId) })
      .then((res) => {
        if (cancelled) return
        const toNum = (v: unknown) => {
          const n = typeof v === 'number' ? v : Number(String(v ?? 0))
          return Number.isFinite(n) ? n : 0
        }
        setBalance(toNum(res.data?.balance))
        setAvailableBalance(toNum(res.data?.avaliableBalance))
      })
      .catch(() => {
        if (cancelled) return
        setBalance(0)
        setAvailableBalance(0)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBalance(false)
      })

    return () => {
      cancelled = true
    }
  }, [isPayDialogOpen, auth.user?.customerId])

  // 选中物流方式后从 freightOptions 中取运费
  useEffect(() => {
    if (!selectedShippingMethod || freightOptions.length === 0) {
      setShippingCostFromApi(null)
      return
    }
    const matched = freightOptions.find(
      (opt) => opt.logsId === selectedShippingMethod
    )
    setShippingCostFromApi(
      matched != null && typeof matched.freight === 'number'
        ? matched.freight
        : 0
    )
  }, [selectedShippingMethod, freightOptions])

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
        <div className='border-border rounded-lg border p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Delivery information</h3>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() =>
                navigate({
                  to: '/settings',
                  search: {
                    tab: 'profile',
                    returnTo: `/products/${orderData.productId}`,
                  },
                })
              }
              className='gap-1.5'
            >
              <Pencil className='h-3.5 w-3.5' />
              Edit
            </Button>
          </div>
          {!shippingAddress ||
          (!shippingAddress.hzkj_address2 &&
            !shippingAddress.hzkj_textfield &&
            !shippingAddress.hzkj_city &&
            !shippingAddress.hzkj_customer_first_name &&
            !shippingAddress.hzkj_customer_last_name) ? (
            <div className='flex flex-col items-center justify-center py-8'>
              <p className='text-muted-foreground mb-4 text-sm'>No address</p>
              <Button
                onClick={handleAddAddress}
                className='bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500'
              >
                Add address
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='border-border bg-muted/30 dark:bg-muted/20 rounded-lg border p-4'>
                <div className='mb-3 flex items-center gap-2 text-sm font-medium'>
                  <MapPin className='h-4 w-4 text-orange-500 dark:text-orange-400' />
                  Shipping Address
                </div>
                <div className='space-y-4'>
                  {/* Contact info */}
                  <div className='flex flex-wrap gap-x-8 gap-y-3'>
                    {(shippingAddress?.hzkj_customer_first_name ||
                      shippingAddress?.hzkj_customer_last_name) && (
                      <div className='flex items-center gap-2'>
                        <User className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                        <span className='text-muted-foreground text-xs'>
                          Recipient
                        </span>
                        <span className='font-medium'>
                          {[
                            shippingAddress.hzkj_customer_first_name,
                            shippingAddress.hzkj_customer_last_name,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        </span>
                      </div>
                    )}
                    {shippingAddress?.hzkj_phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                        <span className='text-muted-foreground text-xs'>
                          Phone
                        </span>
                        <span className='font-medium'>
                          {shippingAddress.hzkj_phone}
                        </span>
                      </div>
                    )}
                    {shippingAddress?.hzkj_adress_emailfield && (
                      <div className='flex items-center gap-2'>
                        <Mail className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                        <span className='text-muted-foreground text-xs'>
                          Email
                        </span>
                        <span className='font-medium'>
                          {shippingAddress.hzkj_adress_emailfield}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Address lines */}
                  <div className='border-border space-y-1.5 border-t pt-3'>
                    {[
                      (shippingAddress as Record<string, unknown>)
                        ?.hzkj_country_name != null && {
                        label: 'Country',
                        value: String(
                          (shippingAddress as Record<string, unknown>)
                            .hzkj_country_name
                        ),
                      },
                      shippingAddress?.hzkj_admindivision_number && {
                        label: 'Region',
                        value: shippingAddress.hzkj_admindivision_number,
                      },
                      shippingAddress?.hzkj_city && {
                        label: 'City',
                        value: shippingAddress.hzkj_city,
                      },
                      shippingAddress?.hzkj_textfield && {
                        label: 'Address1',
                        value: shippingAddress.hzkj_textfield,
                      },
                      shippingAddress?.hzkj_address2 && {
                        label: 'Address2',
                        value: shippingAddress.hzkj_address2,
                      },
                      shippingAddress?.hzkj_textfield1 && {
                        label: 'Postcode',
                        value: shippingAddress.hzkj_textfield1,
                      },
                    ]
                      .filter(Boolean)
                      .map((item, i) => (
                        <div
                          key={i}
                          className='flex items-baseline gap-2 text-sm'
                        >
                          <span className='text-muted-foreground w-20 shrink-0 text-xs'>
                            {(item as { label: string }).label}:
                          </span>
                          <span className='font-medium'>
                            {(item as { value: string }).value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
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
                {isLoadingFreight ? (
                  <SelectItem value='loading' disabled>
                    Loading...
                  </SelectItem>
                ) : freightOptions.length > 0 ? (
                  freightOptions.map((opt) => (
                    <SelectItem key={opt.logsId} value={opt.logsId}>
                      {opt.logsNumber || opt.logsId} - $
                      {typeof opt.freight === 'number'
                        ? opt.freight.toFixed(2)
                        : '0.00'}
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
        <div className='border-border rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Product</h3>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price($)</TableHead>
                  <TableHead>Discounted Price($)</TableHead>
                  <TableHead>Weight(kg)</TableHead>
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
              <span className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                ${isLoadingFreight ? '...' : totalAmount.toFixed(2)}
              </span>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 px-2 text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
                onClick={() => setIsDetailDialogOpen(true)}
              >
                Detail <ChevronDown className='ml-1 h-3 w-3' />
              </Button>
            </div>
            <Button
              onClick={() => setIsPayDialogOpen(true)}
              className='bg-orange-600 px-8 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500'
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
              <span className='text-orange-600 dark:text-orange-400'>
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              Pay for Order
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-6 py-4'>
            <div className='space-y-3'>
              <div className='text-sm font-medium'>Payment Methods:</div>
              <div className='grid grid-cols-3 gap-3'>
                <button
                  type='button'
                  onClick={() => setSelectedPaymentMethod('balance')}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    selectedPaymentMethod === 'balance'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800'
                  }`}
                >
                  <div className='flex h-10 w-full flex-shrink-0 items-center justify-center'>
                    <Coins className='h-6 w-6' />
                  </div>
                  <span className='text-sm font-medium leading-none'>Balance</span>
                </button>

                <button
                  type='button'
                  onClick={() => setSelectedPaymentMethod('credit_card')}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    selectedPaymentMethod === 'credit_card'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800'
                  }`}
                >
                  <div className='flex h-10 w-full flex-shrink-0 items-center justify-center'>
                    <IconStripe
                      className='h-8 w-10 text-[#635BFF]'
                      aria-hidden
                    />
                  </div>
                  <span className='text-sm font-medium leading-none'>Stripe</span>
                </button>

                <button
                  type='button'
                  onClick={() => setSelectedPaymentMethod('airwallex')}
                  className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                    selectedPaymentMethod === 'airwallex'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:bg-gray-800'
                  }`}
                >
                  <div className='flex h-10 w-full flex-shrink-0 items-center justify-center'>
                    <IconPaypal
                      className='h-6 w-6 text-[#003087]'
                      aria-hidden
                    />
                  </div>
                  <span className='text-sm font-medium leading-none'>Paypal</span>
                </button>
              </div>
            </div>

            <div className='space-y-1 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'>
              <p className='text-sm font-medium text-orange-800 dark:text-orange-200'>
                Recomended! Get 1~2.5% bonus when recharging with XT and
                Payoneer.
              </p>
              <p className='text-xs text-orange-700 dark:text-orange-300'>
                Pay without limit on amount or number of orders.
              </p>
            </div>

            <div className='space-y-3 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Total Amount :</span>
                <span className='text-sm font-semibold text-orange-600'>
                  {isLoadingFreight ? '...' : `Pay $${totalAmount.toFixed(2)}`}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Balance:</span>
                <span className='text-sm font-semibold text-orange-600'>
                  {isLoadingBalance ? '...' : `$${balance.toFixed(2)}`}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Available:</span>
                <span className='text-sm font-semibold text-orange-600'>
                  {isLoadingBalance ? '...' : `$${availableBalance.toFixed(2)}`}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Bonus:</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Credits:</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>No. of Orders:</span>
                <span className='text-sm font-semibold'>1</span>
              </div>
            </div>

            <div className='flex justify-end gap-3 border-t pt-4'>
              <Button
                variant='outline'
                onClick={() => setIsPayDialogOpen(false)}
                disabled={isPaying}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handlePay(selectedPaymentMethod)}
                disabled={isPaying || isLoadingFreight}
                className='bg-blue-500 hover:bg-blue-600'
              >
                {isPaying ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
