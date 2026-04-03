import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addCusFreight } from '@/lib/api/logistics'
import { getProductsList, type ApiProductItem } from '@/lib/api/products'
import { useCountries } from '@/hooks/use-countries'
import { useLogisticsChannels } from '@/hooks/use-logistics-channels'
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

const PRIORITY_OPTIONS = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
] as const

const shippingPlanItemSchema = z.object({
  from: z.string().min(1, 'Country is required'),
  method: z.string().min(1, 'Method is required'),
  priority: z.enum(['0', '1', '2'], {
    message: 'Priority is required',
  }),
})

const shippingPlanFormSchema = z.object({
  sku: z.string().optional(),
  spu: z.string().min(1, 'SPU is required'),
  to: z.string().optional(),
  plans: z
    .array(shippingPlanItemSchema)
    .min(1, 'At least one plan is required'),
})

type ShippingPlanFormValues = z.infer<typeof shippingPlanFormSchema>

interface ShippingPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // 提交成功后的回调
}

export function ShippingPlanDialog({
  open,
  onOpenChange,
  onSuccess,
}: ShippingPlanDialogProps) {
  const { auth } = useAuthStore()
  const [productsData, setProductsData] = useState<ApiProductItem[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 使用 hook 获取国家数据和物流渠道数据，只在对话框打开时加载
  const { countries: countryOptions, error: countriesError } = useCountries(
    1,
    1000,
    open
  )
  const { channels: methodOptions, error: channelsError } =
    useLogisticsChannels(1, 1000, open)

  const form = useForm<ShippingPlanFormValues>({
    resolver: zodResolver(shippingPlanFormSchema),
    defaultValues: {
      sku: '',
      spu: '',
      to: '',
      plans: [{ from: '', method: '', priority: '0' }],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  })

  // 加载产品列表（国家和州数据由 useCountries / useLogisticsChannels 提供）
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setIsLoadingStates(true)
        try {
          const productsResponse = await getProductsList({
            customerId: String(auth.user?.customerId || ''),
            pageNo: 1,
            pageSize: 1000,
          })
          setProductsData(productsResponse.data?.products || [])
        } catch (error) {
          console.error('Failed to load data:', error)
          toast.error('Failed to load data. Please try again.')
        } finally {
          setIsLoadingStates(false)
        }
      }

      loadData()
    }
  }, [open])

  // 监听国家数据和物流渠道加载错误
  useEffect(() => {
    if (countriesError) {
      console.error('Failed to load countries:', countriesError)
      toast.error('Failed to load countries')
    }
  }, [countriesError])

  useEffect(() => {
    if (channelsError) {
      console.error('Failed to load logistics channels:', channelsError)
      toast.error('Failed to load logistics channels')
    }
  }, [channelsError])

  // 当弹框关闭时重置表单
  useEffect(() => {
    if (!open) {
      form.reset({
        sku: '',
        spu: '',
        to: '',
        plans: [{ from: '', method: '', priority: '0' }],
      })
    }
  }, [open, form])

  const handleSubmit = async (values: ShippingPlanFormValues) => {
    if (!values.spu) {
      toast.error('Please select SPU')
      return
    }

    // 检查是否有有效的计划
    const validPlans = values.plans.filter((plan) => plan.from && plan.method)
    if (validPlans.length === 0) {
      toast.error(
        'Please add at least one shipping plan with country and method'
      )
      return
    }

    setIsSubmitting(true)
    try {
      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('Customer ID is required')
        setIsSubmitting(false)
        return
      }

      const requestData = {
        customerId,
        spuId: values.spu,
        data: validPlans.map((plan) => ({
          destination: plan.from,
          logisticsChannel: plan.method,
          priority: plan.priority,
        })),
      }

      // 调用新增接口
      await addCusFreight(requestData)

      toast.success('Shipping plan added successfully')
      onOpenChange(false)
      // 触发刷新回调
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit shipping plan:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to add shipping plan. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
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
              <div className='space-y-3'>
                <div>
                  <div className='text-sm font-medium'>Shipping Plan</div>
                  <div className='text-muted-foreground text-xs'>
                    Choose your shipping straightly
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name='spu'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SPU</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select SPU'
                        items={productsData.map((product) => ({
                          label: product.number || '',
                          value: product.id || '',
                        }))}
                        className='w-full'
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3'
                    >
                      <FormField
                        control={form.control}
                        name={`plans.${index}.from`}
                        render={({ field: fromField }) => (
                          <FormItem className='min-w-0 flex-1'>
                            <FormLabel className='text-xs'>Country</FormLabel>
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

                      <FormField
                        control={form.control}
                        name={`plans.${index}.method`}
                        render={({ field: methodField }) => (
                          <FormItem className='min-w-0 flex-1'>
                            <FormLabel className='text-xs'>Method</FormLabel>
                            <SelectDropdown
                              defaultValue={methodField.value}
                              onValueChange={methodField.onChange}
                              placeholder='Select method'
                              items={methodOptions}
                              className='w-full'
                              isControlled
                              disabled={isLoadingStates}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`plans.${index}.priority`}
                        render={({ field: priorityField }) => (
                          <FormItem className='w-full sm:w-32'>
                            <FormLabel className='text-xs'>Priority</FormLabel>
                            <SelectDropdown
                              defaultValue={priorityField.value}
                              onValueChange={priorityField.onChange}
                              placeholder='Priority'
                              items={[...PRIORITY_OPTIONS]}
                              className='w-full'
                              isControlled
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type='button'
                        variant='link'
                        size='sm'
                        className='h-10 shrink-0 self-end px-0 text-xs text-blue-500 hover:text-blue-600 sm:mb-0.5'
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type='button'
                  size='sm'
                  className='mt-3 bg-orange-500 text-xs font-medium text-white hover:bg-orange-600'
                  onClick={() =>
                    append({
                      from: '',
                      method: '',
                      priority: '0',
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
          <Button
            type='submit'
            form='shipping-plan-form'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
