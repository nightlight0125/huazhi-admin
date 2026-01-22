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
import { getAddress, type AddressItem } from '@/lib/api/users'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  const [selectedCoupon, setSelectedCoupon] = useState<string | undefined>()
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [shippingAddress, setShippingAddress] = useState<AddressItem | null>(null)

  const shippingMethodOptions = [
    { value: 'tdpacket-sensitive', label: 'TDPacket Sensitive' },
    { value: 'tdpacket-electro', label: 'TDPacket Electro' },
    { value: 'yun-electro-econo', label: 'YUN-Electro-Econo' },
    { value: 'tdpacket-pure-battery', label: 'TDPacket Pure battery' },
    { value: 'yun-fast-electro', label: 'YUN-Fast-Electro' },
  ]

  const couponOptions = [
    { value: 'none', label: 'No coupon' },
    { value: 'coupon1', label: 'Coupon 1' },
    { value: 'coupon2', label: 'Coupon 2' },
  ]

  const handleAddAddress = () => {
    navigate({ to: '/settings' })
  }

  const handlePay = () => {
    // TODO: 实现支付逻辑
    console.log('Pay clicked', orderData)
    // 支付成功后可以关闭确认订单视图或跳转到订单列表
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

  const totalAmount = orderData.discountedTotalPrice || orderData.totalPrice
  // 计算产品总价（所有商品费用之和）
  const productTotal = orderData.items.reduce((sum, item) => sum + item.fee, 0)
  // 运费（可以根据选择的配送方式计算，这里先设为0）
  const shippingCost = 0
  // 最终总价
  const finalTotal = productTotal + shippingCost

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
          {!shippingAddress?.hzkj_textfield ? (
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
                  {shippingAddress?.hzkj_textfield || 'No address available'}
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
                {shippingMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedShippingMethod && (
              <span className='text-sm text-red-600'>
                Estimated Delivery Time: - Day(s)
              </span>
            )}
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
                            {item.name.length > 40
                              ? `${item.name.substring(0, 40)}...`
                              : item.name}
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
                    <TableCell className='font-medium'>
                      Total: ${item.fee.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className='flex flex-col gap-4 rounded-lg px-6 py-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium'>Coupon</span>
            <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
              <SelectTrigger className='h-9 w-[260px]'>
                <SelectValue placeholder='Please select' />
              </SelectTrigger>
              <SelectContent>
                {couponOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 右侧 Total + Pay */}
          <div className='flex items-center justify-end gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold'>Total Amounts:</span>
              <span className='text-lg font-bold text-orange-600'>
                ${totalAmount.toFixed(2)}
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
              <span className='font-medium'>${shippingCost.toFixed(2)}</span>
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
