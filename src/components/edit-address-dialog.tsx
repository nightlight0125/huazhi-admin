import { useEffect, useState } from 'react'
import countries from 'world-countries'
import { cn } from '@/lib/utils'
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
import { shippingOrigins } from '@/features/orders/data/data'

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
  address: string
  address2?: string
  city: string
  country: string
  province?: string
  postalCode: string
  phoneNumber: string
  email?: string
  shippingOrigin: string
}

interface EditAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    customerName?: string
    address?: string
    address2?: string
    city?: string
    country?: string
    province?: string
    postalCode?: string
    phoneNumber?: string
    email?: string
    shippingOrigin?: string
  }
  onConfirm: (addressData: AddressData) => void
}

export function EditAddressDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}: EditAddressDialogProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [province, setProvince] = useState('')
  const [postcode, setPostcode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [warehouse, setWarehouse] = useState('')

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && open) {
      setName(initialData.customerName || '')
      setAddress(initialData.address || '')
      setAddress2(initialData.address2 || '')
      setCity(initialData.city || '')
      // Find country value by label, or use the country string directly
      const countryValue =
        countryOptions.find((c) => c.label === initialData.country)?.value ||
        initialData.country ||
        ''
      setCountry(countryValue)
      setProvince(initialData.province || '')
      setPostcode(initialData.postalCode || '')
      setPhone(initialData.phoneNumber || '')
      setEmail(initialData.email || '')
      // Find warehouse value by label, or use the shippingOrigin string directly
      const warehouseValue =
        shippingOrigins.find((o) => o.label === initialData.shippingOrigin)
          ?.value || initialData.shippingOrigin || ''
      setWarehouse(warehouseValue)
    }
  }, [initialData, open])

  const handleConfirm = () => {
    if (
      !name.trim() ||
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
      shippingOrigins.find((o) => o.value === warehouse)?.label || warehouse

    onConfirm({
      customerName: name.trim(),
      address: address.trim(),
      address2: address2.trim() || undefined,
      city: city.trim(),
      country: countryLabel,
      province: province.trim() || undefined,
      postalCode: postcode.trim(),
      phoneNumber: phone.trim(),
      email: email.trim() || undefined,
      shippingOrigin: warehouseLabel,
    })
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (initialData) {
      setName(initialData.customerName || '')
      setAddress(initialData.address || '')
      setAddress2(initialData.address2 || '')
      setCity(initialData.city || '')
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
            <div className='space-y-2'>
              <Label htmlFor='name'>
                Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
              <Label htmlFor='city'>
                City <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='city'
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='province'>Province</Label>
              <Input
                id='province'
                value={province}
                onChange={(e) => setProvince(e.target.value)}
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
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger id='warehouse'>
                  <SelectValue placeholder='Select warehouse' />
                </SelectTrigger>
                <SelectContent>
                  {shippingOrigins.map((origin) => (
                    <SelectItem key={origin.value} value={origin.value}>
                      {origin.label}
                    </SelectItem>
                  ))}
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
              !name.trim() ||
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

