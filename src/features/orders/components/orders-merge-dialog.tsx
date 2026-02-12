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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { type Order } from '../data/schema'

interface OrdersMergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOrders: Order[]
}

export function OrdersMergeDialog({ open, onOpenChange, selectedOrders }: OrdersMergeDialogProps) {
  const [formData, setFormData] = useState({
    mergedOrderNumber: '',
    customer: '',
    note: '',
  })

  const handleSubmit = () => {
    const orderIds = selectedOrders.map(order => order.id)
    console.log('合并订单:', { 
      orderIds, 
      mergedOrderNumber: formData.mergedOrderNumber,
      customer: formData.customer,
      note: formData.note 
    })
    onOpenChange(false)
    setFormData({ mergedOrderNumber: '', customer: '', note: '' })
  }

  // 安全数值转换，防止 undefined / NaN 导致 toFixed 报错
  const toSafeNumber = (value: unknown): number =>
    typeof value === 'number' && !Number.isNaN(value) ? value : 0

  // 计算合并后的总成本
  const totalCost = selectedOrders.reduce(
    (sum, order) => sum + toSafeNumber(order.totalCost),
    0
  )
  const totalShippingCost = selectedOrders.reduce(
    (sum, order) => sum + toSafeNumber(order.shippingCost),
    0
  )
  const totalOtherCosts = selectedOrders.reduce(
    (sum, order) => sum + toSafeNumber(order.otherCosts),
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>合并订单</DialogTitle>
          <DialogDescription>
            将 {selectedOrders.length} 个订单合并为一个新订单
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-6'>
          {/* 选中订单列表 */}
          <div className='space-y-2'>
            <Label>选中的订单</Label>
            <div className='max-h-32 overflow-y-auto space-y-1'>
              {selectedOrders.map((order) => (
                <div key={order.id} className='flex items-center justify-between p-2 border rounded'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{order.platformOrderNumber}</Badge>
                    <span className='text-sm'>{order.customer}</span>
                  </div>
                  <span className='text-sm font-medium'>
                    ${toSafeNumber(order.totalCost).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 合并信息 */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='mergedOrderNumber'>合并后订单号</Label>
              <Input
                id='mergedOrderNumber'
                value={formData.mergedOrderNumber}
                onChange={(e) => setFormData({ ...formData, mergedOrderNumber: e.target.value })}
                placeholder='输入新订单号'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='customer'>客户</Label>
              <Input
                id='customer'
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder='输入客户名称'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>合并说明</Label>
            <Textarea
              id='note'
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder='请输入合并订单的说明...'
            />
          </div>

          {/* 费用汇总 */}
          <div className='space-y-2'>
            <Label>费用汇总</Label>
            <div className='grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg'>
              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>运费</div>
                <div className='font-medium'>${totalShippingCost.toFixed(2)}</div>
              </div>
              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>其他费用</div>
                <div className='font-medium'>${totalOtherCosts.toFixed(2)}</div>
              </div>
              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>总成本</div>
                <div className='font-bold text-primary'>${totalCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            确认合并
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
