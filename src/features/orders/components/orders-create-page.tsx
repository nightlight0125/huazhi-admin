import { useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { countries, stores } from '../data/data'
import { SelectStoreProductDialog } from './select-store-product-dialog'

// 产品表单验证模式
const productFormSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, '产品名称为必填项'),
  productVariants: z.string().optional(),
  quantity: z.number().min(1, '数量必须大于0'),
  productPicUrl: z.string().optional(),
  productLink: z
    .string()
    .min(1, '产品链接为必填项')
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: '请输入有效的产品链接',
    }),
})

// 表单验证模式
const formSchema = z.object({
  store: z.string().min(1, '店铺为必填项'),
  orderNo: z.string().min(1, '订单号为必填项'),
  customerName: z.string().min(1, '客户名称为必填项'),
  country: z.string().min(1, '国家为必填项'),
  province: z.string().optional(),
  city: z.string().min(1, '城市为必填项'),
  address: z.string().min(1, '地址为必填项'),
  phoneNumber: z.string().min(1, '电话号码为必填项'),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  zipCode: z.string().min(1, '邮政编码为必填项'),
  taxNumber: z.string().optional(),
  products: z.array(productFormSchema).min(1, '至少需要一个产品'),
})

type OrderForm = z.infer<typeof formSchema>

export function OrdersCreatePage() {
  const navigate = useNavigate()
  const [selectStoreProductOpen, setSelectStoreProductOpen] = useState(false)

  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: '',
      orderNo: 'U0169552511111021',
      customerName: '',
      country: '',
      province: '',
      city: '',
      address: '',
      phoneNumber: '',
      email: '',
      zipCode: '',
      taxNumber: '',
      products: [
        {
          id: crypto.randomUUID(),
          productName: 'HY300 Home mini portable :',
          productVariants: '3326 Android ver',
          quantity: 10,
          productPicUrl: 'https://erp.dropsure.com/Up',
          productLink: 'https://app.dropsure.com/C',
        },
      ],
    },
  })

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const onSubmit = (values: OrderForm) => {
    console.log('Form submitted:', values)
    // TODO: 实现保存逻辑
    // 保存成功后返回订单列表
    navigate({ to: '/orders' })
  }

  const handleAddNewRow = () => {
    appendProduct({
      id: crypto.randomUUID(),
      productName: '',
      productVariants: '',
      quantity: 1,
      productPicUrl: '',
      productLink: '',
    })
  }

  const handleSelectStoreProduct = (product: {
    id: string
    sku: string
    productName: string
    image: string
  }) => {
    appendProduct({
      id: crypto.randomUUID(),
      productName: product.productName,
      productVariants: product.sku,
      quantity: 1,
      productPicUrl: product.image,
      productLink: '',
    })
  }

  return (
    <div className='space-y-6'>
      {/* Header with Save Button */}
      <div className='flex justify-end'>
        <Button onClick={form.handleSubmit(onSubmit)} className=''>
          Save
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Base Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-xl font-bold'>Base Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Row 1: Store, OrderNo, Customer Name */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='store'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Store<span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='--Please select a shop--' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.value} value={store.value}>
                              {store.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='orderNo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        OrderNo<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='customerName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Customer Name<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Country, Province/State, City */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country<span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='--Please select the country--' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.value}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='province'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province/State</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>
                        City<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Address, Phone number, Email */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone number<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type='email' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: Zip code, Tax number */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='zipCode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Zip code<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Tax number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Info Card */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl font-bold'>
                  Product Info
                </CardTitle>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleAddNewRow}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add New Row
                  </Button>
                  <Button type='button' variant='outline'>
                    <Search className='mr-2 h-4 w-4' /> Select My Product
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setSelectStoreProductOpen(true)}
                  >
                    <Search className='mr-2 h-4 w-4' /> Select My Store Product
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-purple-50 dark:bg-purple-950/20'>
                      <TableHead>
                        Product Name<span className='text-red-500'>*</span>
                      </TableHead>
                      <TableHead>Product Variants</TableHead>
                      <TableHead>
                        Quantity<span className='text-red-500'>*</span>
                      </TableHead>
                      <TableHead>Product Pic Url</TableHead>
                      <TableHead>
                        Product Link<span className='text-red-500'>*</span>
                      </TableHead>
                      <TableHead className='w-[100px]'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productFields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`products.${index}.productName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} className='min-w-[200px]' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`products.${index}.productVariants`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} className='min-w-[150px]' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`products.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type='number'
                                    min='1'
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className='min-w-[80px]'
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`products.${index}.productPicUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} className='min-w-[200px]' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`products.${index}.productLink`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} className='min-w-[200px]' />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeProduct(index)}
                            className='text-destructive hover:text-destructive'
                          >
                            remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Select Store Product Dialog */}
      <SelectStoreProductDialog
        open={selectStoreProductOpen}
        onOpenChange={setSelectStoreProductOpen}
        onSelect={handleSelectStoreProduct}
      />
    </div>
  )
}
