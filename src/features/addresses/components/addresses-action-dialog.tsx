'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Address } from '../data/schema'

const countries = [
  { label: 'USA', value: 'USA' },
  { label: 'Canada', value: 'Canada' },
  { label: 'UK', value: 'UK' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Australia', value: 'Australia' },
]

const provinces = {
  USA: [
    { label: 'Alabama', value: 'Alabama' },
    { label: 'California', value: 'California' },
    { label: 'Texas', value: 'Texas' },
    { label: 'New York', value: 'New York' },
    { label: 'Florida', value: 'Florida' },
  ],
  Canada: [
    { label: 'Ontario', value: 'Ontario' },
    { label: 'Quebec', value: 'Quebec' },
    { label: 'British Columbia', value: 'British Columbia' },
    { label: 'Alberta', value: 'Alberta' },
  ],
  UK: [
    { label: 'England', value: 'England' },
    { label: 'Scotland', value: 'Scotland' },
    { label: 'Wales', value: 'Wales' },
    { label: 'Northern Ireland', value: 'Northern Ireland' },
  ],
  Germany: [
    { label: 'Bavaria', value: 'Bavaria' },
    { label: 'Berlin', value: 'Berlin' },
    { label: 'Hamburg', value: 'Hamburg' },
    { label: 'North Rhine-Westphalia', value: 'North Rhine-Westphalia' },
  ],
  France: [
    { label: 'Île-de-France', value: 'Île-de-France' },
    { label: 'Provence-Alpes-Côte d\'Azur', value: 'Provence-Alpes-Côte d\'Azur' },
    { label: 'Auvergne-Rhône-Alpes', value: 'Auvergne-Rhône-Alpes' },
  ],
  Australia: [
    { label: 'New South Wales', value: 'New South Wales' },
    { label: 'Victoria', value: 'Victoria' },
    { label: 'Queensland', value: 'Queensland' },
    { label: 'Western Australia', value: 'Western Australia' },
  ],
}

const formSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  company: z.string().min(1, 'Company is required'),
  address1: z.string().min(1, 'Address1 is required'),
  address2: z.string().optional(),
  country: z.string().min(1, 'Country/Region is required'),
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  taxId: z.string().optional(),
})

type AddressForm = z.infer<typeof formSchema>

type AddressActionDialogProps = {
  currentRow?: Address
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddressesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AddressActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<AddressForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          firstName: currentRow.firstName,
          lastName: currentRow.lastName,
          phoneNumber: currentRow.phoneNumber || '',
          email: currentRow.email,
          company: currentRow.company,
          address1: currentRow.address1,
          address2: currentRow.address2 || '',
          country: currentRow.country,
          province: currentRow.province,
          city: currentRow.city,
          postcode: currentRow.postcode,
          taxId: currentRow.taxId || '',
        }
      : {
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
        },
  })

  const selectedCountry = form.watch('country')
  const availableProvinces = selectedCountry
    ? provinces[selectedCountry as keyof typeof provinces] || []
    : []

  const onSubmit = (values: AddressForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className='text-start'>
          <DialogTitle>Edit The Address</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the address information.' : 'Create a new address.'}
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto py-1'>
          <Form {...form}>
            <form
              id='address-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-1'
            >
              {/* Two-column layout for top section */}
              <div className='grid grid-cols-2 gap-4'>
                {/* Left Column */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>*</span> First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Please enter first name'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Please enter phone number'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='company'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>*</span> Company
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Please enter company'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='address1'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>*</span> Address1
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Please enter address1'
                            autoComplete='off'
                            {...field}
                          />
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
                          <Input
                            placeholder='Please enter address2'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className='text-red-500'>*</span> Last Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Please enter last name'
                            autoComplete='off'
                            {...field}
                          />
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
                        <FormLabel>
                          <span className='text-red-500'>*</span> Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='Please enter email'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Single column layout for bottom section */}
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className='text-red-500'>*</span> Country/Region
                      </FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Reset province when country changes
                          form.setValue('province', '')
                        }}
                        placeholder='Please select country/region'
                        items={countries}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='province'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className='text-red-500'>*</span> Province
                      </FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Please select province'
                        items={availableProvinces}
                        disabled={!selectedCountry}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className='text-red-500'>*</span> City
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Please enter city'
                          autoComplete='off'
                          {...field}
                        />
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
                        <span className='text-red-500'>*</span> Postcode
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Please enter postcode'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='taxId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Please enter tax id'
                          autoComplete='off'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          <Button type='submit' form='address-form'>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

