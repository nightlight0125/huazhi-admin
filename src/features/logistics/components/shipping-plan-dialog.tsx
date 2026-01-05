import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { addCusFreight, getLogsList, getStatesList } from '@/lib/api/logistics'
import { getProductsList, type ApiProductItem } from '@/lib/api/products'
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

const shippingPlanItemSchema = z.object({
  from: z.string().min(1, 'Country is required'),
  method: z.string().min(1, 'Method is required'),
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
  const [countryOptions, setCountryOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [methodOptions, setMethodOptions] = useState<
    Array<{ label: string; value: string }>
  >([])
  const [statesData, setStatesData] = useState<
    Array<{ id: string; hzkj_code?: string; hzkj_name?: string }>
  >([])
  const [productsData, setProductsData] = useState<ApiProductItem[]>([])
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ShippingPlanFormValues>({
    resolver: zodResolver(shippingPlanFormSchema),
    defaultValues: {
      sku: '',
      spu: '',
      to: '',
      plans: [{ from: '', method: '' }],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'plans',
  })

  // 加载州/省列表和自定义渠道列表
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setIsLoadingStates(true)
        try {
          const [statesData, channelsData, productsResponse] = await Promise.all([
            getStatesList(),
            getLogsList(),
            getProductsList({
              pageNo: 1,
              pageSize: 1000,
            }),
          ])

          setStatesData(statesData)
          setProductsData(productsResponse.data?.products || [])

          const countryOpts = statesData.map((state) => ({
            label: state.hzkj_name || state.name || '',
            value: state.hzkj_code || state.id || '',
          }))
          setCountryOptions(countryOpts)
          // 使用channels数据作为方法下拉框选项（method字段）
          const channelOpts = channelsData.map((channel) => ({
            label: channel.name || '',
            value: channel.id || '',
          }))
          setMethodOptions(channelOpts)
          console.log('method options (from channels):', channelOpts)
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

  // 当弹框关闭时重置表单
  useEffect(() => {
    if (!open) {
      form.reset({
        sku: '',
        spu: '',
        to: '',
        plans: [{ from: '', method: '' }],
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
      // 构建 destination 对象：key 是州/省的 id，value 是自定义渠道的 id
      const destination: Record<string, string> = {}
      values.plans.forEach((plan) => {
        if (plan.from && plan.method) {
          // plan.from 是国家代码（hzkj_code），需要找到对应的州/省 id
          const state = statesData.find(
            (s) => s.hzkj_code === plan.from || s.id === plan.from
          )
          if (state) {
            // key 是州/省的 id，value 是自定义渠道的 id（plan.method）
            destination[state.id] = plan.method
          } else {
            console.warn('未找到对应的州/省，plan.from:', plan.from)
          }
        }
      })

      console.log('构建的 destination:', destination)
      console.log('statesData:', statesData)

      if (Object.keys(destination).length === 0) {
        toast.error('Please select valid country and method for shipping plans')
        setIsSubmitting(false)
        return
      }

      const customerId = auth.user?.customerId
      if (!customerId) {
        toast.error('Customer ID is required')
        setIsSubmitting(false)
        return
      }

      const requestData = {
        customerId,
        spuId: values.spu, // 使用表单中选择的 SPU
        destination,
      }

      console.log(
        '准备调用接口，请求数据:',
        JSON.stringify(requestData, null, 2)
      )

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
              {/* Plans list */}
              <div className='space-y-3'>
                <div>
                  <div className='text-sm font-medium'>Shipping Plan</div>
                  <div className='text-muted-foreground text-xs'>
                    Choose your shipping straightly
                  </div>
                </div>

                {/* SPU 下拉框（单个，不随 plans 遍历） */}
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
                          label: product.name || '',
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
                                  disabled={isLoadingStates}
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
