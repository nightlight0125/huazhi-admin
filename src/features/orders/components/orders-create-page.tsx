import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import worldCountries from 'world-countries'
import { useAuthStore } from '@/stores/auth-store'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import { addBTOrder } from '@/lib/api/orders'
import { getUserShopList, type ShopListItem } from '@/lib/api/shop'
import {
  queryAdmindivision,
  queryAdmindivisionLevel,
  type AdmindivisionItem,
  type AdmindivisionLevelItem,
} from '@/lib/api/users'
import { cn } from '@/lib/utils'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  productPicUrl: z.string().optional(),
  productLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      {
        message: '请输入有效的产品链接',
      }
    ),
  rawItem: z.record(z.string(), z.unknown()).optional(), // 完整后端对象
})

// 表单验证模式（country/provinceLevel/province 为 address-form 级联结构）
const formSchema = z.object({
  store: z.string().min(1, '店铺为必填项'),
  orderNo: z.string().min(1, '订单号为必填项'),
  customerName: z.string().min(1, '客户名称为必填项'),
  country: z.string().min(1, '国家为必填项'),
  provinceLevel: z.string().optional(), // 第二级：级别 id
  province: z.string().optional(), // 第三级：行政区 id
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
        setShopList(list)
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

  // 国家/省/地区级联（与 address-form 一致：queryCountry + queryAdmindivisionLevel + queryAdmindivision）
  const [regionCountries, setRegionCountries] = useState<CascaderOption[]>([])
  const [regionProvinces, setRegionProvinces] = useState<CascaderOption[]>([])
  const [regionDivisions, setRegionDivisions] = useState<CascaderOption[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)

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

  const loadProvinces = async (countryId: string) => {
    if (!countryId) return
    setRegionProvinces([])
    setRegionDivisions([])
    form.setValue('provinceLevel', '')
    form.setValue('province', '')
    setIsLoadingProvinces(true)
    try {
      const levels: AdmindivisionLevelItem[] = await queryAdmindivisionLevel(
        countryId,
        1,
        100
      )
      setRegionProvinces(
        levels.map((l) => ({
          value: l.id,
          label: l.name ?? String(l.id),
        }))
      )
    } catch (error) {
      console.error('Failed to load provinces:', error)
      toast.error('Failed to load provinces')
    } finally {
      setIsLoadingProvinces(false)
    }
  }

  const loadDivisions = async (countryId: string, provinceLevelId: string) => {
    if (!countryId || !provinceLevelId) return
    setRegionDivisions([])
    form.setValue('province', '')
    setIsLoadingDivisions(true)
    try {
      const rows: AdmindivisionItem[] = await queryAdmindivision(
        countryId,
        provinceLevelId,
        undefined,
        1,
        500
      )
      setRegionDivisions(
        rows.map((item) => ({
          value: item.id,
          label: item.name ?? String(item.id),
        }))
      )
    } catch (error) {
      console.error('Failed to load divisions:', error)
      toast.error('Failed to load divisions')
    } finally {
      setIsLoadingDivisions(false)
    }
  }

  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: '',
      orderNo: 'U0169552511111021',
      customerName: '',
      country: '',
      provinceLevel: '',
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
        const skuId =
          p.rawItem &&
          typeof p.rawItem === 'object' &&
          (p.rawItem.id ?? p.rawItem.skuId)
            ? String(
                (p.rawItem as Record<string, unknown>).id ??
                  (p.rawItem as Record<string, unknown>).skuId
              )
            : ''
        return skuId ? { skuId, quantity: p.quantity } : null
      })
      .filter((d): d is { skuId: string; quantity: number } => !!d)

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
          orderNumber: values.orderNo,
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
      appendProduct({
        id: crypto.randomUUID(),
        productName: String(item.skuEName ?? ''),
        productVariants: String(item.skuNumber ?? ''),
        quantity: 1,
        productPicUrl: String(item.picture ?? ''),
        productLink: '',
        rawItem: item, // 保存完整后端对象
      })
    })
  }

  // 从弹框选择收藏产品后加入列表
  // 映射：Product Name<-spuName, Product Pic Url<-pic，其余无对应字段
  const handleSelectMyProduct = (items: Record<string, unknown>[]) => {
    items.forEach((item) => {
      appendProduct({
        id: crypto.randomUUID(),
        productName: String(item.spuName ?? ''),
        productVariants: '',
        quantity: 1,
        productPicUrl: String(item.pic ?? ''),
        productLink: '',
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
                              {/* {shop.platform ? ` (${shop.platform})` : ''} */}
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

              {/* Row 2: Country/Province/Region（与 address-form 级联逻辑一致）, City */}
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Country / Province{' '}
                        <span className='text-red-500'>*</span>
                      </FormLabel>
                      <Popover
                        open={regionOpen}
                        onOpenChange={(open) => {
                          setRegionOpen(open)
                          if (open) {
                            const countryId = form.getValues('country')
                            const levelId = form.getValues('provinceLevel')
                            if (countryId && regionProvinces.length === 0)
                              loadProvinces(countryId)
                            else if (
                              countryId &&
                              levelId &&
                              regionDivisions.length === 0
                            )
                              loadDivisions(countryId, levelId)
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type='button'
                              variant='outline'
                              className={cn(
                                'w-full justify-between font-normal',
                                !form.watch('country') &&
                                  'text-muted-foreground'
                              )}
                            >
                              <span className='truncate'>
                                {(() => {
                                  const countryId = form.watch('country')
                                  const levelId = form.watch('provinceLevel')
                                  const divisionId = form.watch('province')
                                  const c = regionCountries.find(
                                    (x) => String(x.value) === String(countryId)
                                  )
                                  const p = regionProvinces.find(
                                    (x) => String(x.value) === String(levelId)
                                  )
                                  const d = regionDivisions.find(
                                    (x) =>
                                      String(x.value) === String(divisionId)
                                  )
                                  if (c && p && d)
                                    return `${c.label} / ${p.label} / ${d.label}`
                                  if (c && p) return `${c.label} / ${p.label}`
                                  if (c) return c.label
                                  return 'Please select country / province / city'
                                })()}
                              </span>
                              <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-[720px] p-2'
                          align='start'
                          onOpenAutoFocus={(e) => e.preventDefault()}
                        >
                          <div className='flex gap-2'>
                            <div className='max-h-64 flex-1 overflow-y-auto border-r pr-1'>
                              <div className='text-muted-foreground mb-2 text-xs font-medium'>
                                Country/Region
                              </div>
                              {isLoadingCountries ? (
                                <div className='text-muted-foreground py-2 text-xs'>
                                  Loading...
                                </div>
                              ) : (
                                regionCountries.map((c) => {
                                  const isActive =
                                    String(c.value) ===
                                    String(form.watch('country'))
                                  return (
                                    <button
                                      key={c.value}
                                      type='button'
                                      className={cn(
                                        'hover:bg-muted flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm',
                                        isActive && 'bg-muted font-medium'
                                      )}
                                      onClick={() => {
                                        form.setValue('country', c.value)
                                        form.setValue('provinceLevel', '')
                                        form.setValue('province', '')
                                        loadProvinces(c.value)
                                      }}
                                    >
                                      <span className='flex items-center gap-2 truncate'>
                                        {c.icon && (
                                          <c.icon className='h-4 w-4 shrink-0' />
                                        )}
                                        <span>{c.label}</span>
                                      </span>
                                    </button>
                                  )
                                })
                              )}
                            </div>
                            {(regionProvinces.length > 0 ||
                              isLoadingProvinces) && (
                              <div className='max-h-64 flex-1 overflow-y-auto border-r px-1'>
                                <div className='text-muted-foreground mb-2 text-xs font-medium'>
                                  Province
                                </div>
                                {isLoadingProvinces ? (
                                  <div className='text-muted-foreground py-2 text-xs'>
                                    Loading...
                                  </div>
                                ) : (
                                  regionProvinces.map((p) => {
                                    const isActive =
                                      String(p.value) ===
                                      String(form.watch('provinceLevel'))
                                    return (
                                      <button
                                        key={p.value}
                                        type='button'
                                        className={cn(
                                          'hover:bg-muted flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm',
                                          isActive && 'bg-muted font-medium'
                                        )}
                                        onClick={() => {
                                          form.setValue(
                                            'provinceLevel',
                                            p.value
                                          )
                                          form.setValue('province', '')
                                          loadDivisions(
                                            form.getValues('country'),
                                            p.value
                                          )
                                        }}
                                      >
                                        <span className='truncate'>
                                          {p.label}
                                        </span>
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            )}
                            {(regionDivisions.length > 0 ||
                              isLoadingDivisions) && (
                              <div className='max-h-64 flex-1 overflow-y-auto pl-1'>
                                <div className='text-muted-foreground mb-2 text-xs font-medium'>
                                  Region
                                </div>
                                {isLoadingDivisions ? (
                                  <div className='text-muted-foreground py-2 text-xs'>
                                    Loading...
                                  </div>
                                ) : (
                                  regionDivisions.map((d) => {
                                    const isActive =
                                      String(d.value) ===
                                      String(form.watch('province'))
                                    return (
                                      <button
                                        key={d.value}
                                        type='button'
                                        className={cn(
                                          'hover:bg-muted flex w-full items-center rounded px-2 py-1 text-left text-sm',
                                          isActive && 'bg-muted font-medium'
                                        )}
                                        onClick={() => {
                                          form.setValue('province', d.value)
                                          setRegionOpen(false)
                                        }}
                                      >
                                        <span className='truncate'>
                                          {d.label}
                                        </span>
                                      </button>
                                    )
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
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

      {/* Select My Product Dialog */}
      <SelectMyProductDialog
        open={selectMyProductOpen}
        onOpenChange={setSelectMyProductOpen}
        onSelect={handleSelectMyProduct}
      />
      {/* Select Store Product Dialog */}
      <SelectStoreProductDialog
        open={selectStoreProductOpen}
        onOpenChange={setSelectStoreProductOpen}
        onSelect={handleSelectStoreProduct}
      />
    </div>
  )
}
