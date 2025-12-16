import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
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

// 国家代码列表
const countryCodes = [
  { code: '+86', country: 'China' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+1', country: 'United States' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+81', country: 'Japan' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+7', country: 'Russia' },
  { code: '+55', country: 'Brazil' },
]

const profileFormSchema = z.object({
  firstName: z
    .string('Please enter your first name.')
    .min(1, 'First name is required.')
    .max(50, 'First name must not be longer than 50 characters.'),
  lastName: z
    .string('Please enter your last name.')
    .min(1, 'Last name is required.')
    .max(50, 'Last name must not be longer than 50 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  bio: z.string().max(160).min(4),
  whatsappCountryCode: z.string().optional(),
  whatsappNumber: z.string().optional(),
  discord: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  firstName: '',
  lastName: '',
  bio: 'I own a computer.',
  email: '',
  whatsappCountryCode: '+86',
  whatsappNumber: '',
  discord: '',
  twitter: '',
  facebook: '',
  instagram: '',
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-8'
      >
        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
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
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Please enter last name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* WhatsApp with Country Code */}
        <FormItem>
          <FormLabel>Whatsapp</FormLabel>
          <div className='flex gap-2'>
            <FormField
              control={form.control}
              name='whatsappCountryCode'
              render={({ field }) => (
                <FormItem className='w-[120px]'>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='+ 86' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countryCodes.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.code}
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
              name='whatsappNumber'
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <Input placeholder='Whatsapp number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormItem>
        <Button type='submit'>Update profile</Button>
      </form>
    </Form>
  )
}
