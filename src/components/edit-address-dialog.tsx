import { useEffect, useState } from 'react'
import { useCountries } from '@/hooks/use-countries'
import { useWarehouses } from '@/hooks/use-warehouses'
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
  const [postcode, setPostcode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [taxId, setTaxId] = useState('')
  const [countryId, setCountryId] = useState<number | undefined>(
    initialData?.countryId
  )

  // 使用 useWarehouses hook 获取仓库数据
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } =
    useWarehouses()
  // 使用 useCountries 从后端加载国家列表（仅在弹框打开时加载）
  const { countries: countryOptions, isLoading: isLoadingCountries } =
    useCountries(1, 1000, open)

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && open && countryOptions.length > 0) {
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
        initialData.countryId != null &&
        countryOptions.find((c) => c.value === String(initialData.countryId))
          ? String(initialData.countryId)
          : countryOptions.find((c) => c.label === initialData.country)
              ?.value ||
            initialData.country ||
            ''
      setCountry(countryValue)
      setCountryId(
        initialData.countryId ?? getCountryId(countryValue) ?? undefined
      )
      setPostcode(initialData.postalCode || '')
      setPhone(initialData.phoneNumber || '')
      setEmail(initialData.email || '')
      const warehouseValue =
        warehouseOptions.find((o) => o.label === initialData.shippingOrigin)
          ?.value ||
        initialData.shippingOrigin ||
        ''
      setWarehouse(warehouseValue)
      setTaxId(initialData.taxId || '')
    }
  }, [initialData, open, warehouseOptions, countryOptions])

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
      province: undefined,
      postalCode: postcode.trim(),
      phoneNumber: phone.trim(),
      email: email.trim() || undefined,
      shippingOrigin: warehouseLabel,
      countryId: countryId ?? getCountryId(country),
      admindivisionId: undefined,
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
        initialData.countryId != null &&
        countryOptions.find((c) => c.value === String(initialData.countryId))
          ? String(initialData.countryId)
          : countryOptions.find((c) => c.label === initialData.country)
              ?.value ||
            initialData.country ||
            ''
      setCountry(countryValue)
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
                Country / Region <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={country}
                onValueChange={(value) => {
                  setCountry(value)
                  setCountryId(getCountryId(value))
                }}
                disabled={isLoadingCountries}
              >
                <SelectTrigger id='country'>
                  <SelectValue
                    placeholder={
                      isLoadingCountries ? 'Loading...' : 'Select country'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className='flex items-center gap-2'>
                        {c.icon && <c.icon className='h-4 w-4 shrink-0' />}
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select
                value={warehouse}
                onValueChange={setWarehouse}
                disabled={isLoadingWarehouses}
              >
                <SelectTrigger id='warehouse'>
                  <SelectValue
                    placeholder={
                      isLoadingWarehouses ? 'Loading...' : 'Select warehouse'
                    }
                  />
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
                      {isLoadingWarehouses
                        ? 'Loading...'
                        : 'No warehouse available'}
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
