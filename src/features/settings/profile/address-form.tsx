import React, { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, HelpCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import worldCountries from 'world-countries'
import { useAuthStore } from '@/stores/auth-store'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import {
  getAddress,
  updateAddress,
  updateBillAddress,
  type UpdateAddressRequest,
  type UpdateBillAddressRequest,
} from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// 账单地址 Schema
const invoiceAddressSchema = z.object({
  firstName: z.string().min(1, 'Please enter first name'),
  lastName: z.string().min(1, 'Please enter last name'),
  phoneNumber: z.string().min(1, 'Please enter phone number'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  company: z.string().optional(),
  address1: z.string().min(1, 'Please enter address1'),
  address2: z.string().optional(),
  country: z.string().min(1, 'Please select country/region'),
  state: z.string().optional(),
  province: z.string().optional(), // 最终选中的行政区 id（叶节点，用于提交）
  provinceLevel: z.string().optional(), // 兼容旧逻辑，回填时可能用到
  divisionPath: z.array(z.string()).optional(), // 各级选中的 id 数组，长度随国家级次数动态
  city: z.string().min(1, 'Please enter city'), // 可编辑输入
  postcode: z.string().min(1, 'Please enter postcode'),
  taxId: z.string().optional(),
  syncShippingAddress: z.boolean(),
})

// 收货地址 Schema
const consigneeAddressSchema = z.object({
  firstName: z.string().min(1, 'Please enter first name'),
  lastName: z.string().min(1, 'Please enter last name'),
  phoneNumber: z.string().min(1, 'Please enter phone number'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  company: z.string().optional(),
  address1: z.string().min(1, 'Please enter address1'),
  address2: z.string().optional(),
  country: z.string().min(1, 'Please select country/region'),
  state: z.string().optional(),
  province: z.string().optional(),
  provinceLevel: z.string().optional(),
  divisionPath: z.array(z.string()).optional(),
  city: z.string().min(1, 'Please enter city'),
  postcode: z.string().min(1, 'Please enter postcode'),
  taxId: z.string().optional(),
})

type InvoiceAddressValues = z.infer<typeof invoiceAddressSchema>
type ConsigneeAddressValues = z.infer<typeof consigneeAddressSchema>

const defaultInvoiceValues: Partial<InvoiceAddressValues> = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  company: '',
  address1: '',
  address2: '',
  country: '',
  state: '',
  province: '',
  provinceLevel: '',
  divisionPath: [],
  city: '',
  postcode: '',
  taxId: '',
  syncShippingAddress: false,
}

const defaultConsigneeValues: Partial<ConsigneeAddressValues> = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  company: '',
  address1: '',
  address2: '',
  country: '',
  state: '',
  province: '',
  provinceLevel: '',
  divisionPath: [],
  city: '',
  postcode: '',
  taxId: '',
}

// 级联选项类型：value=id, label 根据级别不同（国家用 description，省/市用 name），icon 用于国家国旗
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

// 地址字段组件（仅选择国家）
function AddressFields(props: {
  form: any
  showTaxId?: boolean
  countries: CascaderOption[]
  isLoadingCountries?: boolean
}) {
  const {
    form,
    showTaxId = false,
    countries,
    isLoadingCountries = false,
  } = props
  return (
    <>
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Please enter first name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Last Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Please enter last name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='phoneNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone Number <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Please enter phone number' {...field} />
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
                <Input
                  type='email'
                  placeholder='Please enter email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name='address1'
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Address1 <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder='Please enter address1' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='address2'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address2</FormLabel>
            <FormControl>
              <Input placeholder='Please enter address2' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                form.setValue('state', '')
              }}
              disabled={isLoadingCountries}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingCountries ? 'Loading...' : 'Select country'
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span className='flex items-center gap-2'>
                      {c.icon && <c.icon className='h-4 w-4 shrink-0' />}
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
        name='state'
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input placeholder='Please enter state' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Please enter city' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='postcode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Postcode <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Please enter postcode' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {showTaxId && (
        <FormField
          control={form.control}
          name='taxId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID</FormLabel>
              <FormControl>
                <Input placeholder='Please enter tax id' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  )
}

export function AddressForm() {
  const navigate = useNavigate()
  const { returnTo } = useSearch({ from: '/_authenticated/settings/' })
  const { auth } = useAuthStore()
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [consigneeOpen, setConsigneeOpen] = useState(false)

  // 第一级：国家 - queryCountry
  const [countries, setCountries] = useState<CascaderOption[]>([])

  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [isLoadingAddressData, setIsLoadingAddressData] = useState(true)

  const invoiceForm = useForm<InvoiceAddressValues>({
    resolver: zodResolver(invoiceAddressSchema),
    defaultValues: defaultInvoiceValues,
    mode: 'onChange',
  })

  const consigneeForm = useForm<ConsigneeAddressValues>({
    resolver: zodResolver(consigneeAddressSchema),
    defaultValues: defaultConsigneeValues,
    mode: 'onChange',
  })

  // 第一级：加载国家 queryCountry，value=id, label=description，带国旗图标
  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const rows: CountryItem[] = await queryCountry(1, 1000)
        setCountries(
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
      } finally {
        setIsLoadingCountries(false)
      }
    }
    void loadCountries()
  }, [])

  // 回填/刷新地址数据：调用 getAddress 接口（保存成功后也可调用以刷新表单）
  const loadAddressData = async (options?: { silent?: boolean }) => {
    const userId = auth.user?.customerId
    if (!userId || countries.length === 0) {
      setIsLoadingAddressData(false)
      return
    }

    setIsLoadingAddressData(true)
    try {
      const addressData = await getAddress(userId)
      if (!addressData) return

      const findCountryIdByNumber = (num: string | undefined) => {
        if (!num) return ''
        const c = countries.find(
          (x) => String((x as { number?: string }).number ?? '') === String(num)
        )
        return c?.value ?? ''
      }

      const invoiceCountryId =
        addressData.hzkj_country2_id != null
          ? String(addressData.hzkj_country2_id)
          : findCountryIdByNumber(addressData.hzkj_country2_number)
      const consigneeCountryId =
        addressData.hzkj_country_id != null
          ? String(addressData.hzkj_country_id)
          : findCountryIdByNumber(addressData.hzkj_country_number)

      invoiceForm.reset({
        firstName: addressData.hzkj_customer_first_name2 ?? '',
        lastName: addressData.hzkj_customer_last_name2 ?? '',
        phoneNumber: addressData.hzkj_phone_number ?? '',
        email: addressData.hzkj_emailfield ?? '',
        address1: addressData.hzkj_bill_adress ?? '',
        address2: addressData.hzkj_bill_adress2 ?? '',
        country: invoiceCountryId,
        state: addressData.hzkj_bill_state ?? '',
        province: '',
        provinceLevel: '',
        divisionPath: [],
        city: addressData.hzkj_bill_city ?? '',
        postcode: addressData.hzkj_textfield3 ?? '',
        taxId: addressData.hzkj_tax_id2 ?? '',
        syncShippingAddress: (() => {
          const v = addressData.hzkj_synchronize_adress as unknown
          return v === true || v === 'true' || v === 1 || v === '1'
        })(),
      })

      consigneeForm.reset({
        firstName: addressData.hzkj_customer_first_name ?? '',
        lastName: addressData.hzkj_customer_last_name ?? '',
        phoneNumber: addressData.hzkj_phone ?? '',
        email: addressData.hzkj_adress_emailfield ?? '',
        address1: addressData.hzkj_textfield ?? '',
        address2: addressData.hzkj_address2 ?? '',
        country: consigneeCountryId,
        state: addressData.hzkj_state ?? '',
        province: '',
        provinceLevel: '',
        divisionPath: [],
        city: addressData.hzkj_city ?? '',
        postcode: addressData.hzkj_textfield1 ?? '',
        taxId: addressData.hzkj_tax_id1 ?? '',
      })

      if (!options?.silent) {
        toast.success('Address data loaded successfully')
      }
    } catch (error) {
      console.error('Failed to load address data:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load address data. Please try again.'
      )
    } finally {
      setIsLoadingAddressData(false)
    }
  }

  useEffect(() => {
    void loadAddressData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id, countries.length])

  const handleInvoiceSubmit = async (data: InvoiceAddressValues) => {
    try {
      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('User ID is required')
        return
      }

      const loadingToast = toast.loading('Updating billing address...')

      // 后端账单州/省字段名必须为 hzkj_bill_state（非 state）
      const billPayload: UpdateBillAddressRequest['data'][0] = {
        id: customerId,
        hzkj_customer_first_name2: data.firstName,
        hzkj_customer_last_name2: data.lastName,
        hzkj_phone_number: data.phoneNumber,
        hzkj_emailfield: data.email || '',
        hzkj_bill_city: data.city,
        hzkj_bill_state: (data.state ?? '').trim(),
        hzkj_bill_adress: data.address1,
        hzkj_bill_adress2: data.address2 || '',
        hzkj_textfield3: data.postcode,
        hzkj_tax_id2: data.taxId || '',
        hzkj_synchronize_adress: data.syncShippingAddress,
        hzkj_country2_id: data.country ? Number(data.country) : undefined,
        hzkj_admindivision2_id: data.province
          ? Number(data.province)
          : undefined,
      }
      await updateBillAddress(billPayload)

      toast.dismiss(loadingToast)
      toast.success('Billing address updated successfully!')

      await loadAddressData({ silent: true })

      if (returnTo) {
        navigate({ to: returnTo })
        return
      }

      if (data.syncShippingAddress) {
        consigneeForm.reset({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          email: data.email,
          company: data.company,
          address1: data.address1,
          address2: data.address2,
          country: data.country,
          state: data.state,
          province: '',
          provinceLevel: '',
          divisionPath: [],
          city: data.city,
          postcode: data.postcode,
          taxId: data.taxId ?? '',
        })
      }
    } catch (error) {
      console.error('Failed to save billing address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save billing address. Please try again.'
      )
    }
  }

  const handleConsigneeSubmit = async (data: ConsigneeAddressValues) => {
    try {
      const customerId = auth.user?.customerId || ''
      const loadingToast = toast.loading('Updating shipping address...')
      // 后端收货州/省字段名必须为 hzkj_state（非 state）
      const shipPayload: UpdateAddressRequest['data'][0] = {
        id: customerId,
        hzkj_customer_first_name: data.firstName,
        hzkj_customer_last_name: data.lastName,
        hzkj_phone: data.phoneNumber,
        hzkj_adress_emailfield: data.email || '',
        hzkj_city: data.city,
        hzkj_state: (data.state ?? '').trim(),
        hzkj_textfield: data.address1,
        hzkj_address2: data.address2 || '',
        hzkj_textfield1: data.postcode,
        hzkj_tax_id1: data.taxId || '',
        hzkj_country_id: data.country ? Number(data.country) : undefined,
        hzkj_admindivision_id: data.province
          ? Number(data.province)
          : undefined,
      }
      await updateAddress(shipPayload)

      toast.dismiss(loadingToast)
      toast.success('Shipping address updated successfully!')

      await loadAddressData({ silent: true })

      if (returnTo) {
        navigate({ to: returnTo })
      }
    } catch (error) {
      console.error('Failed to save shipping address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save shipping address. Please try again.'
      )
    }
  }

  return (
    <div className='relative min-h-0 space-y-4'>
      {isLoadingAddressData && (
        <div className='bg-background/80 absolute inset-0 z-10 flex items-center justify-center rounded-md'>
          <div className='text-muted-foreground flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin' />
            <span className='text-sm'>Loading address...</span>
          </div>
        </div>
      )}
      {/* 账单地址 */}
      <Collapsible open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <div className='border-border bg-card rounded-md border'>
          <CollapsibleTrigger className='hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-md'
                onClick={(e) => {
                  e.stopPropagation()
                  setInvoiceOpen(!invoiceOpen)
                }}
              >
                {invoiceOpen ? (
                  <ChevronUp className='text-muted-foreground h-4 w-4' />
                ) : (
                  <ChevronDown className='text-muted-foreground h-4 w-4' />
                )}
              </Button>
              <span className='text-foreground font-medium'>
                Invoice Address
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-800/60'
                  >
                    <HelpCircle className='h-3 w-3 text-orange-500 dark:text-orange-400' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  sideOffset={8}
                  className='max-w-[280px] text-left leading-snug whitespace-normal'
                >
                  Please ensure all required fields are completed to generate a
                  valid invoice for the orders.
                </TooltipContent>
              </Tooltip>
            </div>
          </CollapsibleTrigger>

          {invoiceOpen && (
            <div className='border-border border-t px-4 py-6'>
              <Form {...invoiceForm}>
                <form
                  onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={invoiceForm}
                    showTaxId={true}
                    countries={countries}
                    isLoadingCountries={isLoadingCountries}
                  />

                  <FormField
                    control={invoiceForm.control}
                    name='syncShippingAddress'
                    render={({ field }) => (
                      <FormItem className='border-border flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='cursor-pointer text-red-500'>
                            Default Shipping Address
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
                  >
                    Save Invoice Address
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </Collapsible>

      {/* 收货地址 */}
      <Collapsible open={consigneeOpen} onOpenChange={setConsigneeOpen}>
        <div className='border-border bg-card rounded-md border'>
          <CollapsibleTrigger className='hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-md'
                onClick={(e) => {
                  e.stopPropagation()
                  setConsigneeOpen(!consigneeOpen)
                }}
              >
                {consigneeOpen ? (
                  <ChevronUp className='text-muted-foreground h-4 w-4' />
                ) : (
                  <ChevronDown className='text-muted-foreground h-4 w-4' />
                )}
              </Button>
              <span className='text-foreground font-medium'>
                Consignee Address
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-800/60'
                  >
                    <HelpCircle className='h-3 w-3 text-orange-500 dark:text-orange-400' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  sideOffset={8}
                  className='max-w-[280px] text-left leading-snug whitespace-normal'
                >
                  Add a default shipping address so you can quickly select it
                  when creating sample or dropshipping orders.
                </TooltipContent>
              </Tooltip>
            </div>
          </CollapsibleTrigger>

          {consigneeOpen && (
            <div className='border-border border-t px-4 py-6'>
              <Form {...consigneeForm}>
                <form
                  onSubmit={consigneeForm.handleSubmit(handleConsigneeSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={consigneeForm}
                    showTaxId={true}
                    countries={countries}
                    isLoadingCountries={isLoadingCountries}
                  />

                  <Button
                    type='submit'
                    className='bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700'
                  >
                    Save Consignee Address
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  )
}
