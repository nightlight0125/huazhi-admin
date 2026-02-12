import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWarehouses } from '@/hooks/use-warehouses'
import {
  queryAdmindivision,
  queryAdmindivisionLevel,
  type AdmindivisionItem,
  type AdmindivisionLevelItem,
} from '@/lib/api/users'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import countries from 'world-countries'

type CountryOption = {
  value: string
  label: string
  flagClass: string
}

const countryOptions: CountryOption[] = countries.map((country) => {
  const code = country.cca2.toLowerCase()
  const flagClass = `fi fi-${code}`

  return {
    value: country.cca2,
    label: country.name.common,
    flagClass,
  }
})

export interface AddressData {
  customerName: string
  firstName?: string
  lastName?: string
  address: string
  address2?: string
  city: string
  country: string
  province?: string
  postalCode: string
  phoneNumber: string
  email?: string
  shippingOrigin: string
  // 下面这些是为了调用更新订单接口时使用的原始 ID 信息
  countryId?: number
  admindivisionId?: string
  cityId?: string
  warehouseId?: string
  taxId?: string
}

interface EditAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    customerName?: string
    firstName?: string
    lastName?: string
    address?: string
    address2?: string
    city?: string
    country?: string
    province?: string
    postalCode?: string
    phoneNumber?: string
    email?: string
    shippingOrigin?: string
    taxId?: string
  }
  onConfirm: (addressData: AddressData) => void
}

// ---- Region data helpers (shared logic with address-form) ----

// 缓存 levels 数据，避免重复请求
const levelsCache = new Map<number, AdmindivisionLevelItem[]>()

// 根据国家代码获取国家 ID（与 address-form 中保持一致的占位实现）
const getCountryId = (countryCode: string): number | undefined => {
  if (countryCode === 'CN') return 1000001
  // 其他国家暂时也返回中国的 ID，占位实现，后续可按实际映射扩展
  return 1000001
}

// 获取或缓存 levels
const getLevels = async (countryId: number): Promise<AdmindivisionLevelItem[]> => {
  if (levelsCache.has(countryId)) {
    return levelsCache.get(countryId)!
  }
  const levels = await queryAdmindivisionLevel(countryId)
  levelsCache.set(countryId, levels)
  return levels
}

export function EditAddressDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}: EditAddressDialogProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [province, setProvince] = useState('')
  const [postcode, setPostcode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [taxId, setTaxId] = useState('')

  // 省份 / 城市下拉数据
  const [provinces, setProvinces] = useState<
    Array<{ label: string; value: string; number?: string }>
  >([])
  const [cities, setCities] = useState<Array<{ label: string; value: string }>>(
    []
  )
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  
  // 使用 useWarehouses hook 获取仓库数据
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } = useWarehouses()

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && open) {
      const fullName = initialData.customerName || ''
      const [splitFirst = '', ...splitRest] = fullName.split(' ')

      // 优先使用后端返回的 first / last name 字段，其次再从 customerName 拆分
      const initFirst = initialData.firstName ?? splitFirst
      const initLast = initialData.lastName ?? splitRest.join(' ')

      setFirstName(initFirst)
      setLastName(initLast)
      setAddress(initialData.address || '')
      setAddress2(initialData.address2 || '')
      // city 不直接写入 state，先保存为初始值，等城市下拉加载完后再匹配并选中
      // Find country value by label, or use the country string directly
      const countryValue =
        countryOptions.find((c) => c.label === initialData.country)?.value ||
        initialData.country ||
        ''
      setCountry(countryValue)
      // 省份：initialData.province 现在优先是 hzkj_admindivision_id，对应下拉的 value
      setProvince(initialData.province || '')
      setPostcode(initialData.postalCode || '')
      setPhone(initialData.phoneNumber || '')
      setEmail(initialData.email || '')
      // Find warehouse value by label, or use the shippingOrigin string directly
      const warehouseValue =
        warehouseOptions.find((o) => o.label === initialData.shippingOrigin)
          ?.value || initialData.shippingOrigin || ''
      setWarehouse(warehouseValue)
      // 税号：直接从 initialData.taxId 回填
      setTaxId(initialData.taxId || '')
    }
  }, [initialData, open, warehouseOptions])

  // 加载省份列表
  useEffect(() => {
    const loadProvinces = async () => {
      if (!country) {
        setProvinces([])
        setProvince('')
        return
      }

      const countryId = getCountryId(country)
      if (!countryId) return

      setIsLoadingProvinces(true)
      try {
        const levels = await getLevels(countryId)
        const provinceLevel = levels.find((level) => level.level === 1)
        if (!provinceLevel) {
          setProvinces([])
          return
        }

        const divisions: AdmindivisionItem[] = await queryAdmindivision(
          countryId,
          provinceLevel.id,
          undefined
        )
        const options = divisions.map((div) => ({
          label: div.name,
          value: String(div.id),
          number: div.number,
        }))
        setProvinces(options)

        // 如果有初始省份信息且当前还未选择 province，则尝试匹配
        if (initialData?.province && !province) {
          const matched = options.find(
            (opt) =>
              opt.value === initialData.province ||
              opt.label === initialData.province ||
              opt.number === initialData.province
          )
          if (matched) {
            setProvince(matched.value)
          }
        }
      } catch (error) {
        console.error('Failed to load provinces in edit-address-dialog:', error)
      } finally {
        setIsLoadingProvinces(false)
      }
    }

    if (open) {
      void loadProvinces()
    }
  }, [country, open, initialData?.province, province])

  // 加载城市列表
  useEffect(() => {
    const loadCities = async () => {
      if (!country || !province) {
        setCities([])
        setCity('')
        return
      }

      const countryId = getCountryId(country)
      if (!countryId) return

      setIsLoadingCities(true)
      try {
        const levels = await getLevels(countryId)
        const cityLevel = levels.find((level) => level.level === 2)
        if (!cityLevel) {
          setCities([])
          return
        }

        const divisions: AdmindivisionItem[] = await queryAdmindivision(
          countryId,
          cityLevel.id,
          province
        )
        const options = divisions.map((div) => ({
          label: div.name,
          value: String(div.id),
        }))
        setCities(options)

        // 如果有初始城市名称且当前还未选择 city，则尝试匹配
        if (initialData?.city && !city) {
          const matched = options.find((opt) => opt.label === initialData.city)
          if (matched) {
            setCity(matched.value)
          }
        }
      } catch (error) {
        console.error('Failed to load cities in edit-address-dialog:', error)
      } finally {
        setIsLoadingCities(false)
      }
    }

    if (open) {
      void loadCities()
    }
  }, [country, province, open, initialData?.city, city])

  const handleConfirm = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !address.trim() ||
      !city.trim() ||
      !country ||
      !postcode.trim() ||
      !phone.trim() ||
      !warehouse
    ) {
      return
    }

    // Convert value back to label for country and warehouse
    const countryLabel =
      countryOptions.find((c) => c.value === country)?.label || country
    const warehouseLabel =
      warehouseOptions.find((o) => o.value === warehouse)?.label || warehouse

    onConfirm({
      customerName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      address2: address2.trim() || undefined,
      city: (cities.find((c) => c.value === city)?.label || city || '').trim(),
      country: countryLabel,
      province:
        provinces.find((p) => p.value === province)?.label ||
        province.trim() ||
        undefined,
      postalCode: postcode.trim(),
      phoneNumber: phone.trim(),
      email: email.trim() || undefined,
      shippingOrigin: warehouseLabel,
      countryId: getCountryId(country),
      admindivisionId: province || undefined,
      cityId: city || undefined,
      warehouseId: warehouse || undefined,
      taxId: taxId.trim() || undefined,
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (initialData) {
      const fullName = initialData.customerName || ''
      const [splitFirst = '', ...splitRest] = fullName.split(' ')

      const initFirst = initialData.firstName ?? splitFirst
      const initLast = initialData.lastName ?? splitRest.join(' ')

      setFirstName(initFirst)
      setLastName(initLast)
      setAddress(initialData.address || '')
      setAddress2(initialData.address2 || '')
      // city / province 会在加载完选项后根据初始 label / id 回填，这里不直接设置 city
      const countryValue =
        countryOptions.find((c) => c.label === initialData.country)?.value ||
        initialData.country ||
        ''
      setCountry(countryValue)
      setProvince(initialData.province || '')
      setPostcode(initialData.postalCode || '')
      setPhone(initialData.phoneNumber || '')
      setEmail(initialData.email || '')
      setWarehouse(initialData.shippingOrigin || '')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Update Address</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto py-4'>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>
                  First Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='firstName'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>
                  Last Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='lastName'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>
                Address <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address2'>Address2</Label>
              <Input
                id='address2'
                placeholder='Please enter the address2.'
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>

            
          

            <div className='space-y-2'>
              <Label htmlFor='country'>
                Country <span className='text-red-500'>*</span>
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id='country'>
                  <SelectValue placeholder='Select country' />
                </SelectTrigger>
                <SelectContent>
                {countryOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span
                      className={cn(c.flagClass, 'mr-2')}
                      aria-hidden='true'
                    />
                    {c.label}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='province'>Province</Label>
              <Select
                value={province}
                onValueChange={(value) => {
                  setProvince(value)
                  // 切换省份时清空城市
                  setCity('')
                }}
                disabled={isLoadingProvinces || !country}
              >
                <SelectTrigger id='province'>
                  <SelectValue placeholder='Please select province' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {provinces.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='city'>
                City <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={city}
                onValueChange={setCity}
                disabled={isLoadingCities || !province}
              >
                <SelectTrigger id='city'>
                  <SelectValue placeholder='Please select city' />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='postcode'>
                Postcode <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='postcode'
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='taxId'>
                Tax ID <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='taxId'
                placeholder='Please enter the tax id.'
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>



            <div className='space-y-2'>
              <Label htmlFor='phone'>
                Phone <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='phone'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Please enter the email.'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='warehouse'>
                Warehouse <span className='text-red-500'>*</span>
              </Label>
              <Select value={warehouse} onValueChange={setWarehouse} disabled={isLoadingWarehouses}>
                <SelectTrigger id='warehouse'>
                  <SelectValue placeholder={isLoadingWarehouses ? 'Loading...' : 'Select warehouse'} />
                </SelectTrigger>
                <SelectContent>
                  {warehouseOptions.length > 0 ? (
                    warehouseOptions.map((origin) => (
                      <SelectItem key={origin.value} value={origin.value}>
                        {origin.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value='__no_warehouse__' disabled>
                      {isLoadingWarehouses ? 'Loading...' : 'No warehouse available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={
              !firstName.trim() ||
              !lastName.trim() ||
              !address.trim() ||
              !city.trim() ||
              !country ||
              !postcode.trim() ||
              !phone.trim() ||
              !warehouse
            }
            className='bg-orange-500 text-white hover:bg-orange-600'
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

