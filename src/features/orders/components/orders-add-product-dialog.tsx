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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { querySkuByCustomer, type SkuRecordItem } from '@/lib/api/products'
import { useAuthStore } from '@/stores/auth-store'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { type OrderProduct } from '../data/schema'

interface OrdersAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (product: OrderProduct) => void
}

export function OrdersAddProductDialog({
  open,
  onOpenChange,
  onConfirm,
}: OrdersAddProductDialogProps) {
  const { auth } = useAuthStore()
  const [sku, setSku] = useState('')
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [skuOptions, setSkuOptions] = useState<SkuRecordItem[]>([])
  const [isLoadingSku, setIsLoadingSku] = useState(false)

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

  const handleConfirm = () => {
    if (!sku.trim() || !title.trim()) return

    const newProduct: OrderProduct = {
      id: sku.trim(),
      productName: title.trim(),
      productVariant: [],
      quantity,
      productImageUrl: imageUrl.trim(),
      productLink: '',
      price: 0,
      totalPrice: 0,
    }

    onConfirm(newProduct)
    setSku('')
    setTitle('')
    setImageUrl('')
    setQuantity(1)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSku('')
    setTitle('')
    setImageUrl('')
    setQuantity(1)
    onOpenChange(false)
  }

  // 当对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSku('')
      setTitle('')
      setImageUrl('')
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
                <Select
                  value={sku}
                  onValueChange={(value) => {
                    setSku(value)
                  }}
                  disabled={isLoadingSku}
                >
                  <SelectTrigger id='sku' className='w-full'>
                    <SelectValue
                      placeholder={
                        isLoadingSku
                          ? 'Loading SKUs...'
                          : skuOptions.length === 0
                            ? 'No SKUs available'
                            : 'Please select a SKU'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className='max-w-[var(--radix-select-trigger-width)]'>
                    {isLoadingSku ? (
                      <div className='flex items-center justify-center py-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    ) : skuOptions.length === 0 ? (
                      <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                        No SKUs available
                      </div>
                    ) : (
                      skuOptions
                        .filter(
                          (item) =>
                            (item as any).number || item.hzkj_sku_number
                        )
                        .map((item) => {
                          const number =
                            (item as any).number || item.hzkj_sku_number || ''
                          const name =
                            (item as any).name ||
                            item.hzkj_sku_name ||
                            'Unknown SKU'
                          return (
                            <SelectItem
                              key={item.id || number}
                              value={number}
                              className='max-w-full'
                            >
                              <span className='block truncate max-w-full'>
                                {String(name)}
                              </span>
                            </SelectItem>
                          )
                        })
                    )}
                  </SelectContent>
                </Select>
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

            <div className='space-y-2'>
              <Label htmlFor='title'>
                Title <span className='text-orange-500'>*</span>
              </Label>
              <Input
                id='title'
                placeholder='Please enter the product title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <div className='flex items-center gap-3'>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt='Product Image'
                    className='h-12 w-12 rounded object-cover'
                    onError={(e) => {
                      // 如果图片加载失败，隐藏图片元素
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className='bg-muted flex h-12 w-12 items-center justify-center rounded'>
                    <ImageIcon className='text-muted-foreground h-6 w-6' />
                  </div>
                )}
                <Input
                  id='imageUrl'
                  placeholder='Please enter the image URL'
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className='flex-1'
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
            onClick={handleConfirm}
            disabled={!sku.trim() || !title.trim()}
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
