import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { countries } from '@/features/orders/data/data'

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
  province: z.string().optional(),
  city: z.string().min(1, 'Please enter city'),
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
  city: '',
  postcode: '',
}

// 地址字段组件（可复用）
function AddressFields({
  form,
  showTaxId = false,
}: {
  form: any
  showTaxId?: boolean
}) {
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

      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Country/Region <span className='text-red-500'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Please select country/region' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='province'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === 'none' ? undefined : value)
                }}
                value={field.value || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Please select province' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='none'>None</SelectItem>
                  {/* TODO: Add province options based on selected country */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
  const [invoiceOpen, setInvoiceOpen] = useState(true)
  const [consigneeOpen, setConsigneeOpen] = useState(false)

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

  const handleInvoiceSubmit = (data: InvoiceAddressValues) => {
    console.log('Invoice Address submitted:', data)
    if (data.syncShippingAddress) {
      // 如果勾选了同步收货地址，将账单地址数据同步到收货地址
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
        city: data.city,
        postcode: data.postcode,
      })
    }
    showSubmittedData(data)
    // TODO: 调用保存账单地址的 API
  }

  const handleConsigneeSubmit = (data: ConsigneeAddressValues) => {
    console.log('Consignee Address submitted:', data)
    showSubmittedData(data)
    // TODO: 调用保存收货地址的 API
  }

  return (
    <div className='min-h-0 space-y-4'>
      {/* 账单地址 */}
      <Collapsible open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <div className='rounded-md border bg-white'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50'>
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
                  <ChevronUp className='h-4 w-4 text-gray-600' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-gray-600' />
                )}
              </Button>
              <span className='font-medium text-gray-900'>Invoice Address</span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200'
              >
                <HelpCircle className='h-3 w-3 text-orange-500' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {invoiceOpen && (
            <div className='border-t px-4 py-6'>
              <Form {...invoiceForm}>
                <form
                  onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)}
                  className='space-y-6'
                >
                  <AddressFields form={invoiceForm} showTaxId={true} />

                  <FormField
                    control={invoiceForm.control}
                    name='syncShippingAddress'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4'>
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
                    className='bg-orange-500 text-white hover:bg-orange-600'
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
        <div className='rounded-md border bg-white'>
          <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50'>
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
                  <ChevronUp className='h-4 w-4 text-gray-600' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-gray-600' />
                )}
              </Button>
              <span className='font-medium text-gray-900'>
                Consignee Address
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-5 w-5 rounded-full bg-orange-100 p-0 hover:bg-orange-200'
              >
                <HelpCircle className='h-3 w-3 text-orange-500' />
              </Button>
            </div>
          </CollapsibleTrigger>

          {consigneeOpen && (
            <div className='border-t px-4 py-6'>
              <Form {...consigneeForm}>
                <form
                  onSubmit={consigneeForm.handleSubmit(handleConsigneeSubmit)}
                  className='space-y-6'
                >
                  <AddressFields form={consigneeForm} showTaxId={false} />

                  <Button
                    type='submit'
                    className='bg-orange-500 text-white hover:bg-orange-600'
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
