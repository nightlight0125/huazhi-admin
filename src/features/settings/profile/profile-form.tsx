import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getProfileInfo, updatePassword, updateProfile } from '@/lib/api/users'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

// 国家代码列表 - 暂时未使用，保留以备将来使用
// const countryCodes = [
//   { code: '+86', country: 'China' },
//   { code: '+44', country: 'United Kingdom' },
//   { code: '+1', country: 'United States' },
//   { code: '+33', country: 'France' },
//   { code: '+49', country: 'Germany' },
//   { code: '+81', country: 'Japan' },
//   { code: '+91', country: 'India' },
//   { code: '+61', country: 'Australia' },
//   { code: '+7', country: 'Russia' },
//   { code: '+55', country: 'Brazil' },
// ]

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
  timezone: z.string().optional(),
  whatsappCountryCode: z.string().optional(),
  whatsappNumber: z.string().optional(),
  discord: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, 'Current password must be at least 6 characters.'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The two passwords do not match.',
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  firstName: '',
  lastName: '',
  bio: 'I own a computer.',
  email: '',
  timezone: 'UTC+08:00',
  whatsappCountryCode: '+86',
  whatsappNumber: '',
  discord: '',
  twitter: '',
  facebook: '',
  instagram: '',
}

export function ProfileForm() {
  const { auth } = useAuthStore()
  const profileIdRef = useRef<string | number | undefined>(undefined)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  // 加载 Profile 信息并映射到表单
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = auth.user?.id
        if (!userId) {
          toast.error('User not authenticated. Please login again.')
          return
        }

        const response = await getProfileInfo(userId)
        const rows = response.data?.rows
        const profile =
          Array.isArray(rows) && rows.length > 0 ? rows[0] : undefined

        // 记录 profile 行的 id，用于后续更新
        const profileId = (profile as any)?.id as string | number | undefined
        profileIdRef.current = profileId ?? userId

        const firstName =
          (profile?.hzkj_customer_first_name3 as string | undefined) || ''
        const lastName =
          (profile?.hzkj_customer_last_name3 as string | undefined) || ''
        const email = (profile?.hzkj_emailfield3 as string | undefined) || ''
        const timezone =
          (profile?.hzkj_remark1 as string | undefined) ||
          defaultValues.timezone

        // 手机号优先使用 user 中的 hzkj_whatsapp1，其次使用 profile 中的
        const whatsappFromUser =
          (auth.user?.hzkj_whatsapp1 as string | undefined) || ''
        const whatsappFromProfile =
          (profile?.hzkj_whatsapp1 as string | undefined) || ''

        form.reset({
          ...defaultValues,
          firstName,
          lastName,
          email,
          timezone,
          whatsappCountryCode: defaultValues.whatsappCountryCode,
          whatsappNumber: whatsappFromUser || whatsappFromProfile || '',
        })
      } catch (error) {
        console.error('Failed to load profile info:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load profile info. Please try again.'
        )
      }
    }

    void loadProfile()
  }, [auth.user, form])

  const userId = auth.user?.id
  const emailValue = form.watch('email')
  const firstNameValue = form.watch('firstName')
  const lastNameValue = form.watch('lastName')
  const fullName = `${firstNameValue || ''} ${lastNameValue || ''}`.trim()
  const avatarInitials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    (emailValue?.[0]?.toUpperCase() ?? 'U')

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const userId = auth.user?.id
              if (!userId) {
                toast.error('User not authenticated. Please login again.')
                return
              }

              const rowId = profileIdRef.current ?? userId

              await updateProfile([
                {
                  id: rowId,
                  hzkj_customer_first_name3: values.firstName,
                  hzkj_customer_last_name3: values.lastName,
                  hzkj_emailfield3: values.email,
                  hzkj_whatsapp1: values.whatsappNumber || '',
                  hzkj_remark1: values.timezone || '',
                },
              ])

              // 同步更新 auth 中的手机号
              if (values.whatsappNumber) {
                auth.setUser({
                  ...(auth.user as any),
                  hzkj_whatsapp1: values.whatsappNumber,
                })
              }

              toast.success('Profile updated successfully.')
            } catch (error) {
              console.error('Failed to update profile:', error)
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to update profile. Please try again.'
              )
            }
          })}
          className='space-y-8'
        >
          {/* Row 1: Avatar */}
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback className='text-lg font-semibold'>
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1 text-sm'>
              <div className='font-medium'>{fullName || 'Unnamed User'}</div>
            </div>
          </div>

          {/* Row 2: User ID & Email (read-only) */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <FormLabel>User ID</FormLabel>
              <div className='bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm'>
                {userId ?? '-'}
              </div>
            </div>
            <div className='space-y-1'>
              <FormLabel>Email</FormLabel>
              <div className='bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm'>
                {emailValue || '-'}
              </div>
            </div>
          </div>

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
            name='timezone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>时区</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder='(GMT+08:00) 北京, 重庆...'
                      className='pr-8'
                      {...field}
                    />
                    <Search className='text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2' />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Whatsapp</FormLabel>
            <div className='flex gap-2'>
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
          <div className='flex justify-center'>
            <Button type='submit'>Update profile</Button>
          </div>
        </form>
      </Form>

      {/* Change Password Section */}
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(async (values) => {
            try {
              const rawUserId = auth.user?.id
              if (!rawUserId) {
                toast.error('User not authenticated. Please login again.')
                return
              }

              const numericUserId = Number(rawUserId)
              if (Number.isNaN(numericUserId)) {
                toast.error('User ID is invalid, please contact support.')
                return
              }

              await updatePassword(numericUserId, values.newPassword)

              toast.success('Password updated successfully.')
              passwordForm.reset()
            } catch (error) {
              console.error('Failed to update password:', error)
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to update password. Please try again.'
              )
            }
          })}
          className='mt-10 space-y-6 border-t pt-6'
        >
          <div>
            <h2 className='text-base font-medium'>Change Password</h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              Set a strong password to keep your account secure.
            </p>
          </div>

          <div className='grid grid-cols-3 gap-4 max-md:grid-cols-1'>
            <FormField
              control={passwordForm.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter current password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter new password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Re-enter new password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-center'>
            <Button type='submit'>Update password</Button>
          </div>
        </form>
      </Form>
    </>
  )
}
