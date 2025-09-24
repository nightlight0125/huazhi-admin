import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard, Wallet } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { paymentMethods } from '../data/data'

// 充值表单验证模式
const rechargeFormSchema = z.object({
  amount: z.number().min(1, '充值金额必须大于0').max(100000, '单次充值金额不能超过100,000元'),
  paymentMethod: z.string().min(1, '请选择支付方式'),
  description: z.string().optional(),
})

type RechargeForm = z.infer<typeof rechargeFormSchema>

interface WalletRechargeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletRechargeDialog({ open, onOpenChange }: WalletRechargeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RechargeForm>({
    resolver: zodResolver(rechargeFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: '',
      description: '',
    },
  })

  const onSubmit = async (values: RechargeForm) => {
    setIsSubmitting(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSubmittedData(values)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('充值失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Wallet className='h-5 w-5' />
            账户充值
          </DialogTitle>
          <DialogDescription>
            选择充值金额和支付方式来完成充值
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* 充值金额 */}
            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>充值金额 (元)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      max='100000'
                      step='0.01'
                      placeholder='请输入充值金额'
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 快速金额选择 */}
            <div className='space-y-2'>
              <p className='text-sm font-medium'>快速选择</p>
              <div className='flex flex-wrap gap-2'>
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setValue('amount', amount)}
                  >
                    ¥{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* 支付方式 */}
            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>支付方式</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择支付方式'
                    items={paymentMethods.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 备注 */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注 (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder='请输入备注信息' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '处理中...' : '确认充值'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
