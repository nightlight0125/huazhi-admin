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

// 表单验证模式（country/divisionPath/province 与 address-form 级联结构一致）
const formSchema = z.object({
  store: z.string().min(1, '店铺为必填项'),
  orderNo: z.string().min(1, '订单号为必填项'),
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

  // 国家/多级行政区级联（与 address-form 一致：动态级数）
  const [regionCountries, setRegionCountries] = useState<CascaderOption[]>([])
  const [regionLevels, setRegionLevels] = useState<AdmindivisionLevelItem[]>([])
  const [divisionColumns, setDivisionColumns] = useState<CascaderOption[][]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [loadingLevelIndex, setLoadingLevelIndex] = useState<number | null>(
    null
  )
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

  const loadDivision = async (
    countryId: string,
    levelIndex: number,
    parentId: string | undefined,
    levelsOverride?: AdmindivisionLevelItem[]
  ) => {
    if (!countryId) return
    const levels = levelsOverride ?? regionLevels
    if (levelIndex >= levels.length) return

    if (levelIndex === 0) {
      form.setValue('divisionPath', [])
      form.setValue('province', '')
    }
    setLoadingLevelIndex(levelIndex)
    setDivisionColumns((prev) => {
      const next = prev.slice(0, levelIndex)
      return [...next, [], ...Array(Math.max(0, prev.length - levelIndex - 1))]
    })

    try {
      const levelId = levels[levelIndex].id
      const rows: AdmindivisionItem[] = await queryAdmindivision(
        countryId,
        levelId,
        parentId,
        1,
        500
      )
      const options: CascaderOption[] = rows.map((item) => ({
        value: item.id,
        label: item.name ?? String(item.id),
      }))
      setDivisionColumns((prev) => {
        const next = [...prev]
        next[levelIndex] = options
        return next
      })
      const divisionPath: string[] = form.getValues('divisionPath') ?? []
      if (divisionPath.length > levelIndex + 1) {
        void loadDivision(
          countryId,
          levelIndex + 1,
          divisionPath[levelIndex],
          levels
        )
      }
    } catch (error) {
      console.error('Failed to load divisions:', error)
      toast.error('Failed to load divisions')
    } finally {
      setLoadingLevelIndex(null)
    }
  }

  const onCountryChange = async (countryId: string) => {
    if (!countryId) return
    setDivisionColumns([])
    form.setValue('divisionPath', [])
    form.setValue('province', '')
    try {
      const levels = await queryAdmindivisionLevel(countryId, 1, 100)
      setRegionLevels(levels)
      if (levels.length > 0) {
        await loadDivision(countryId, 0, undefined, levels)
      }
    } catch (error) {
      console.error('Failed to load division levels:', error)
      toast.error('Failed to load divisions')
    }
  }

  const onDivisionSelect = (levelIndex: number, divisionId: string) => {
    const newPath = (form.getValues('divisionPath') ?? []).slice(0, levelIndex)
    newPath[levelIndex] = divisionId
    form.setValue('divisionPath', newPath)
    const levelCount = regionLevels.length
    const isLastLevel = levelIndex === levelCount - 1
    if (isLastLevel) {
      form.setValue('province', divisionId)
      setRegionOpen(false)
    } else {
      void loadDivision(
        form.getValues('country'),
        levelIndex + 1,
        divisionId,
        regionLevels
      )
    }
  }

  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      store: '',
      orderNo: 'U0169552511111021',
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
        productName: String(item.skuCName ?? ''),
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

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={() => {
                    const selectedCountryId = form.watch('country')
                    const divisionPath: string[] =
                      form.watch('divisionPath') ?? []
                    const selectedCountry = regionCountries.find(
                      (c) => String(c.value) === String(selectedCountryId)
                    )
                    const displayRegionLabel =
                      selectedCountry && divisionPath.length > 0
                        ? `${selectedCountry.label} / ${divisionPath
                            .map(
                              (id, i) =>
                                divisionColumns[i]?.find(
                                  (d) => String(d.value) === String(id)
                                )?.label
                            )
                            .filter(Boolean)
                            .join(' / ')}`
                        : (selectedCountry?.label ??
                          'Please select country / province / city')
                    const levelCount = regionLevels.length
                    return (
                      <FormItem>
                        <FormLabel>
                          Country / Province{' '}
                          <span className='text-red-500'>*</span>
                        </FormLabel>
                        <Popover
                          open={regionOpen}
                          onOpenChange={(open) => {
                            setRegionOpen(open)
                            if (
                              open &&
                              selectedCountryId &&
                              loadingLevelIndex === null
                            ) {
                              if (
                                divisionColumns.length === 0 ||
                                divisionColumns[0]?.length === 0
                              )
                                onCountryChange(selectedCountryId)
                              else if (divisionPath.length > 0) {
                                const nextLevel = divisionPath.length
                                if (
                                  nextLevel < levelCount &&
                                  (!divisionColumns[nextLevel] ||
                                    divisionColumns[nextLevel].length === 0)
                                )
                                  onDivisionSelect(
                                    nextLevel - 1,
                                    divisionPath[nextLevel - 1]
                                  )
                              }
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
                                  !selectedCountryId && 'text-muted-foreground'
                                )}
                              >
                                <span className='truncate'>
                                  {displayRegionLabel}
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
                              <div className='border-border max-h-64 flex-1 overflow-y-auto border-r pr-1'>
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
                                      String(selectedCountryId)
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
                                          form.setValue('divisionPath', [])
                                          form.setValue('province', '')
                                          onCountryChange(c.value)
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
                              {Array.from(
                                { length: levelCount },
                                (_, levelIndex) => {
                                  const column = divisionColumns[levelIndex]
                                  const isLoading =
                                    loadingLevelIndex === levelIndex
                                  const hasData = column && column.length > 0
                                  if (!hasData && !isLoading) return null
                                  const selectedId = divisionPath[levelIndex]
                                  return (
                                    <div
                                      key={levelIndex}
                                      className={cn(
                                        'max-h-64 flex-1 overflow-y-auto pl-1',
                                        levelIndex < levelCount - 1 &&
                                          'border-border border-r pr-1'
                                      )}
                                    >
                                      <div className='text-muted-foreground mb-2 text-xs font-medium'>
                                        Level {levelIndex + 1}
                                      </div>
                                      {isLoading ? (
                                        <div className='text-muted-foreground py-2 text-xs'>
                                          Loading...
                                        </div>
                                      ) : (
                                        (column ?? []).map((opt) => {
                                          const isActive =
                                            String(opt.value) ===
                                            String(selectedId)
                                          return (
                                            <button
                                              key={opt.value}
                                              type='button'
                                              className={cn(
                                                'hover:bg-muted flex w-full items-center rounded px-2 py-1 text-left text-sm',
                                                isActive &&
                                                  'bg-muted font-medium'
                                              )}
                                              onClick={() =>
                                                onDivisionSelect(
                                                  levelIndex,
                                                  opt.value
                                                )
                                              }
                                            >
                                              <span className='truncate'>
                                                {opt.label}
                                              </span>
                                            </button>
                                          )
                                        })
                                      )}
                                    </div>
                                  )
                                }
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
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
