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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useWarehouses } from '@/hooks/use-warehouses'
import {
  queryAdmindivision,
  queryAdmindivisionLevel,
} from '@/lib/api/users'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useCountries } from '@/hooks/use-countries'

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
    countryId?: number
  }
  onConfirm: (addressData: AddressData) => void
}

// ---- Region data helpers (shared logic with address-form) ----

// 根据选择的国家 value（来自 queryCountry 的 id 字段）返回数值型 countryId
const getCountryId = (countryIdFromSelect: string): number | undefined => {
  const num = Number(countryIdFromSelect)
  if (Number.isNaN(num)) return undefined
  return num
}

// 根据 division id 查找其所属的 level id
async function findLevelIdForDivision(
  countryId: number,
  divisionId: string
): Promise<string> {
  const levelsData = await queryAdmindivisionLevel(countryId, 1, 100)
  for (const level of levelsData) {
    const divs = await queryAdmindivision(
      countryId,
      level.id,
      undefined,
      1,
      500
    )
    if (divs.some((d) => String(d.id) === String(divisionId))) {
      return level.id
    }
  }
  return ''
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
  const [provinceLevel, setProvinceLevel] = useState('')
  const [province, setProvince] = useState('')
  const [postcode, setPostcode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [taxId, setTaxId] = useState('')
  const [countryId, setCountryId] = useState<number | undefined>(
    initialData?.countryId
  )

  // 第二级：levels（省/市等）；第三级：divisions（行政区如广西）
  const [levels, setLevels] = useState<Array<{ label: string; value: string }>>(
    []
  )
  const [divisions, setDivisions] = useState<
    Array<{ label: string; value: string; number?: string }>
  >([])
  
  // 使用 useWarehouses hook 获取仓库数据
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } = useWarehouses()
  // 使用 useCountries 从后端加载国家列表（仅在弹框打开时加载）
  const { countries: countryOptions } = useCountries(1, 1000, open)

  // 供级联展示使用的名称（国家 / 级别 / 行政区）。城市由下面的输入框单独维护。
  const selectedCountryOption = countryOptions.find((c) => c.value === country)
  const selectedLevelOption = levels.find((l) => l.value === provinceLevel)
  const selectedDivisionOption = divisions.find((d) => d.value === province)

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
      setCity(initialData.city || '')
      // 优先使用 countryId（后端 hzkj_country_id），其次按 label 匹配，最后用 country 原值
      const countryValue =
        (initialData.countryId != null &&
          countryOptions.find((c) => c.value === String(initialData.countryId)))
          ? String(initialData.countryId)
          : countryOptions.find((c) => c.label === initialData.country)?.value ||
            initialData.country ||
            ''
      setCountry(countryValue)
      setProvinceLevel('')
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
      // 初始国家 ID：来自父级 initialData，如果没有则保持 undefined
      setCountryId(initialData.countryId)
    }
  }, [initialData, open, warehouseOptions, countryOptions])

  // 加载第二级：levels（省/市等）
  useEffect(() => {
    const loadLevels = async () => {
      if (!country) {
        setLevels([])
        setDivisions([])
        setProvinceLevel('')
        setProvince('')
        return
      }

      const countryId = getCountryId(country)
      if (!countryId) return

      try {
        const levelsData = await queryAdmindivisionLevel(countryId, 1, 100)
        const opts = levelsData.map((l) => ({
          label: l.name ?? String(l.id),
          value: l.id,
        }))
        setLevels(opts)
        setDivisions([])
        setProvinceLevel('')
        setProvince('')

        // 如有初始 division id，解析其 level 并回填
        if (initialData?.province) {
          const divId = initialData.province
          const levelId = await findLevelIdForDivision(countryId, divId)
          if (levelId) {
            setProvinceLevel(levelId)
            setProvince(divId)
          }
        }
      } catch (error) {
        console.error('Failed to load levels in edit-address-dialog:', error)
      }
    }

    if (open) void loadLevels()
  }, [country, open])

  // 加载第三级：divisions（行政区）
  useEffect(() => {
    const loadDivisions = async () => {
      if (!country || !provinceLevel) {
        setDivisions([])
        return
      }

      const countryId = getCountryId(country)
      if (!countryId) return

      try {
        const rows = await queryAdmindivision(
          countryId,
          provinceLevel,
          undefined,
          1,
          500
        )
        const opts = rows.map((d) => ({
          label: d.name,
          value: String(d.id),
          number: d.number,
        }))
        setDivisions(opts)

        if (initialData?.province && !opts.find((o) => o.value === province)) {
          const matched = opts.find(
            (o) =>
              o.value === initialData.province ||
              o.label === initialData.province ||
              o.number === initialData.province
          )
          if (matched) setProvince(matched.value)
        }
      } catch (error) {
        console.error('Failed to load divisions in edit-address-dialog:', error)
      }
    }

    if (open) void loadDivisions()
  }, [country, provinceLevel, open, initialData?.province])

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
      city: city.trim(),
      country: countryLabel,
      province:
        divisions.find((d) => d.value === province)?.label ||
        province.trim() ||
        undefined,
      postalCode: postcode.trim(),
      phoneNumber: phone.trim(),
      email: email.trim() || undefined,
      shippingOrigin: warehouseLabel,
      countryId: countryId ?? getCountryId(country),
      admindivisionId: province || undefined,
      cityId: undefined,
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
      setCity(initialData.city || '')
      const countryValue =
        (initialData.countryId != null &&
          countryOptions.find((c) => c.value === String(initialData.countryId)))
          ? String(initialData.countryId)
          : countryOptions.find((c) => c.label === initialData.country)?.value ||
            initialData.country ||
            ''
      setCountry(countryValue)
      setProvinceLevel('')
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
                Country / Province <span className='text-red-500'>*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className={cn(
                      'w-full justify-between',
                      !country &&
                        !provinceLevel &&
                        !province &&
                        'text-muted-foreground'
                    )}
                  >
                    <span className='truncate'>
                      {selectedCountryOption &&
                      selectedLevelOption &&
                      selectedDivisionOption
                        ? `${selectedCountryOption.label} / ${selectedLevelOption.label} / ${selectedDivisionOption.label}`
                        : selectedCountryOption && selectedLevelOption
                          ? `${selectedCountryOption.label} / ${selectedLevelOption.label}`
                          : selectedCountryOption
                            ? selectedCountryOption.label
                            : 'Select country / province / city'}
                    </span>
                    <span className='ml-2 text-xs text-muted-foreground'>▼</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[720px] p-2' align='start'>
                  <div className='flex gap-2'>
                    {/* Country 列 */}
                    <div className='flex-1 max-h-64 overflow-y-auto border-r pr-1'>
                      <div className='mb-2 text-xs font-medium text-muted-foreground'>
                        Country/Region
                      </div>
                      {countryOptions.map((c) => {
                        const isActive = c.value === country
                        return (
                          <button
                            key={c.value}
                            type='button'
                            className={cn(
                              'flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-muted',
                              isActive && 'bg-muted font-medium'
                            )}
                            onClick={() => {
                              setCountry(c.value)
                              setProvinceLevel('')
                              setProvince('')
                              setCountryId(getCountryId(c.value))
                            }}
                          >
                            <span className='flex items-center gap-2 truncate'>
                              {c.icon && <c.icon className='h-4 w-4' />}
                              <span>{c.label}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Level 列：省/市等级别 */}
                    {levels.length > 0 && (
                      <div className='flex-1 max-h-64 overflow-y-auto border-r px-1'>
                        <div className='mb-2 text-xs font-medium text-muted-foreground'>
                          Province
                        </div>
                        {levels.map((l) => {
                          const isActive = l.value === provinceLevel
                          return (
                            <button
                              key={l.value}
                              type='button'
                              className={cn(
                                'flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-muted',
                                isActive && 'bg-muted font-medium'
                              )}
                              onClick={() => {
                                setProvinceLevel(l.value)
                                setProvince('')
                              }}
                            >
                              <span className='truncate'>{l.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Division 列：行政区 */}
                    {divisions.length > 0 && (
                      <div className='flex-1 max-h-64 overflow-y-auto pl-1'>
                        <div className='mb-2 text-xs font-medium text-muted-foreground'>
                          Region
                        </div>
                        {divisions.map((d) => {
                          const isActive = d.value === province
                          return (
                            <button
                              key={d.value}
                              type='button'
                              className={cn(
                                'flex w-full items-center rounded px-2 py-1 text-left text-sm hover:bg-muted',
                                isActive && 'bg-muted font-medium'
                              )}
                              onClick={() => setProvince(d.value)}
                            >
                              <span className='truncate'>{d.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='city'>
                City <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='city'
                placeholder='Please enter city'
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
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

