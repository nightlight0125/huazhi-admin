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
  type AdmindivisionItem,
  type AdmindivisionLevelItem,
} from '@/lib/api/users'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCountries } from '@/hooks/use-countries'

type CascaderOption = {
  value: string
  label: string
  icon?: (props: { className?: string }) => React.ReactElement
  number?: string
}

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
  const [divisionPath, setDivisionPath] = useState<string[]>([])
  const [province, setProvince] = useState('') // 叶节点 id，用于提交
  const [postcode, setPostcode] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [taxId, setTaxId] = useState('')
  const [countryId, setCountryId] = useState<number | undefined>(
    initialData?.countryId
  )

  const [levelsData, setLevelsData] = useState<AdmindivisionLevelItem[]>([])
  const [divisionColumns, setDivisionColumns] = useState<CascaderOption[][]>([])
  const [loadingLevelIndex, setLoadingLevelIndex] = useState<number | null>(null)
  const [regionOpen, setRegionOpen] = useState(false)
  
  // 使用 useWarehouses hook 获取仓库数据
  const { warehouses: warehouseOptions, isLoading: isLoadingWarehouses } =
    useWarehouses()
  // 使用 useCountries 从后端加载国家列表（仅在弹框打开时加载）
  const {
    countries: countryOptions,
    isLoading: isLoadingCountries,
  } = useCountries(1, 1000, open)

  const selectedCountryOption = countryOptions.find((c) => c.value === country)
  const displayRegionLabel =
    selectedCountryOption && divisionPath.length > 0
      ? `${selectedCountryOption.label} / ${divisionPath
          .map((id, i) =>
            divisionColumns[i]?.find((d) => String(d.value) === String(id))
              ?.label
          )
          .filter(Boolean)
          .join(' / ')}`
      : selectedCountryOption?.label ?? 'Select country / province / city'

  // 根据 divisionId 和 parent_id 递归构建完整路径
  const buildDivisionPath = async (
    countryIdNum: number,
    divisionId: string
  ): Promise<string[]> => {
    if (!divisionId) return []
    const levels = await queryAdmindivisionLevel(countryIdNum, 1, 100)
    for (const level of levels) {
      const divisions = await queryAdmindivision(
        countryIdNum,
        level.id,
        undefined,
        1,
        500
      )
      const found = divisions.find((d) => String(d.id) === String(divisionId))
      if (found) {
        const parentId = found.parent_id
        if (
          parentId == null ||
          parentId === '' ||
          String(parentId) === '0'
        ) {
          return [String(divisionId)]
        }
        const parentPath = await buildDivisionPath(
          countryIdNum,
          String(parentId)
        )
        return [...parentPath, String(divisionId)]
      }
    }
    return []
  }

  const loadDivision = async (
    countryIdNum: number,
    levelIndex: number,
    parentId: string | undefined,
    preservePath?: boolean,
    pathOverride?: string[],
    levelsOverride?: AdmindivisionLevelItem[]
  ) => {
    const levels = levelsOverride ?? levelsData
    if (levelIndex >= levels.length) return
    if (levelIndex === 0 && !preservePath) {
      setDivisionPath([])
      setProvince('')
    }
    setLoadingLevelIndex(levelIndex)
    setDivisionColumns((prev) => {
      const next = prev.slice(0, levelIndex)
      return [...next, [], ...Array(Math.max(0, prev.length - levelIndex - 1))]
    })
    try {
      const levelId = levels[levelIndex].id
      const rows: AdmindivisionItem[] = await queryAdmindivision(
        countryIdNum,
        levelId,
        parentId,
        1,
        500
      )
      const options: CascaderOption[] = rows.map((item) => ({
        value: item.id,
        label: item.name ?? String(item.id),
        number: item.number,
      }))
      setDivisionColumns((prev) => {
        const next = [...prev]
        next[levelIndex] = options
        return next
      })
      const path = pathOverride ?? divisionPath
      if (path.length > levelIndex + 1) {
        const nextParentId = path[levelIndex]
        void loadDivision(
          countryIdNum,
          levelIndex + 1,
          nextParentId,
          preservePath,
          pathOverride,
          levels
        )
      }
    } catch (error) {
      console.error('Failed to load divisions:', error)
    } finally {
      setLoadingLevelIndex(null)
    }
  }

  const onCountryChange = async (countryValue: string) => {
    if (!countryValue) return
    const countryIdNum = getCountryId(countryValue)
    if (!countryIdNum) return
    setDivisionColumns([])
    setDivisionPath([])
    setProvince('')
    setCountryId(countryIdNum)
    try {
      const levels = await queryAdmindivisionLevel(countryIdNum, 1, 100)
      setLevelsData(levels)
      if (levels.length > 0) {
        await loadDivision(countryIdNum, 0, undefined, false, undefined, levels)
      }
    } catch (error) {
      console.error('Failed to load division levels:', error)
    }
  }

  // Initialize form with initial data & 回填 divisionPath
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
        (initialData.countryId != null &&
          countryOptions.find((c) => c.value === String(initialData.countryId)))
          ? String(initialData.countryId)
          : countryOptions.find((c) => c.label === initialData.country)?.value ||
            initialData.country ||
            ''
      setCountry(countryValue)
      setPostcode(initialData.postalCode || '')
      setPhone(initialData.phoneNumber || '')
      setEmail(initialData.email || '')
      const warehouseValue =
        warehouseOptions.find((o) => o.label === initialData.shippingOrigin)
          ?.value || initialData.shippingOrigin || ''
      setWarehouse(warehouseValue)
      setTaxId(initialData.taxId || '')
      setCountryId(initialData.countryId)

      const divisionId = initialData.province || ''
      setProvince(divisionId)

      if (countryValue && divisionId) {
        const countryIdNum = getCountryId(countryValue) ?? initialData.countryId
        if (countryIdNum) {
          void (async () => {
            const path = await buildDivisionPath(countryIdNum, divisionId)
            const finalPath = path.length > 0 ? path : [divisionId]
            setDivisionPath(finalPath)
            const levels = await queryAdmindivisionLevel(countryIdNum, 1, 100)
            setLevelsData(levels)
            if (levels.length > 0 && finalPath.length > 0) {
              void loadDivision(countryIdNum, 0, undefined, true, finalPath, levels)
            }
          })()
        }
      } else {
        setDivisionPath([])
        if (countryValue) {
          const countryIdNum = getCountryId(countryValue) ?? initialData.countryId
          if (countryIdNum) void onCountryChange(countryValue)
        }
      }
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
      province:
        divisionColumns
          .flat()
          .find((d) => String(d.value) === String(province))?.label ||
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
      setDivisionPath([])
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
              <Popover
                open={regionOpen}
                onOpenChange={(open) => {
                  setRegionOpen(open)
                  if (
                    open &&
                    country &&
                    loadingLevelIndex === null &&
                    (divisionColumns.length === 0 ||
                      divisionColumns[0]?.length === 0)
                  ) {
                    onCountryChange(country)
                  } else if (
                    open &&
                    country &&
                    loadingLevelIndex === null &&
                    divisionPath.length > 0
                  ) {
                    const nextLevel = divisionPath.length
                    if (
                      nextLevel < levelsData.length &&
                      (!divisionColumns[nextLevel] ||
                        divisionColumns[nextLevel].length === 0)
                    ) {
                      const countryIdNum = getCountryId(country)
                      if (countryIdNum)
                        loadDivision(
                          countryIdNum,
                          nextLevel,
                          divisionPath[nextLevel - 1],
                          true,
                          divisionPath,
                          levelsData
                        )
                    }
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    className={cn(
                      'w-full justify-between font-normal',
                      !country && 'text-muted-foreground'
                    )}
                  >
                    <span className='truncate'>{displayRegionLabel}</span>
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-[720px] p-2'
                  align='start'
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className='flex gap-2'>
                    <div className='max-h-64 flex-1 overflow-y-auto border-r border-border pr-1'>
                      <div className='text-muted-foreground mb-2 text-xs font-medium'>
                        Country/Region
                      </div>
                      {isLoadingCountries ? (
                        <div className='text-muted-foreground py-2 text-xs'>
                          Loading...
                        </div>
                      ) : (
                        countryOptions.map((c) => {
                          const isActive = String(c.value) === String(country)
                          return (
                            <button
                              key={c.value}
                              type='button'
                              className={cn(
                                'hover:bg-muted flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm',
                                isActive && 'bg-muted font-medium'
                              )}
                              onClick={() => {
                                setCountry(c.value)
                                setDivisionPath([])
                                setProvince('')
                                setCountryId(getCountryId(c.value))
                                onCountryChange(c.value)
                              }}
                            >
                              <span className='flex items-center gap-2 truncate'>
                                {c.icon && <c.icon className='h-4 w-4 shrink-0' />}
                                <span>{c.label}</span>
                              </span>
                            </button>
                          )
                        })
                      )}
                    </div>
                    {Array.from(
                      { length: levelsData.length },
                      (_, levelIndex) => {
                        const column = divisionColumns[levelIndex]
                        const isLoading = loadingLevelIndex === levelIndex
                        const hasData = column && column.length > 0
                        if (!hasData && !isLoading) return null
                        const selectedId = divisionPath[levelIndex]
                        const isLastLevel =
                          levelIndex === levelsData.length - 1
                        return (
                          <div
                            key={levelIndex}
                            className={cn(
                              'max-h-64 flex-1 overflow-y-auto pl-1',
                              levelIndex < levelsData.length - 1 &&
                                'border-r border-border pr-1'
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
                                  String(opt.value) === String(selectedId)
                                return (
                                  <button
                                    key={opt.value}
                                    type='button'
                                    className={cn(
                                      'hover:bg-muted flex w-full items-center rounded px-2 py-1 text-left text-sm',
                                      isActive && 'bg-muted font-medium'
                                    )}
                                    onClick={() => {
                                      const newPath = divisionPath.slice(
                                        0,
                                        levelIndex
                                      )
                                      newPath[levelIndex] = opt.value
                                      setDivisionPath(newPath)
                                      if (isLastLevel) {
                                        setProvince(opt.value)
                                        setRegionOpen(false)
                                      } else {
                                        const countryIdNum = getCountryId(
                                          country
                                        )
                                        if (countryIdNum)
                                          loadDivision(
                                            countryIdNum,
                                            levelIndex + 1,
                                            opt.value,
                                            false,
                                            undefined,
                                            levelsData
                                          )
                                      }
                                    }}
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

