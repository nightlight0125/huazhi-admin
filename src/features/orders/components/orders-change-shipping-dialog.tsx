import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { logistics, shippingOrigins } from '../data/data'
import { type Order } from '../data/schema'

interface OrdersChangeShippingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrdersChangeShippingDialog({ open, onOpenChange, order }: OrdersChangeShippingDialogProps) {
  const [formData, setFormData] = useState({
    shippingMethod: order.logistics,
    shippingOrigin: order.shippingOrigin,
    note: '',
  })

  const handleSubmit = () => {
    console.log('更改发货方式:', { 
      orderId: order.id,
      shippingMethod: formData.shippingMethod,
      shippingOrigin: formData.shippingOrigin,
      note: formData.note 
    })
    onOpenChange(false)
    setFormData({ shippingMethod: order.logistics, shippingOrigin: order.shippingOrigin, note: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>更改发货方式</DialogTitle>
          <DialogDescription>
            为订单 {order.platformOrderNumber} 更改发货方式
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* 订单信息 */}
          <div className='space-y-2'>
            <Label>订单信息</Label>
            <div className='p-3 border rounded-lg bg-muted/50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>{order.platformOrderNumber}</Badge>
                  <span className='text-sm'>{order.customer}</span>
                </div>
                <span className='text-sm font-medium'>
                  ${order.totalCost.toFixed(2)}
                </span>
              </div>
              <div className='mt-2 text-sm text-muted-foreground'>
                当前物流: {logistics.find(l => l.value === order.logistics)?.label || order.logistics}
              </div>
              <div className='text-sm text-muted-foreground'>
                当前发货地: {shippingOrigins.find(s => s.value === order.shippingOrigin)?.label || order.shippingOrigin}
              </div>
            </div>
          </div>

          {/* 新的发货信息 */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='shippingMethod'>新的物流方式</Label>
              <Select value={formData.shippingMethod} onValueChange={(value) => setFormData({ ...formData, shippingMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择物流方式' />
                </SelectTrigger>
                <SelectContent>
                  {logistics.map((logistic) => (
                    <SelectItem key={logistic.value} value={logistic.value}>
                      {logistic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='shippingOrigin'>新的发货地</Label>
              <Select value={formData.shippingOrigin} onValueChange={(value) => setFormData({ ...formData, shippingOrigin: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择发货地' />
                </SelectTrigger>
                <SelectContent>
                  {shippingOrigins.map((origin) => (
                    <SelectItem key={origin.value} value={origin.value}>
                      {origin.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>更改说明</Label>
            <Textarea
              id='note'
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder='请输入更改发货方式的原因...'
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            确认更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
