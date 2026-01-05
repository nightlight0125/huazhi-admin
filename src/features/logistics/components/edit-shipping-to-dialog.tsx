import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { getLogsList, getStatesList } from '@/lib/api/logistics'
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
// Input replaced by SelectDropdown for country selection
import { SelectDropdown } from '@/components/select-dropdown'
import { type Logistics } from '../data/schema'

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
    Array<{ label: string; value: string }>
  >([])
  const [methodOptions, setMethodOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [, setStatesData] = useState<
    Array<{ id: string; hzkj_code?: string; hzkj_name?: string }>
  >([])
  const [, setIsLoadingData] = useState(false)
  const [, setIsSubmitting] = useState(false)

  // load states and channels when dialog opens
  useEffect(() => {
    if (!open) return
    const load = async () => {
      setIsLoadingData(true)
      try {
        const [states, channels] = await Promise.all([
          getStatesList(),
          getLogsList(),
        ])
        setStatesData(states)
        const countryOpts = states.map((s) => ({
          label: s.hzkj_name || s.name || '',
          value: s.id || '', // use id so we can send destinationId directly
        }))
        setCountryOptions(countryOpts)
        const channelOpts = channels.map((c) => ({
          label: c.name || '',
          value: c.id || '',
        }))
        setMethodOptions(channelOpts)
      } catch (error) {
        console.error('Failed to load states/channels:', error)
        toast.error('Failed to load countries or channels')
      } finally {
        setIsLoadingData(false)
      }
    }

    load()
  }, [open])

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
