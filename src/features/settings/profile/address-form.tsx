import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getAddress,
  queryAdmindivision,
  queryAdmindivisionLevel,
  updateAddress,
  updateBillAddress,
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
import { countries } from '@/features/orders/data/data'

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
  province: z.string().optional(),
  city: z.string().min(1, 'Please enter city'),
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
  province: z.string().optional(),
  city: z.string().min(1, 'Please enter city'),
  postcode: z.string().min(1, 'Please enter postcode'),
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
  province: '',
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
  province: '',
  city: '',
  postcode: '',
}

// 地址字段组件（可复用）
function AddressFields({
  form,
  showTaxId = false,
  provinces = [],
  cities = [],
  isLoadingProvinces = false,
  isLoadingCities = false,
  onCountryChange,
  onProvinceChange,
}: {
  form: any
  showTaxId?: boolean
  provinces?: Array<{ label: string; value: string }>
  cities?: Array<{ label: string; value: string }>
  isLoadingProvinces?: boolean
  isLoadingCities?: boolean
  onCountryChange?: (countryCode: string) => void
  onProvinceChange?: (provinceId: string) => void
}) {
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

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country/Region <span className='text-red-500'>*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  onCountryChange?.(value)
                  // 重置省份和城市
                  form.setValue('province', '')
                  form.setValue('city', '')
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Please select country/region' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
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
              <FormLabel>Province</FormLabel>
              <Select
                onValueChange={(value) => {
                  const finalValue = value === 'none' ? undefined : value
                  field.onChange(finalValue)
                  onProvinceChange?.(value)
                  // 重置城市
                  form.setValue('city', '')
                }}
                value={field.value || 'none'}
                disabled={isLoadingProvinces}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Please select province' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                City <span className='text-red-500'>*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
                disabled={isLoadingCities}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Please select city' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
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
  const { auth } = useAuthStore()
  const [invoiceOpen, setInvoiceOpen] = useState(true)
  const [consigneeOpen, setConsigneeOpen] = useState(false)

  // 省份和城市状态
  const [invoiceProvinces, setInvoiceProvinces] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [invoiceCities, setInvoiceCities] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [consigneeProvinces, setConsigneeProvinces] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [consigneeCities, setConsigneeCities] = useState<
    Array<{ label: string; value: string }>
  >([])

  const [isLoadingInvoiceProvinces, setIsLoadingInvoiceProvinces] =
    useState(false)
  const [isLoadingInvoiceCities, setIsLoadingInvoiceCities] = useState(false)
  const [isLoadingConsigneeProvinces, setIsLoadingConsigneeProvinces] =
    useState(false)
  const [isLoadingConsigneeCities, setIsLoadingConsigneeCities] =
    useState(false)

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

  // 根据国家代码获取国家 ID（这里需要根据实际情况映射，暂时使用固定值）
  const getCountryId = (countryCode: string): number => {
    // 根据国家代码查找对应的 ID，这里需要根据实际 API 返回的数据来映射
    // 暂时返回固定值，实际应该从 countries 数据中获取
    // 这里假设中国的 ID 是 1000001，实际应该从 API 或配置中获取
    if (countryCode === 'CN') return 1000001
    // 默认返回中国的 ID
    return 1000001
  }

  // 根据国家 number 获取国家 code（反向映射）
  const getCountryCodeFromNumber = (countryNumber: string | number): string => {
    // 根据国家 number 查找对应的 code
    // "001" 对应中国 "CN"
    const numberStr = String(countryNumber)
    if (numberStr === '001') return 'CN'
    // 默认返回中国
    return 'CN'
  }

  // 加载省份
  const loadProvinces = async (countryCode: string, isInvoice: boolean) => {
    const countryId = getCountryId(countryCode)
    if (!countryId) return

    if (isInvoice) {
      setIsLoadingInvoiceProvinces(true)
    } else {
      setIsLoadingConsigneeProvinces(true)
    }

    try {
      const levels = await queryAdmindivisionLevel(countryId)
      // 找到 level 为 1 的（省）
      const provinceLevel = levels.find((level) => level.level === 1)
      if (provinceLevel) {
        const divisions = await queryAdmindivision(
          countryId,
          provinceLevel.id,
          undefined // parent_id 先写死为 undefined
        )
        const provinceOptions = divisions.map((div) => ({
          label: div.name,
          value: div.id,
        }))
        if (isInvoice) {
          setInvoiceProvinces(provinceOptions)
        } else {
          setConsigneeProvinces(provinceOptions)
        }
      }
    } catch (error) {
      console.error('Failed to load provinces:', error)
      toast.error('Failed to load provinces')
    } finally {
      if (isInvoice) {
        setIsLoadingInvoiceProvinces(false)
      } else {
        setIsLoadingConsigneeProvinces(false)
      }
    }
  }

  // 加载城市
  const loadCities = async (
    countryCode: string,
    provinceId: string,
    isInvoice: boolean
  ) => {
    const countryId = getCountryId(countryCode)
    if (!countryId || !provinceId) return

    if (isInvoice) {
      setIsLoadingInvoiceCities(true)
    } else {
      setIsLoadingConsigneeCities(true)
    }

    try {
      const levels = await queryAdmindivisionLevel(countryId)
      // 找到 level 为 2 的（市）
      const cityLevel = levels.find((level) => level.level === 2)
      if (cityLevel) {
        const divisions = await queryAdmindivision(
          countryId,
          cityLevel.id,
          provinceId // parent_id 是省份的 id
        )
        const cityOptions = divisions.map((div) => ({
          label: div.name,
          value: div.id,
        }))
        if (isInvoice) {
          setInvoiceCities(cityOptions)
        } else {
          setConsigneeCities(cityOptions)
        }
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
      toast.error('Failed to load cities')
    } finally {
      if (isInvoice) {
        setIsLoadingInvoiceCities(false)
      } else {
        setIsLoadingConsigneeCities(false)
      }
    }
  }

  // 加载地址数据
  useEffect(() => {
    const loadAddressData = async () => {
      const userId = auth.user?.id
      if (!userId) {
        console.log('没有用户 ID，跳过加载地址数据')
        return
      }

      console.log('开始加载地址数据，userId:', userId)

      try {
        const addressData = await getAddress(userId)
        console.log('获取到的地址数据:', addressData)
        console.log('地址数据类型:', typeof addressData)
        console.log('地址数据是否为 null:', addressData === null)

        if (!addressData) {
          console.warn('未获取到地址数据，addressData 为 null 或 undefined')
          toast.warning('No address data found')
          return
        }

        console.log('准备回填数据，addressData 字段:', Object.keys(addressData))
        console.log(
          'addressData 完整内容:',
          JSON.stringify(addressData, null, 2)
        )

        // 将国家 number 转换为 country code
        const invoiceCountryCode = addressData.hzkj_country2_number
          ? getCountryCodeFromNumber(addressData.hzkj_country2_number)
          : ''
        const consigneeCountryCode = addressData.hzkj_country_number
          ? getCountryCodeFromNumber(addressData.hzkj_country_number)
          : ''

        console.log('账单地址国家 code:', invoiceCountryCode)
        console.log('收货地址国家 code:', consigneeCountryCode)

        // 先加载省份和城市列表，然后再回填
        // 如果有国家数据，加载对应的省份
        if (invoiceCountryCode) {
          await loadProvinces(invoiceCountryCode, true)
        }
        if (consigneeCountryCode) {
          await loadProvinces(consigneeCountryCode, false)
        }

        // 存储加载的城市列表和省份列表
        let loadedInvoiceCities: Array<{ label: string; value: string }> = []
        let loadedConsigneeCities: Array<{ label: string; value: string }> = []
        let loadedInvoiceProvinces: Array<{ label: string; value: string }> = []
        let loadedConsigneeProvinces: Array<{
          label: string
          value: string
        }> = []

        // 获取已加载的省份列表
        if (invoiceCountryCode) {
          const countryId = getCountryId(invoiceCountryCode)
          const levels = await queryAdmindivisionLevel(countryId)
          const provinceLevel = levels.find((level) => level.level === 1)
          if (provinceLevel) {
            const divisions = await queryAdmindivision(
              countryId,
              provinceLevel.id,
              undefined
            )
            loadedInvoiceProvinces = divisions.map((div) => ({
              label: div.name,
              value: div.id,
            }))
            setInvoiceProvinces(loadedInvoiceProvinces)
          }
        }
        if (consigneeCountryCode) {
          const countryId = getCountryId(consigneeCountryCode)
          const levels = await queryAdmindivisionLevel(countryId)
          const provinceLevel = levels.find((level) => level.level === 1)
          if (provinceLevel) {
            const divisions = await queryAdmindivision(
              countryId,
              provinceLevel.id,
              undefined
            )
            loadedConsigneeProvinces = divisions.map((div) => ({
              label: div.name,
              value: div.id,
            }))
            setConsigneeProvinces(loadedConsigneeProvinces)
          }
        }

        // 根据省份 number 或 ID 找到对应的 province ID
        // 优先使用 hzkj_admindivision2_id，如果没有则尝试根据 number 查找
        let invoiceProvinceId = ''
        if (addressData.hzkj_admindivision2_id) {
          invoiceProvinceId = String(addressData.hzkj_admindivision2_id)
        } else if (addressData.hzkj_admindivision2_number) {
          // 尝试在已加载的省份列表中查找匹配的 ID
          // 注意：这里可能需要根据实际情况调整匹配逻辑
          const provinceNumber = String(addressData.hzkj_admindivision2_number)
          // 如果 number 就是 ID，直接使用
          invoiceProvinceId = provinceNumber
        }

        let consigneeProvinceId = ''
        if (addressData.hzkj_admindivision_id) {
          consigneeProvinceId = String(addressData.hzkj_admindivision_id)
        } else if (addressData.hzkj_admindivision_number) {
          const provinceNumber = String(addressData.hzkj_admindivision_number)
          consigneeProvinceId = provinceNumber
        }

        console.log('账单地址省份 ID:', invoiceProvinceId)
        console.log('收货地址省份 ID:', consigneeProvinceId)

        // 如果有省份数据，加载对应的城市
        if (invoiceCountryCode && invoiceProvinceId) {
          const countryId = getCountryId(invoiceCountryCode)
          const levels = await queryAdmindivisionLevel(countryId)
          const cityLevel = levels.find((level) => level.level === 2)
          if (cityLevel) {
            const divisions = await queryAdmindivision(
              countryId,
              cityLevel.id,
              invoiceProvinceId
            )
            loadedInvoiceCities = divisions.map((div) => ({
              label: div.name,
              value: div.id,
            }))
            setInvoiceCities(loadedInvoiceCities)
          }
        }
        if (consigneeCountryCode && consigneeProvinceId) {
          const countryId = getCountryId(consigneeCountryCode)
          const levels = await queryAdmindivisionLevel(countryId)
          const cityLevel = levels.find((level) => level.level === 2)
          if (cityLevel) {
            const divisions = await queryAdmindivision(
              countryId,
              cityLevel.id,
              consigneeProvinceId
            )
            loadedConsigneeCities = divisions.map((div) => ({
              label: div.name,
              value: div.id,
            }))
            setConsigneeCities(loadedConsigneeCities)
          }
        }

        // 根据城市名称找到对应的 city ID
        const invoiceCityId = addressData.hzkj_bill_city
          ? loadedInvoiceCities.find(
              (city) => city.label === addressData.hzkj_bill_city
            )?.value || ''
          : ''

        const consigneeCityId = addressData.hzkj_city
          ? loadedConsigneeCities.find(
              (city) => city.label === addressData.hzkj_city
            )?.value || ''
          : ''

        console.log('账单地址城市 ID:', invoiceCityId)
        console.log('收货地址城市 ID:', consigneeCityId)

        // 回填账单地址
        const invoiceFormData = {
          firstName: addressData.hzkj_customer_first_name2 || '',
          lastName: addressData.hzkj_customer_last_name2 || '',
          phoneNumber: addressData.hzkj_phone_number || '',
          email: addressData.hzkj_emailfield || '',
          address1: addressData.hzkj_bill_adress || '',
          address2: addressData.hzkj_bill_adress2 || '',
          city: invoiceCityId || addressData.hzkj_bill_city || '',
          postcode: addressData.hzkj_textfield3 || '',
          taxId: addressData.hzkj_tax_id2 || '',
          country: invoiceCountryCode,
          province: invoiceProvinceId,
          syncShippingAddress: addressData.hzkj_synchronize_adress || false,
        }
        console.log('回填账单地址数据:', invoiceFormData)

        // 直接重置表单
        invoiceForm.reset(invoiceFormData)
        console.log('账单地址表单已重置，当前表单值:', invoiceForm.getValues())

        // 回填收货地址
        const consigneeFormData = {
          firstName: addressData.hzkj_customer_first_name || '',
          lastName: addressData.hzkj_customer_last_name || '',
          phoneNumber: addressData.hzkj_phone || '',
          email: addressData.hzkj_adress_emailfield || '',
          address1: addressData.hzkj_textfield || '',
          address2: addressData.hzkj_address2 || '',
          city: consigneeCityId || addressData.hzkj_city || '',
          postcode: addressData.hzkj_textfield1 || '',
          country: consigneeCountryCode,
          province: consigneeProvinceId,
        }
        console.log('回填收货地址数据:', consigneeFormData)

        consigneeForm.reset(consigneeFormData)
        console.log(
          '收货地址表单已重置，当前表单值:',
          consigneeForm.getValues()
        )

        toast.success('Address data loaded successfully')
      } catch (error) {
        console.error('Failed to load address data:', error)
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load address data. Please try again.'
        )
      }
    }

    void loadAddressData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id])

  const handleInvoiceSubmit = async (data: InvoiceAddressValues) => {
    try {
      const userId = auth.user?.id
      if (!userId) {
        toast.error('User not authenticated. Please login again.')
        return
      }

      // 根据 city ID 找到城市名称
      const selectedCity = invoiceCities.find(
        (city) => city.value === data.city
      )
      const cityName = selectedCity?.label || data.city

      // 根据 country code 获取 country ID
      const countryId = getCountryId(data.country)

      const loadingToast = toast.loading('Updating billing address...')

      await updateBillAddress({
        id: userId,
        hzkj_customer_first_name2: data.firstName,
        hzkj_customer_last_name2: data.lastName,
        hzkj_phone_number: data.phoneNumber,
        hzkj_emailfield: data.email || '',
        hzkj_bill_city: cityName,
        hzkj_bill_adress: data.address1,
        hzkj_bill_adress2: data.address2 || '',
        hzkj_textfield3: data.postcode,
        hzkj_tax_id2: data.taxId || '',
        hzkj_country2_id: countryId,
        hzkj_admindivision2_id: data.province
          ? Number(data.province)
          : undefined,
      })

      toast.dismiss(loadingToast)
      toast.success('Billing address updated successfully!')

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
          province: data.province,
          city: data.city,
          postcode: data.postcode,
        })
      }
    } catch (error) {
      console.error('Failed to update billing address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update billing address. Please try again.'
      )
    }
  }

  const handleConsigneeSubmit = async (data: ConsigneeAddressValues) => {
    try {
      const userId = auth.user?.id
      if (!userId) {
        toast.error('User not authenticated. Please login again.')
        return
      }

      // 根据 city ID 找到城市名称
      const selectedCity = consigneeCities.find(
        (city) => city.value === data.city
      )
      const cityName = selectedCity?.label || data.city

      // 根据 country code 获取 country ID
      const countryId = getCountryId(data.country)

      const loadingToast = toast.loading('Updating shipping address...')

      await updateAddress({
        id: userId,
        hzkj_customer_first_name: data.firstName,
        hzkj_customer_last_name: data.lastName,
        hzkj_phone: data.phoneNumber,
        hzkj_adress_emailfield: data.email || '',
        hzkj_city: cityName,
        hzkj_textfield: data.address1,
        hzkj_address2: data.address2 || '',
        hzkj_textfield1: data.postcode,
        hzkj_tax_id1: '',
        hzkj_country_id: countryId,
        hzkj_admindivision_id: data.province
          ? Number(data.province)
          : undefined,
      })

      toast.dismiss(loadingToast)
      toast.success('Shipping address updated successfully!')
    } catch (error) {
      console.error('Failed to update shipping address:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update shipping address. Please try again.'
      )
    }
  }

  return (
    <div className='min-h-0 space-y-4'>
      {/* 账单地址 */}
      <Collapsible open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <div className='rounded-md border bg-white'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50'>
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
                  <ChevronUp className='h-4 w-4 text-gray-600' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-gray-600' />
                )}
              </Button>
              <span className='font-medium text-gray-900'>Invoice Address</span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200'
              >
                <HelpCircle className='h-3 w-3 text-orange-500' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {invoiceOpen && (
            <div className='border-t px-4 py-6'>
              <Form {...invoiceForm}>
                <form
                  onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={invoiceForm}
                    showTaxId={true}
                    provinces={invoiceProvinces}
                    cities={invoiceCities}
                    isLoadingProvinces={isLoadingInvoiceProvinces}
                    isLoadingCities={isLoadingInvoiceCities}
                    onCountryChange={(countryCode) =>
                      loadProvinces(countryCode, true)
                    }
                    onProvinceChange={(provinceId) => {
                      const countryCode = invoiceForm.getValues('country')
                      if (countryCode) {
                        loadCities(countryCode, provinceId, true)
                      }
                    }}
                  />

                  <FormField
                    control={invoiceForm.control}
                    name='syncShippingAddress'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
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
                    className='bg-orange-500 text-white hover:bg-orange-600'
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
        <div className='rounded-md border bg-white'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50'>
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
                  <ChevronUp className='h-4 w-4 text-gray-600' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-gray-600' />
                )}
              </Button>
              <span className='font-medium text-gray-900'>
                Consignee Address
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200'
              >
                <HelpCircle className='h-3 w-3 text-orange-500' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {consigneeOpen && (
            <div className='border-t px-4 py-6'>
              <Form {...consigneeForm}>
                <form
                  onSubmit={consigneeForm.handleSubmit(handleConsigneeSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={consigneeForm}
                    showTaxId={false}
                    provinces={consigneeProvinces}
                    cities={consigneeCities}
                    isLoadingProvinces={isLoadingConsigneeProvinces}
                    isLoadingCities={isLoadingConsigneeCities}
                    onCountryChange={(countryCode) =>
                      loadProvinces(countryCode, false)
                    }
                    onProvinceChange={(provinceId) => {
                      const countryCode = consigneeForm.getValues('country')
                      if (countryCode) {
                        loadCities(countryCode, provinceId, false)
                      }
                    }}
                  />

                  <Button
                    type='submit'
                    className='bg-orange-500 text-white hover:bg-orange-600'
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
