import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { useOrders } from './orders-provider'
import { stores, countries } from '../data/data'

// 简化的表单验证模式（编辑时不需要产品列表）
const updateFormSchema = z.object({
  store: z.string().min(1, '店铺为必填项'),
  orderNumber: z.string().min(1, '订单号为必填项'),
  customerName: z.string().min(1, '客户名称为必填项'),
  country: z.string().min(1, '国家为必填项'),
  province: z.string().optional(),
  city: z.string().optional(),
  address: z.string().min(1, '地址为必填项'),
  phoneNumber: z.string().min(1, '电话号码为必填项'),
  email: z.string().email('请输入有效的邮箱地址'),
  postalCode: z.string().optional(),
  taxNumber: z.string().optional(),
})

type UpdateOrderForm = z.infer<typeof updateFormSchema>

interface OrdersUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean | null) => void
}

export function OrdersUpdateDialog({ open, onOpenChange }: OrdersUpdateDialogProps) {
  const { currentRow } = useOrders()
  
  const form = useForm<UpdateOrderForm>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      store: '',
      orderNumber: '',
      customerName: '',
      country: '',
      province: '',
      city: '',
      address: '',
      phoneNumber: '',
      email: '',
      postalCode: '',
      taxNumber: '',
    },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        store: currentRow.store,
        orderNumber: currentRow.orderNumber,
        customerName: currentRow.customerName,
        country: currentRow.country,
        province: currentRow.province,
        city: currentRow.city,
        address: currentRow.address,
        phoneNumber: currentRow.phoneNumber,
        email: currentRow.email,
        postalCode: currentRow.postalCode,
        taxNumber: currentRow.taxNumber,
      })
    }
  }, [currentRow, form])

  const onSubmit = (values: UpdateOrderForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  if (!currentRow) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            编辑订单
          </DialogTitle>
          <DialogDescription>
            修改订单 {currentRow.orderNumber} 的信息
          </DialogDescription>
        </DialogHeader>
        
        <div className='flex-1 overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='order-update-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 px-1'
            >
              {/* 基本信息 */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>基本信息</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='store'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>店铺</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='选择店铺'
                          items={stores.map(({ label, value }) => ({
                            label,
                            value,
                          }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='orderNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>订单号</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：ORD-123456' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name='customerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>客户名称</FormLabel>
                      <FormControl>
                        <Input placeholder='例如：张三' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 地址信息 */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>地址信息</h3>
                <div className='grid grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='country'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>国家</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='选择国家'
                          items={countries.map(({ label, value }) => ({
                            label,
                            value,
                          }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='province'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>省/州</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：广东省' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>城市</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：深圳市' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>详细地址</FormLabel>
                      <FormControl>
                        <Textarea placeholder='请输入详细地址' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='postalCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮政编码</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：518000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='taxNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>税号</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：91440300MA5XXXXXXX' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 联系信息 */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold border-b pb-2'>联系信息</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>电话号码</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：+86 138 0013 8000' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>电子邮件</FormLabel>
                        <FormControl>
                          <Input type='email' placeholder='例如：zhangsan@example.com' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

            </form>
          </Form>
        </div>
        
        <DialogFooter>
          <Button type='submit' form='order-update-form'>
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
