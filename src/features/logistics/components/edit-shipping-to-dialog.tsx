import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useLogisticsChannels } from '@/hooks/use-logistics-channels'
import { apiClient } from '@/lib/api-client'
import { queryCountry, type CountryItem } from '@/lib/api/logistics'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import worldCountries from 'world-countries'
import { z } from 'zod'
// Input replaced by SelectDropdown for country selection
import { SelectDropdown } from '@/components/select-dropdown'
import { type Logistics } from '../data/schema'

// 创建国旗图标组件
const createFlagIcon = (countryCode: string) => {
  const FlagIcon = ({ className }: { className?: string }) => {
    const code = countryCode.toLowerCase()
    return <span className={`fi fi-${code} ${className || ''}`} />
  }
  return FlagIcon
}

const editShippingSchema = z.object({
  shippingTo: z.string().min(1, 'Shipping To is required'),
  shippingMethod: z.string().min(1, 'Shipping Method is required'),
})

type EditShippingValues = z.infer<typeof editShippingSchema>

interface EditShippingToDialogProps {
  open: boolean
  row: Logistics | null
  onOpenChange: (open: boolean) => void
  onSubmit?: (row: Logistics, values: EditShippingValues) => void
}

// shippingMethodOptions replaced by methodOptions loaded from API

export function EditShippingToDialog({
  open,
  row,
  onOpenChange,
  onSubmit,
}: EditShippingToDialogProps) {
  const [countryOptions, setCountryOptions] = useState<
    Array<{ label: string; value: string; icon?: React.ComponentType<{ className?: string }> }>
  >([])
  const [, setIsLoadingData] = useState(false)
  const [, setIsSubmitting] = useState(false)

  // 使用 hook 获取物流渠道数据，只在对话框打开时加载
  const { channels: methodOptions, error: channelsError } = useLogisticsChannels(1, 1000, open)

  // load countries when dialog opens
  useEffect(() => {
    if (!open) return
    const load = async () => {
      setIsLoadingData(true)
      try {
        const countries = await queryCountry(1, 1000) // 获取国家列表，最多1000条
        // 将国家数据映射为选项格式，包含图标
        const countryOpts = countries
          .filter((country) => country.id) // 过滤掉没有ID的国家
          .map((country: CountryItem) => {
            // 优先使用 twocountrycode，如果没有则使用 hzkj_code
            const countryCode = country.twocountrycode || country.hzkj_code
            
            // 在 world-countries 库中查找对应的国家信息
            const countryInfo = countryCode
              ? worldCountries.find(
                  (c: any) => c.cca2?.toUpperCase() === countryCode.toUpperCase()
                )
              : null

            // 生成国家代码（用于图标）
            const code = (countryInfo as any)?.cca2?.toLowerCase() || countryCode?.toLowerCase() || ''
            
            return {
              label: country.hzkj_name || country.name || country.description || '',
              value: country.id || '', // use id so we can send destinationId directly
              icon: code ? createFlagIcon(code) : undefined,
            }
          })
        setCountryOptions(countryOpts)
      } catch (error) {
        console.error('Failed to load countries:', error)
        toast.error('Failed to load countries')
      } finally {
        setIsLoadingData(false)
      }
    }

    load()
  }, [open])

  // 监听物流渠道加载错误
  useEffect(() => {
    if (channelsError) {
      console.error('Failed to load logistics channels:', channelsError)
      toast.error('Failed to load logistics channels')
    }
  }, [channelsError])

  const form = useForm<EditShippingValues>({
    resolver: zodResolver(editShippingSchema),
    defaultValues: {
      shippingTo: row?.shippingTo ?? '',
      shippingMethod: row?.shippingMethod ?? '',
    },
  })

  // 当选中行变化或弹窗重新打开时，同步表单默认值
  if (
    row &&
    (form.getValues('shippingTo') !== row.shippingTo ||
      form.getValues('shippingMethod') !== row.shippingMethod)
  ) {
    form.reset({
      shippingTo: row.shippingTo,
      shippingMethod: row.shippingMethod,
    })
  }

  const handleSubmit = (values: EditShippingValues) => {
    // call API to add freight for this row
    const doSubmit = async () => {
      if (!row) return
      setIsSubmitting(true)
      const loadingToast = toast.loading('Adding freight...')
      try {
        // values.shippingTo is destinationId (state.id), values.shippingMethod is channelId
        const rawEntryId =
          (row as any).entryId ??
          (row as any).entry_id ??
          (row as any).data?.entryId ??
          (row as any).data?.entry_id ??
          (row as any).entryIdStr ??
          (row as any).entryid ??
          ''

        const payload = {
          id: String(row.id),
          entryId: String(rawEntryId ?? ''),
          destinationId: String(values.shippingTo),
          channelId: String(values.shippingMethod),
        }

        await apiClient.post(
          '/v2/hzkj/hzkj_logistics/hzkj_cus_freight/add',
          payload
        )

        toast.dismiss(loadingToast)
        toast.success('Added successfully')
        onOpenChange(false)
        // notify parent to refresh
        onSubmit?.(row, values)
      } catch (error) {
        toast.dismiss(loadingToast)
        const msg = error instanceof Error ? error.message : 'Add failed'
        toast.error(msg)
        console.error('Add freight error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }

    doSubmit()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Edit Shipping Info</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id='edit-shipping-to-form'
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='shippingTo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping To</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select country'
                    items={countryOptions}
                    isControlled
                    className='w-full'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='shippingMethod'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Method</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select shipping method'
                    items={methodOptions}
                    isControlled
                    className='w-full'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='submit' form='edit-shipping-to-form'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
