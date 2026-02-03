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
import { Loader2 } from 'lucide-react'
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
                    // 根据选择的 SKU 自动填充相关信息
                    const selectedSku = skuOptions.find(
                      (item) => item.id === value
                    )
                    if (selectedSku) {
                      // 自动填充 title（如果有 hzkj_sku_name）
                      if (selectedSku.hzkj_sku_name) {
                        setTitle(String(selectedSku.hzkj_sku_name))
                      }
                    }
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
                        .filter((item) => item.id)
                        .map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id!}
                            className='max-w-full'
                          >
                            <span className='block truncate max-w-full'>
                              {String(item.hzkj_bg_enname || 'Unknown SKU')}
                            </span>
                          </SelectItem>
                        ))
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
                disabled={true}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <img
                src='https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'
                alt='Product Image'
              />
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
