import React, { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import worldCountries from 'world-countries'
import { ChevronDown, ChevronUp, HelpCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import {
  getAddress,
  queryAdmindivision,
  queryAdmindivisionLevel,
  updateAddress,
  updateBillAddress,
  type AdmindivisionItem,
  type AdmindivisionLevelItem,
} from '@/lib/api/users'
import { cn } from '@/lib/utils'
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
  province: z.string().optional(),
  provinceLevel: z.string().optional(),
  divisionPath: z.array(z.string()).optional(),
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
  province: '',
  provinceLevel: '',
  divisionPath: [],
  city: '',
  postcode: '',
}

// 级联选项类型：value=id, label 根据级别不同（国家用 description，省/市用 name），icon 用于国家国旗
type CascaderOption = {
  value: string
  label: string
  icon?: (props: { className?: string }) => React.ReactElement
  number?: string
}

// 创建国旗图标组件（与 useCountries 一致）
const createFlagIcon = (countryCode: string) => {
  const FlagIcon = ({ className }: { className?: string }) => {
    const code = countryCode.toLowerCase()
    return <span className={`fi fi-${code} ${className || ''}`} />
  }
  return FlagIcon
}

// 地址字段组件（级数由 queryAdmindivisionLevel 动态决定，不写死）
function AddressFields(props: {
  form: any
  showTaxId?: boolean
  countries: CascaderOption[]
  divisionColumns: CascaderOption[][] // 每级一列，[0]=第一级省/州...[1]=第二级...
  levelCount: number // 当前国家的级次数
  isLoadingCountries?: boolean
  loadingLevelIndex?: number | null // 正在加载的级次索引
  onCountryChange?: (countryId: string) => void
  onDivisionSelect?: (levelIndex: number, divisionId: string) => void
}) {
  const {
    form,
    showTaxId = false,
    countries,
    divisionColumns,
    levelCount,
    isLoadingCountries = false,
    loadingLevelIndex = null,
    onCountryChange,
    onDivisionSelect,
  } = props

  const [regionOpen, setRegionOpen] = useState(false)

  const selectedCountryId = form.watch('country')
  const divisionPath: string[] = form.watch('divisionPath') ?? []

  const selectedCountry = countries.find(
    (c) => String(c.value) === String(selectedCountryId)
  )

  const displayRegionLabel =
    selectedCountry && divisionPath.length > 0
      ? `${selectedCountry.label} / ${divisionPath
          .map((id, i) =>
            divisionColumns[i]?.find((d) => String(d.value) === String(id))
              ?.label
          )
          .filter(Boolean)
          .join(' / ')}`
      : selectedCountry?.label ?? 'Please select country / province / city'
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
        render={() => (
          <FormItem>
            <FormLabel>
              Country / Province <span className='text-red-500'>*</span>
            </FormLabel>
            <Popover
              open={regionOpen}
              onOpenChange={(open) => {
                setRegionOpen(open)
                if (open && selectedCountryId && loadingLevelIndex === null) {
                  if (
                    divisionColumns.length === 0 ||
                    divisionColumns[0]?.length === 0
                  )
                    onCountryChange?.(selectedCountryId)
                  else if (divisionPath.length > 0) {
                    const nextLevel = divisionPath.length
                    if (
                      nextLevel < levelCount &&
                      (!divisionColumns[nextLevel] ||
                        divisionColumns[nextLevel].length === 0)
                    )
                      onDivisionSelect?.(
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
                    <span className='truncate'>{displayRegionLabel}</span>
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
                  <div className='max-h-64 flex-1 overflow-y-auto border-r border-border pr-1'>
                    <div className='text-muted-foreground mb-2 text-xs font-medium'>
                      Country/Region
                    </div>
                    {isLoadingCountries ? (
                      <div className='text-muted-foreground py-2 text-xs'>
                        Loading...
                      </div>
                    ) : (
                      countries.map((c) => {
                        const isActive =
                          String(c.value) === String(selectedCountryId)
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
                              onCountryChange?.(c.value)
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
                  {Array.from({ length: levelCount }, (_, levelIndex) => {
                    const column = divisionColumns[levelIndex]
                    const isLoading =
                      loadingLevelIndex === levelIndex
                    const hasData =
                      column && column.length > 0
                    if (!hasData && !isLoading) return null
                    const selectedId = divisionPath[levelIndex]
                    const isLastLevel = levelIndex === levelCount - 1
                    return (
                      <div
                        key={levelIndex}
                        className={cn(
                          'max-h-64 flex-1 overflow-y-auto pl-1',
                          levelIndex < levelCount - 1 &&
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
                                  form.setValue('divisionPath', newPath)
                                  if (isLastLevel) {
                                    form.setValue('province', opt.value)
                                    setRegionOpen(false)
                                  } else {
                                    onDivisionSelect?.(levelIndex, opt.value)
                                  }
                                }}
                              >
                                <span className='truncate'>{opt.label}</span>
                              </button>
                            )
                          })
                        )}
                      </div>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
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
  const [invoiceOpen, setInvoiceOpen] = useState(true)
  const [consigneeOpen, setConsigneeOpen] = useState(false)

  // 第一级：国家 - queryCountry
  const [countries, setCountries] = useState<CascaderOption[]>([])
  const [invoiceLevels, setInvoiceLevels] = useState<AdmindivisionLevelItem[]>([])
  const [consigneeLevels, setConsigneeLevels] = useState<
    AdmindivisionLevelItem[]
  >([])
  const [invoiceDivisionColumns, setInvoiceDivisionColumns] = useState<
    CascaderOption[][]
  >([])
  const [consigneeDivisionColumns, setConsigneeDivisionColumns] = useState<
    CascaderOption[][]
  >([])

  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [invoiceLoadingLevelIndex, setInvoiceLoadingLevelIndex] = useState<
    number | null
  >(null)
  const [consigneeLoadingLevelIndex, setConsigneeLoadingLevelIndex] =
    useState<number | null>(null)
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
                      c.cca2?.toUpperCase() === String(countryCode).toUpperCase()
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
    const userId = auth.user?.id
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
      const consigneeCountryId = findCountryIdByNumber(
        addressData.hzkj_country_number
      )

      const findLevelIdForDivision = async (
        countryId: string,
        divisionId: string
      ): Promise<string> => {
        const levels = await queryAdmindivisionLevel(countryId, 1, 100)
        for (const level of levels) {
          const divisions = await queryAdmindivision(
            countryId,
            level.id,
            undefined,
            1,
            500
          )
          if (divisions.some((d) => String(d.id) === String(divisionId))) {
            return level.id
          }
        }
        return ''
      }

      // 根据 divisionId 和 parent_id 递归构建完整路径 [省id, 市id, ..., 叶节点id]
      const buildDivisionPath = async (
        countryId: string,
        divisionId: string
      ): Promise<string[]> => {
        if (!divisionId) return []
        const levels = await queryAdmindivisionLevel(countryId, 1, 100)
        for (const level of levels) {
          const divisions = await queryAdmindivision(
            countryId,
            level.id,
            undefined,
            1,
            500
          )
          const found = divisions.find(
            (d) => String(d.id) === String(divisionId)
          )
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
              countryId,
              String(parentId)
            )
            return [...parentPath, String(divisionId)]
          }
        }
        return []
      }

      // 根据 number 查找 division id（当只有 number 无 id 时）
      const findDivisionIdByNumber = async (
        countryId: string,
        divisionNumber: string | undefined
      ): Promise<string> => {
        if (!divisionNumber) return ''
        const levels = await queryAdmindivisionLevel(countryId, 1, 100)
        for (const level of levels) {
          const divisions = await queryAdmindivision(
            countryId,
            level.id,
            undefined,
            1,
            500
          )
          const found = divisions.find(
            (d) => String((d as { number?: string }).number ?? '') === String(divisionNumber)
          )
          if (found) return String(found.id)
        }
        return ''
      }

      const invoiceDivisionId = addressData.hzkj_admindivision2_id
        ? String(addressData.hzkj_admindivision2_id)
        : invoiceCountryId
          ? await findDivisionIdByNumber(
              invoiceCountryId,
              addressData.hzkj_admindivision2_number
            )
          : ''
      const consigneeDivisionId = addressData.hzkj_admindivision_id
        ? String(addressData.hzkj_admindivision_id)
        : consigneeCountryId
          ? await findDivisionIdByNumber(
              consigneeCountryId,
              addressData.hzkj_admindivision_number
            )
          : ''

      let invoiceLevelId = ''
      let consigneeLevelId = ''
      if (invoiceCountryId && invoiceDivisionId) {
        invoiceLevelId = await findLevelIdForDivision(
          invoiceCountryId,
          invoiceDivisionId
        )
      }
      if (consigneeCountryId && consigneeDivisionId) {
        consigneeLevelId = await findLevelIdForDivision(
          consigneeCountryId,
          consigneeDivisionId
        )
      }

      // 构建完整 divisionPath（省/市/区等多级路径），若构建失败则退化为单级
      const invoiceDivisionPathRaw = invoiceCountryId
        ? await buildDivisionPath(invoiceCountryId, invoiceDivisionId)
        : []
      const invoiceDivisionPath =
        invoiceDivisionPathRaw.length > 0
          ? invoiceDivisionPathRaw
          : invoiceDivisionId
            ? [invoiceDivisionId]
            : []
      const consigneeDivisionPathRaw = consigneeCountryId
        ? await buildDivisionPath(consigneeCountryId, consigneeDivisionId)
        : []
      const consigneeDivisionPath =
        consigneeDivisionPathRaw.length > 0
          ? consigneeDivisionPathRaw
          : consigneeDivisionId
            ? [consigneeDivisionId]
            : []

      invoiceForm.reset({
        firstName: addressData.hzkj_customer_first_name2 ?? '',
        lastName: addressData.hzkj_customer_last_name2 ?? '',
        phoneNumber: addressData.hzkj_phone_number ?? '',
        email: addressData.hzkj_emailfield ?? '',
        address1: addressData.hzkj_bill_adress ?? '',
        address2: addressData.hzkj_bill_adress2 ?? '',
        country: invoiceCountryId,
        province: invoiceDivisionId,
        provinceLevel: invoiceLevelId,
        divisionPath: invoiceDivisionPath,
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
        province: consigneeDivisionId,
        provinceLevel: consigneeLevelId,
        divisionPath: consigneeDivisionPath,
        city: addressData.hzkj_city ?? '',
        postcode: addressData.hzkj_textfield1 ?? '',
      })

      // 加载行政区级联列并回填
      if (invoiceCountryId) {
        const levels = await queryAdmindivisionLevel(invoiceCountryId, 1, 100)
        setInvoiceLevels(levels)
        if (levels.length > 0 && invoiceDivisionPath.length > 0) {
          void loadDivision(
            invoiceCountryId,
            0,
            undefined,
            true,
            levels,
            true
          )
        } else {
          setInvoiceDivisionColumns([])
        }
      }
      if (consigneeCountryId) {
        const levels = await queryAdmindivisionLevel(
          consigneeCountryId,
          1,
          100
        )
        setConsigneeLevels(levels)
        if (levels.length > 0 && consigneeDivisionPath.length > 0) {
          void loadDivision(
            consigneeCountryId,
            0,
            undefined,
            false,
            levels,
            true
          )
        } else {
          setConsigneeDivisionColumns([])
        }
      }

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

  // 通用加载：按 levelIndex 动态加载第 N 级行政区（1～5 级等皆可）
  const loadDivision = async (
    countryId: string,
    levelIndex: number,
    parentId: string | undefined,
    isInvoice: boolean,
    levelsOverride?: AdmindivisionLevelItem[],
    preservePath?: boolean // 回填时保留已设置的 divisionPath
  ) => {
    if (!countryId) return
    const levels =
      levelsOverride ?? (isInvoice ? invoiceLevels : consigneeLevels)
    if (levelIndex >= levels.length) return

    const setColumns = isInvoice
      ? setInvoiceDivisionColumns
      : setConsigneeDivisionColumns
    const setLoading = isInvoice
      ? setInvoiceLoadingLevelIndex
      : setConsigneeLoadingLevelIndex

    if (levelIndex === 0 && !preservePath) {
      if (isInvoice) {
        invoiceForm.setValue('divisionPath', [])
        invoiceForm.setValue('province', '')
      } else {
        consigneeForm.setValue('divisionPath', [])
        consigneeForm.setValue('province', '')
      }
    }
    setLoading(levelIndex)
    setColumns((prev) => {
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
      setColumns((prev) => {
        const next = [...prev]
        next[levelIndex] = options
        return next
      })
      // 回填时：若 divisionPath 有后续级，继续加载下一列
      const divisionPath: string[] =
        (isInvoice
          ? invoiceForm.getValues('divisionPath')
          : consigneeForm.getValues('divisionPath')) ?? []
      if (divisionPath.length > levelIndex + 1) {
        const nextParentId = divisionPath[levelIndex]
        void loadDivision(
          countryId,
          levelIndex + 1,
          nextParentId,
          isInvoice,
          levels,
          preservePath
        )
      }
    } catch (error) {
      console.error('Failed to load division:', error)
      toast.error('Failed to load divisions')
    } finally {
      setLoading(null)
    }
  }

  // 国家变更：先取级次，再加载第一级
  const onCountryChange = async (countryId: string, isInvoice: boolean) => {
    if (!countryId) return
    const setColumns = isInvoice
      ? setInvoiceDivisionColumns
      : setConsigneeDivisionColumns
    setColumns([])
    if (isInvoice) {
      invoiceForm.setValue('divisionPath', [])
      invoiceForm.setValue('province', '')
    } else {
      consigneeForm.setValue('divisionPath', [])
      consigneeForm.setValue('province', '')
    }

    try {
      const levels = await queryAdmindivisionLevel(countryId, 1, 100)
      if (isInvoice) setInvoiceLevels(levels)
      else setConsigneeLevels(levels)
      if (levels.length > 0) {
        await loadDivision(countryId, 0, undefined, isInvoice, levels)
      }
    } catch (error) {
      console.error('Failed to load division levels:', error)
      toast.error('Failed to load divisions')
    }
  }

  const handleInvoiceSubmit = async (data: InvoiceAddressValues) => {
    try {
      const userId = auth.user?.id
      if (!userId) {
        toast.error('User ID is required')
        return
      }

      const loadingToast = toast.loading('Updating billing address...')

      await updateBillAddress({
        id: userId,
        hzkj_customer_first_name2: data.firstName,
        hzkj_customer_last_name2: data.lastName,
        hzkj_phone_number: data.phoneNumber,
        hzkj_emailfield: data.email || '',
        hzkj_bill_city: data.city,
        hzkj_bill_adress: data.address1,
        hzkj_bill_adress2: data.address2 || '',
        hzkj_textfield3: data.postcode,
        hzkj_tax_id2: data.taxId || '',
        hzkj_synchronize_adress: data.syncShippingAddress,
        hzkj_country2_id: data.country ? Number(data.country) : undefined,
        hzkj_admindivision2_id: data.province
          ? Number(data.province)
          : undefined,
      })

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
          province: data.province,
          provinceLevel: data.provinceLevel,
          divisionPath: data.divisionPath ?? [],
          city: data.city,
          postcode: data.postcode,
        })
        if (data.country) void onCountryChange(data.country, false)
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
      const userId = auth.user?.id
      if (!userId) {
        toast.error('User ID is required')
        return
      }

      const loadingToast = toast.loading('Updating shipping address...')

      await updateAddress({
        id: userId,
        hzkj_customer_first_name: data.firstName,
        hzkj_customer_last_name: data.lastName,
        hzkj_phone: data.phoneNumber,
        hzkj_adress_emailfield: data.email || '',
        hzkj_city: data.city,
        hzkj_textfield: data.address1,
        hzkj_address2: data.address2 || '',
        hzkj_textfield1: data.postcode,
        hzkj_tax_id1: '',
        hzkj_country_id: data.country ? Number(data.country) : undefined,
        hzkj_admindivision_id: data.province
          ? Number(data.province)
          : undefined,
      })

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
        <div className='rounded-md border border-border bg-card'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50'>
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
                  <ChevronUp className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                )}
              </Button>
              <span className='font-medium text-foreground'>Invoice Address</span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-800/60'
              >
                <HelpCircle className='h-3 w-3 text-orange-500 dark:text-orange-400' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {invoiceOpen && (
            <div className='border-t border-border px-4 py-6'>
              <Form {...invoiceForm}>
                <form
                  onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={invoiceForm}
                    showTaxId={true}
                    countries={countries}
                    divisionColumns={invoiceDivisionColumns}
                    levelCount={invoiceLevels.length}
                    isLoadingCountries={isLoadingCountries}
                    loadingLevelIndex={invoiceLoadingLevelIndex}
                    onCountryChange={(countryId) =>
                      onCountryChange(countryId, true)
                    }
                    onDivisionSelect={(levelIndex, divisionId) => {
                      const countryId = invoiceForm.getValues('country')
                      if (countryId)
                        loadDivision(
                          countryId,
                          levelIndex + 1,
                          divisionId,
                          true
                        )
                    }}
                  />

                  <FormField
                    control={invoiceForm.control}
                    name='syncShippingAddress'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border border-border p-4'>
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
        <div className='rounded-md border border-border bg-card'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-muted/50'>
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
                  <ChevronUp className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                )}
              </Button>
              <span className='font-medium text-foreground'>
                Consignee Address
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-800/60'
              >
                <HelpCircle className='h-3 w-3 text-orange-500 dark:text-orange-400' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {consigneeOpen && (
            <div className='border-t border-border px-4 py-6'>
              <Form {...consigneeForm}>
                <form
                  onSubmit={consigneeForm.handleSubmit(handleConsigneeSubmit)}
                  className='space-y-6'
                >
                  <AddressFields
                    form={consigneeForm}
                    showTaxId={false}
                    countries={countries}
                    divisionColumns={consigneeDivisionColumns}
                    levelCount={consigneeLevels.length}
                    isLoadingCountries={isLoadingCountries}
                    loadingLevelIndex={consigneeLoadingLevelIndex}
                    onCountryChange={(countryId) =>
                      onCountryChange(countryId, false)
                    }
                    onDivisionSelect={(levelIndex, divisionId) => {
                      const countryId = consigneeForm.getValues('country')
                      if (countryId)
                        loadDivision(
                          countryId,
                          levelIndex + 1,
                          divisionId,
                          false
                        )
                    }}
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
