import { useEffect } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { SelectDropdown } from '@/components/select-dropdown'

const countryOptions = [
  { label: 'France [FR]', value: 'FR' },
  { label: 'United Kingdom [GB]', value: 'GB' },
  { label: 'Belgium [BE]', value: 'BE' },
  { label: 'Canada [CA]', value: 'CA' },
  { label: 'United States [US]', value: 'US' },
  { label: 'Switzerland [CH]', value: 'CH' },
]

const methodOptions = [
  { label: 'DS Standard line', value: 'standard' },
  { label: 'DS Express line', value: 'express' },
]

const shippingPlanItemSchema = z.object({
  from: z.string().min(1, 'Country is required'),
  method: z.string().min(1, 'Method is required'),
})

const shippingPlanFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  to: z.string().min(1, 'Destination is required'),
  plans: z
    .array(shippingPlanItemSchema)
    .min(1, 'At least one plan is required'),
})

type ShippingPlanFormValues = z.infer<typeof shippingPlanFormSchema>

interface ShippingPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShippingPlanDialog({
  open,
  onOpenChange,
}: ShippingPlanDialogProps) {
  const form = useForm<ShippingPlanFormValues>({
    resolver: zodResolver(shippingPlanFormSchema),
    defaultValues: {
      sku: '',
      to: '',
      plans: [{ from: 'FR', method: 'standard' }],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  })

  // 当弹框关闭时重置表单
  useEffect(() => {
    if (!open) {
      form.reset({
        sku: '',
        to: '',
        plans: [{ from: 'FR', method: 'standard' }],
      })
    }
  }, [open, form])

  const handleSubmit = (values: ShippingPlanFormValues) => {
    // TODO: 将 values 提交给后端
    // values.plans 是一个 list，可直接传给接口
    // eslint-disable-next-line no-console
    console.log('Shipping plan submitted:', values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add Shipping Plan</DialogTitle>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto py-2'>
          <Form {...form}>
            <form
              id='shipping-plan-form'
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4 px-1'
            >
              {/* Plans list */}
              <div className='space-y-3'>
                <div>
                  <div className='text-sm font-medium'>Shipping Plan</div>
                  <div className='text-muted-foreground text-xs'>
                    Choose your shipping straightly
                  </div>
                </div>

                <div className='space-y-2'>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='grid grid-cols-2 items-center gap-4'
                    >
                      <FormField
                        control={form.control}
                        name={`plans.${index}.from`}
                        render={({ field: fromField }) => (
                          <FormItem>
                            <FormLabel className='sr-only'>From</FormLabel>
                            <SelectDropdown
                              defaultValue={fromField.value}
                              onValueChange={fromField.onChange}
                              placeholder='Select country'
                              items={countryOptions}
                              className='w-full'
                              isControlled
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='flex items-center gap-2'>
                        <div className='flex-1'>
                          <FormField
                            control={form.control}
                            name={`plans.${index}.method`}
                            render={({ field: methodField }) => (
                              <FormItem>
                                <FormLabel className='sr-only'>
                                  Method
                                </FormLabel>
                                <SelectDropdown
                                  defaultValue={methodField.value}
                                  onValueChange={methodField.onChange}
                                  placeholder='Select method'
                                  items={methodOptions}
                                  className='w-full'
                                  isControlled
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type='button'
                          variant='link'
                          size='sm'
                          className='px-0 text-xs text-blue-500 hover:text-blue-600'
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type='button'
                  size='sm'
                  className='mt-3 bg-orange-500 text-xs font-medium text-white hover:bg-orange-600'
                  onClick={() =>
                    append({
                      from: 'FR',
                      method: 'standard',
                    })
                  }
                >
                  + Add A Shipping Plan
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='submit' form='shipping-plan-form'>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
