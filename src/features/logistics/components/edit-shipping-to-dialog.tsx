import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
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

const shippingMethodOptions = [
  { label: 'DS Standard line', value: 'DS Standard line' },
  { label: 'DS Express line', value: 'DS Express line' },
]

export function EditShippingToDialog({
  open,
  row,
  onOpenChange,
  onSubmit,
}: EditShippingToDialogProps) {
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
    if (row && onSubmit) {
      onSubmit(row, values)
    }
    onOpenChange(false)
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
                  <Input
                    placeholder='Enter shipping to'
                    autoComplete='off'
                    {...field}
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
                    items={shippingMethodOptions}
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

