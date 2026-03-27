import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import worldCountries from 'world-countries'
import { useAuthStore } from '@/stores/auth-store'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import { addBTOrder } from '@/lib/api/orders'
import { getUserShopList, type ShopListItem } from '@/lib/api/shop'
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
import { SelectMyProductDialog } from './select-my-product-dialog'
import { SelectStoreProductDialog } from './select-store-product-dialog'

// 级联选项（与 address-form 一致）
type CascaderOption = {
  value: string
  label: string
  icon?: (props: { className?: string }) => React.ReactElement
  number?: string
}

const createFlagIcon = (countryCode: string) => {
  const FlagIcon = ({ className }: { className?: string }) => {
    const code = countryCode.toLowerCase()
    return <span className={`fi fi-${code} ${className || ''}`} />
  }
  return FlagIcon
}

// 产品表单验证模式（rawItem 保存完整后端对象，用于后续提交或扩展）
const productFormSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, '产品名称为必填项'),
  productVariants: z.string().optional(),
  quantity: z.number().min(1, '数量必须大于0'),
  unitPrice: z.number().min(0, '单价不能为负'),
  rawItem: z.record(z.string(), z.unknown()).optional(), // 完整后端对象
})

// 表单验证模式（country/divisionPath/province 与 address-form 级联结构一致）
const formSchema = z.object({
  store: z.string().min(1, '店铺为必填项'),
  customerName: z.string().min(1, '客户名称为必填项'),
  country: z.string().min(1, '国家为必填项'),
  divisionPath: z.array(z.string()).optional(), // 多级行政区路径 [省id, 市id, ..., 叶节点id]
  province: z.string().optional(), // 叶子节点行政区 id（提交用 admindivisionId）
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
  const { auth } = useAuthStore()
  const [selectStoreProductOpen, setSelectStoreProductOpen] = useState(false)
  const [selectMyProductOpen, setSelectMyProductOpen] = useState(false)
  const [shopList, setShopList] = useState<ShopListItem[]>([])
  const [isLoadingShops, setIsLoadingShops] = useState(false)

  useEffect(() => {
    const userId = auth.user?.id
    if (!userId) return
    const fetchShops = async () => {
      setIsLoadingShops(true)
      try {
        const { list } = await getUserShopList({
          hzkjAccountId: userId,
          pageNo: 0,
          pageSize: 100,
        })
        setShopList(
          list.filter((shop) => String(shop.enable ?? '1') !== '0')
        )
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load shop list.'
        )
        setShopList([])
      } finally {
        setIsLoadingShops(false)
      }
    }
    void fetchShops()
  }, [auth.user?.id])

  // 国家列表
  const [regionCountries, setRegionCountries] = useState<CascaderOption[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)

  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const rows: CountryItem[] = await queryCountry(1, 1000)
        setRegionCountries(
          rows
            .filter((item) => item.id)
            .map((item) => {
              const countryCode = item.twocountrycode || item.hzkj_code
              const countryInfo = countryCode
                ? worldCountries.find(
                    (c: { cca2?: string }) =>
                      c.cca2?.toUpperCase() ===
                      String(countryCode).toUpperCase()
                  )
                : null
              const code =
                (countryInfo as { cca2?: string })?.cca2?.toLowerCase() ||
                String(countryCode || '').toLowerCase() ||
                ''
              return {
                value: String(item.id ?? ''),
                label: item.description ?? item.name ?? String(item.id),
                number: item.number,
                icon: code ? createFlagIcon(code) : undefined,
              }
            })
        )
      } catch (error) {
        console.error('Failed to load countries:', error)
        toast.error('Failed to load countries')
        setRegionCountries([])
      } finally {
        setIsLoadingCountries(false)
      }
    }
    void loadCountries()
  }, [])

  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: '',
      customerName: '',
      country: '',
      divisionPath: [],
      province: '',
      city: '',
      address: '',
      phoneNumber: '',
      email: '',
      zipCode: '',
      taxNumber: '',
      products: [],
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (values: OrderForm) => {
    const customerId = auth.user?.customerId
    if (!customerId) {
      toast.error('Please login first')
      return
    }

    const detail = values.products
      .map((p) => {
        const raw = p.rawItem as Record<string, unknown> | undefined
        const skuId =
          raw && typeof raw === 'object' && (raw.id ?? raw.skuId)
            ? String(raw.id ?? raw.skuId)
            : ''
        if (!skuId) return null
        const variantIdRaw = raw?.variantId ?? raw?.variant_id
        const variantId =
          variantIdRaw != null && variantIdRaw !== ''
            ? String(variantIdRaw)
            : undefined
        return { skuId, quantity: p.quantity, ...(variantId && { variantId }) }
      })
      .filter(
        (d): d is { skuId: string; quantity: number; variantId?: string } => !!d
      )

    if (detail.length === 0 || detail.length !== values.products.length) {
      toast.error(
        'All products must have a valid SKU (add products from Select Store Product or Select My Product)'
      )
      return
    }

    setIsSubmitting(true)
    try {
      await addBTOrder({
        orderVo: {
          customerId: String(customerId),
          shopId: values.store,
          customerName: values.customerName,
          countryId: values.country,
          admindivisionId: values.province || undefined,
          city: values.city,
          address1: values.address,
          phone: values.phoneNumber,
          email: values.email || undefined,
          postCode: values.zipCode,
          taxId: values.taxNumber || undefined,
          detail,
        },
      })
      toast.success('Order created successfully')
      navigate({ to: '/orders' })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create order.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectStoreProduct = (items: Record<string, unknown>[]) => {
    items.forEach((item) => {
      const price = Number((item as any).skuPrice ?? 0) || 0
      appendProduct({
        id: crypto.randomUUID(),
        productName: String(item.skuCName ?? ''),
        productVariants: String(item.skuNumber ?? ''),
        quantity: 1,
        unitPrice: price,
        rawItem: item, // 保存完整后端对象
      })
    })
  }

  const handleSelectMyProduct = (items: Record<string, unknown>[]) => {
    items.forEach((item) => {
      const price =
        Number(
          (item as any).purPrice ??
            (item as any).price ??
            (item as any).hzkj_pur_price ??
            0
        ) || 0
      const sku =
        (item as any).number ??
        (item as any).hzkj_local_sku ??
        (item as any).skuNumber ??
        ''
      appendProduct({
        id: crypto.randomUUID(),
        productName: String(item.spuName ?? ''),
        productVariants: String(sku),
        quantity: 1,
        unitPrice: price,
        rawItem: item,
      })
    })
    if (items.length > 0) {
      toast.success(`Added ${items.length} product(s)`)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header with Save Button */}
      <div className='flex justify-end'>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className=''
        >
          {isSubmitting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : null}
          Save
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl font-bold'>Base Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
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
                        disabled={isLoadingShops}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='--Please select a shop--' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shopList.map((shop) => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.name}
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

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Country / Region <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('divisionPath', [])
                          form.setValue('province', '')
                        }}
                        disabled={isLoadingCountries}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingCountries
                                  ? 'Loading...'
                                  : 'Select country'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regionCountries.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              <span className='flex items-center gap-2'>
                                {c.icon && (
                                  <c.icon className='h-4 w-4 shrink-0' />
                                )}
                                {c.label}
                              </span>
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
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        City<span className='text-red-500'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Please enter city' {...field} />
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
                    onClick={() => setSelectMyProductOpen(true)}
                  >
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
                      <TableHead>SKU</TableHead>
                      <TableHead>
                        Quantity<span className='text-red-500'>*</span>
                      </TableHead>
                      <TableHead>Unit Price</TableHead>
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
                                  <Input
                                    {...field}
                                    readOnly
                                    disabled
                                    className='min-w-[200px]'
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
                            name={`products.${index}.productVariants`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    readOnly
                                    disabled
                                    className='min-w-[150px]'
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
                            name={`products.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type='number'
                                    min='0'
                                    step={0.01}
                                    {...field}
                                    readOnly
                                    disabled
                                    onChange={(e) => {
                                      const next = Number(e.target.value)
                                      field.onChange(
                                        Number.isNaN(next) || next < 0
                                          ? 0
                                          : next
                                      )
                                    }}
                                    className='min-w-[80px]'
                                  />
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
              {productFields.length > 0 && (
                <div className='mt-4 flex justify-end'>
                  <span className='font-medium'>
                    Total:{' '}
                    {(form.watch('products') ?? [])
                      .reduce(
                        (sum, p) =>
                          sum + (p?.unitPrice ?? 0) * (p?.quantity ?? 1),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </Form>

      <SelectMyProductDialog
        open={selectMyProductOpen}
        onOpenChange={setSelectMyProductOpen}
        onSelect={handleSelectMyProduct}
      />
      <SelectStoreProductDialog
        open={selectStoreProductOpen}
        onOpenChange={setSelectStoreProductOpen}
        onSelect={handleSelectStoreProduct}
      />
    </div>
  )
}
