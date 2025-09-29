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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { type Order } from '../data/schema'

interface OrdersBatchPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedOrders: Order[]
}

export function OrdersBatchPaymentDialog({ open, onOpenChange, selectedOrders }: OrdersBatchPaymentDialogProps) {
  const [formData, setFormData] = useState({
    paymentMethod: '',
    paymentAmount: '',
    note: '',
  })

  const handleSubmit = () => {
    const orderIds = selectedOrders.map(order => order.id)
    console.log('批量付款:', { 
      orderIds, 
      paymentMethod: formData.paymentMethod,
      paymentAmount: parseFloat(formData.paymentAmount),
      note: formData.note 
    })
    onOpenChange(false)
    setFormData({ paymentMethod: '', paymentAmount: '', note: '' })
  }

  // 计算总金额
  const totalAmount = selectedOrders.reduce((sum, order) => sum + order.totalCost, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>批量付款</DialogTitle>
          <DialogDescription>
            对 {selectedOrders.length} 个订单执行批量付款操作
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
                    ${order.totalCost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 付款信息 */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='paymentMethod'>付款方式</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='选择付款方式' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='alipay'>支付宝</SelectItem>
                  <SelectItem value='wechat'>微信支付</SelectItem>
                  <SelectItem value='bank_transfer'>银行转账</SelectItem>
                  <SelectItem value='credit_card'>信用卡</SelectItem>
                  <SelectItem value='paypal'>PayPal</SelectItem>
                  <SelectItem value='stripe'>Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='paymentAmount'>付款金额</Label>
              <Input
                id='paymentAmount'
                type='number'
                step='0.01'
                value={formData.paymentAmount}
                onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                placeholder={`总金额: $${totalAmount.toFixed(2)}`}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='note'>付款备注</Label>
            <Textarea
              id='note'
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder='请输入付款备注...'
            />
          </div>

          {/* 金额汇总 */}
          <div className='space-y-2'>
            <Label>金额汇总</Label>
            <div className='p-4 bg-muted rounded-lg'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>订单总数:</span>
                <span className='font-medium'>{selectedOrders.length} 个</span>
              </div>
              <div className='flex justify-between items-center mt-2'>
                <span className='text-sm text-muted-foreground'>总金额:</span>
                <span className='font-bold text-primary text-lg'>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.paymentMethod || !formData.paymentAmount}>
            确认付款
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
