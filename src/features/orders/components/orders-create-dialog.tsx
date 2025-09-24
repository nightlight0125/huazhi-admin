import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Package } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { useOrders } from './orders-provider'
import { stores, logistics, shippingOrigins, countries, orderStatuses } from '../data/data'

// 产品变体验证模式
const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '变体名称为必填项'),
  value: z.string().min(1, '变体值为必填项'),
})

// 产品验证模式
const productSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, '产品名称为必填项'),
  productVariant: z.array(productVariantSchema).min(1, '至少需要一个产品变体'),
  quantity: z.number().min(1, '数量必须大于0'),
  productImageUrl: z.string().url('请输入有效的图片URL'),
  productLink: z.string().url('请输入有效的产品链接'),
  price: z.number().min(0, '价格不能为负数'),
  totalPrice: z.number().min(0, '总价不能为负数'),
})

// 表单验证模式
const formSchema = z.object({
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
  productList: z.array(productSchema).min(1, '至少需要一个产品'),
})

type OrderForm = z.infer<typeof formSchema>

interface OrdersCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean | null) => void
}

export function OrdersCreateDialog({ open, onOpenChange }: OrdersCreateDialogProps) {
  const { setCurrentRow } = useOrders()
  
  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
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
      productList: [
        {
          id: crypto.randomUUID(),
          productName: '',
          productVariant: [
            {
              id: crypto.randomUUID(),
              name: '颜色',
              value: '',
            },
            {
              id: crypto.randomUUID(),
              name: '尺寸',
              value: '',
            }
          ],
          quantity: 1,
          productImageUrl: '',
          productLink: '',
          price: 0,
          totalPrice: 0,
        }
      ],
    },
  })

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control: form.control,
    name: 'productList',
  })

  const onSubmit = (values: OrderForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  const addProduct = () => {
    appendProduct({
      id: crypto.randomUUID(),
      productName: '',
      productVariant: [
        {
          id: crypto.randomUUID(),
          name: '颜色',
          value: '',
        },
        {
          id: crypto.randomUUID(),
          name: '尺寸',
          value: '',
        }
      ],
      quantity: 1,
      productImageUrl: '',
      productLink: '',
      price: 0,
      totalPrice: 0,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            创建新订单
          </DialogTitle>
          <DialogDescription>
            填写订单信息以创建新的订单记录。您可以添加多个产品到订单中。
          </DialogDescription>
        </DialogHeader>
        
        <div className='flex-1 overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='order-form'
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

              {/* 产品列表 */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold border-b pb-2 flex-1'>产品列表</h3>
                  <Button type='button' variant='outline' size='sm' onClick={addProduct}>
                    <Plus className='h-4 w-4 mr-2' />
                    添加产品
                  </Button>
                </div>
                
                <div className='space-y-4'>
                  {productFields.map((field, index) => (
                    <div key={field.id} className='border rounded-lg p-4 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-medium'>产品 {index + 1}</h4>
                        {productFields.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeProduct(index)}
                            className='text-destructive hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                      
                      <div className='grid grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`productList.${index}.productName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>产品名称</FormLabel>
                              <FormControl>
                                <Input placeholder='例如：iPhone 15 Pro' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`productList.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>数量</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='1'
                                  placeholder='1'
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className='grid grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`productList.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>单价</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  step='0.01'
                                  placeholder='0.00'
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`productList.${index}.totalPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>总价</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min='0'
                                  step='0.01'
                                  placeholder='0.00'
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className='grid grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name={`productList.${index}.productImageUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>产品图片URL</FormLabel>
                              <FormControl>
                                <Input placeholder='https://example.com/image.jpg' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`productList.${index}.productLink`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>产品链接</FormLabel>
                              <FormControl>
                                <Input placeholder='https://example.com/product' {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {/* 产品变体 */}
                      <div className='space-y-2'>
                        <FormLabel>产品变体</FormLabel>
                        <div className='flex gap-2 flex-wrap'>
                          <Badge variant='secondary'>颜色: 红色</Badge>
                          <Badge variant='secondary'>尺寸: L</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </form>
          </Form>
        </div>
        
        <DialogFooter>
          <Button type='submit' form='order-form'>
            创建订单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}