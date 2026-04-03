import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getSkuByNumber,
  querySkuByCustomer,
  type SkuRecordItem,
} from '@/lib/api/products'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type OrderProduct } from '../data/schema'

interface OrdersAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Second argument is the raw `getSkuByNumber` payload when the request succeeds. */
  onConfirm: (product: OrderProduct, rawSku?: Record<string, unknown>) => void
  orderId?: string
  order?: any // 订单对象（保留以保持接口兼容）
  onSuccess?: () => void // 成功回调（保留以保持接口兼容）
}

export function OrdersAddProductDialog({
  open,
  onOpenChange,
  onConfirm,
  orderId: _orderId,
  order: _order,
  onSuccess: _onSuccess,
}: OrdersAddProductDialogProps) {
  const { auth } = useAuthStore()
  const [sku, setSku] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [skuOptions, setSkuOptions] = useState<SkuRecordItem[]>([])
  const [isLoadingSku, setIsLoadingSku] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // 获取 SKU 列表
  useEffect(() => {
    const fetchSkuList = async () => {
      const customerId = auth.user?.customerId
      if (!customerId) {
        setSkuOptions([])
        return
      }

      setIsLoadingSku(true)
      try {
        const records = await querySkuByCustomer(
          undefined,
          customerId,
          '1',
          1,
          100
        )
        // 处理返回类型：可能是数组或对象
        const skuRecords = Array.isArray(records) ? records : records.rows
        setSkuOptions(skuRecords)
      } catch (error) {
        console.error('Failed to fetch SKU records:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load SKU records. Please try again.'
        )
        setSkuOptions([])
      } finally {
        setIsLoadingSku(false)
      }
    }

    if (open) {
      void fetchSkuList()
    }
  }, [open, auth.user?.customerId])

  const handleConfirm = async () => {
    if (!sku.trim()) return

    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Customer information is missing')
      return
    }

    setIsConfirming(true)
    try {
      const res = await getSkuByNumber({
        number: sku.trim(),
        cusId: String(customerId),
      })

      if (res.status !== true) {
        if (res.errorCode === '1001') {
          toast.error('Please enter a valid SKU')
        } else {
          toast.error(
            res.message ||
              'Failed to add product. Please check the SKU and try again.'
          )
        }
        return
      }

      const selectedSkuItem = skuOptions.find(
        (item) => ((item as any).number || item.hzkj_sku_number) === sku.trim()
      )

      const newProduct: OrderProduct = {
        id: sku.trim(),
        productName: (selectedSkuItem as any)?.hzkj_name || '',
        productVariant: [],
        quantity,
        productImageUrl: '',
        productLink: '',
        price: 0,
        totalPrice: 0,
        hzkj_local_sku_id: selectedSkuItem?.id
          ? String(selectedSkuItem.id)
          : undefined,
        hzkj_shop_sku: sku.trim(),
        hzkj_local_sku:
          (selectedSkuItem as any)?.number ??
          (selectedSkuItem as any)?.hzkj_sku_number ??
          sku.trim(),
        hzkj_qty: String(quantity),
        hzkj_src_qty: String(quantity),
      }

      const d = res.data as Record<string, unknown> | null | undefined
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        if (d.id != null) {
          newProduct.hzkj_local_sku_id = String(d.id)
        }
        if (typeof d.number === 'string') {
          newProduct.hzkj_local_sku = d.number
        }
        const name =
          (d as { enname?: string }).enname ||
          (d as { hzkj_name?: string }).hzkj_name ||
          (d as { name?: string }).name
        if (typeof name === 'string' && name) {
          newProduct.productName = name
        }
        const pic =
          (d as { pic?: string }).pic ||
          (d as { picture?: string }).picture ||
          (d as { hzkj_picture?: string }).hzkj_picture
        if (typeof pic === 'string' && pic) {
          newProduct.productImageUrl = pic
          ;(newProduct as any).hzkj_picture = pic
        }
        const priceVal =
          (d as { price?: number }).price ??
          (d as { hzkj_shop_price?: number | string }).hzkj_shop_price
        if (priceVal != null && priceVal !== '') {
          const n = Number(priceVal)
          if (!Number.isNaN(n)) {
            newProduct.price = n
            newProduct.totalPrice = n * quantity
            newProduct.hzkj_shop_price = String(n)
            newProduct.hzkj_amount = String(n * quantity)
          }
        }
      }

      onConfirm(
        newProduct,
        d && typeof d === 'object' && !Array.isArray(d)
          ? (d as Record<string, unknown>)
          : undefined
      )
      setSku('')
      setQuantity(1)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'SKU validation failed. Please try again later.'
      )
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    setSku('')
    setQuantity(1)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) {
      setSku('')
      setQuantity(1)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto py-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sku'>
                  SKU <span className='text-orange-500'>*</span>
                </Label>
                <Input
                  id='sku'
                  placeholder='Please enter SKU'
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled={isLoadingSku}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='quantity'>
                  Quantity <span className='text-orange-500'>*</span>
                </Label>
                <Input
                  id='quantity'
                  type='number'
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={() => void handleConfirm()}
            disabled={!sku.trim() || isConfirming || isLoadingSku}
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            {isConfirming ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Checking...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
