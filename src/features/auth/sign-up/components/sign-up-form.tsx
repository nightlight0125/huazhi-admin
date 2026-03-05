import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { AuthError, getToken, memberSignUp } from '@/lib/api/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Country options for phone dial code selector (code used for flag-icons: fi fi-xx)
const PHONE_COUNTRY_OPTIONS: { code: string; dialCode: string; label: string }[] = [
  { code: 'US', dialCode: '+1', label: 'United States' },
  { code: 'CN', dialCode: '+86', label: 'China' },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom' },
  { code: 'JP', dialCode: '+81', label: 'Japan' },
  { code: 'KR', dialCode: '+82', label: 'South Korea' },
  { code: 'HK', dialCode: '+852', label: 'Hong Kong' },
  { code: 'MO', dialCode: '+853', label: 'Macao' },
  { code: 'TW', dialCode: '+886', label: 'Taiwan' },
  { code: 'SG', dialCode: '+65', label: 'Singapore' },
  { code: 'AU', dialCode: '+61', label: 'Australia' },
  { code: 'CA', dialCode: '+1', label: 'Canada' },
  { code: 'DE', dialCode: '+49', label: 'Germany' },
  { code: 'FR', dialCode: '+33', label: 'France' },
  { code: 'IN', dialCode: '+91', label: 'India' },
  { code: 'MX', dialCode: '+52', label: 'Mexico' },
  { code: 'BR', dialCode: '+55', label: 'Brazil' },
]

const formSchema = z
  .object({
    email: z.email({
      message: 'Please enter a valid email address',
    }),
    name: z.string().min(1, 'Please enter your name'),
    phone: z
      .string()
      .min(1, 'Please enter your phone number')
      .regex(
        /^\+\d{1,3}-\d{6,15}$/,
        'Please enter a valid phone number, e.g. +86-17674345004'
      ),
    password: z.string().min(1, 'Please enter your password'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message:
        'Please confirm that you have read and agree to the User Registration Agreement and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState(
    () => PHONE_COUNTRY_OPTIONS[0]
  )
  const [phonePopoverOpen, setPhonePopoverOpen] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log('表单提交被触发！', data)
    setIsLoading(true)

    const loadingToast = toast.loading('Creating account...')

    try {
      // 检查当前 token 状态
      const currentToken = auth.accessToken
      const currentUser = auth.user
      let token = currentToken

      // 如果没有 token 或 token 已过期，先获取 token
      if (!token || token.trim() === '') {
        // 先调用 getToken 接口获取 token
        token = await getToken()
        // 临时保存 token，以便后续请求使用
        auth.setAccessToken(token)
      } else if (currentUser?.exp) {
        // 检查 token 是否过期
        const now = Date.now()
        if (now >= currentUser.exp) {
          // Token 已过期，重新获取
          token = await getToken()
          auth.setAccessToken(token)
        }
      }

      // 获取到 token 后，调用注册接口
      const response = await memberSignUp(
        data.email,
        data.name,
        data.phone,
        data.password
      )

      toast.dismiss(loadingToast)
      if (response.status) {
        toast.success('Account created successfully! Please sign in.')
        navigate({ to: '/sign-in', replace: true })
      } else {
        toast.error(
          response.message || 'Failed to create account. Please try again.'
        )
      }
    } catch (error) {
      toast.dismiss(loadingToast)

      // 如果是 AuthError 且 errorCode 为 "1001"，跳转到登录页面
      if (error instanceof AuthError && error.errorCode === '1001') {
        const errorMessage =
          error.message || 'Registration failed. Please try again.'
        toast.error(errorMessage)
        // 跳转到登录页面
        navigate({ to: '/sign-in', replace: true })
      } else {
        // 其他错误直接显示提示（errorCode 为 "1001" 的情况已经在 API 层处理了 toast）
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create account. Please try again.'
        // 只有在不是 AuthError 或者 errorCode 不是 "1001" 时才显示 toast
        // （因为其他错误码已经在 API 层显示了 toast）
        if (!(error instanceof AuthError)) {
          toast.error(errorMessage)
        }
      }
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log('表单验证失败:', errors)
          // 显示第一个验证错误
          const firstError = Object.values(errors)[0]
          if (firstError?.message) {
            toast.error(firstError.message)
          }
        })}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {/* Full name */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder='Full name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email' type='email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='Confirm Password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => {
            const rawValue = field.value ?? ''
            // Match longest dial code prefix to get local number
            const matched = PHONE_COUNTRY_OPTIONS.slice()
              .sort((a, b) => b.dialCode.length - a.dialCode.length)
              .find((o) => rawValue.startsWith(`${o.dialCode}-`))
            const dialCode = matched?.dialCode ?? selectedPhoneCountry.dialCode
            const localNumber = matched
              ? rawValue.slice(dialCode.length + 1)
              : rawValue

            const currentOption =
              PHONE_COUNTRY_OPTIONS.find((o) => o.dialCode === dialCode) ??
              selectedPhoneCountry

            return (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <div className='flex items-center rounded-md border px-3 py-1.5'>
                    <Popover
                      open={phonePopoverOpen}
                      onOpenChange={setPhonePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type='button'
                          className='mr-3 flex items-center gap-1.5 border-r pr-3 text-sm text-muted-foreground hover:text-foreground'
                        >
                          <span
                            className={cn(
                              'fi flex-shrink-0',
                              `fi-${currentOption.code.toLowerCase()}`
                            )}
                            aria-hidden='true'
                          />
                          <span>{currentOption.dialCode}</span>
                          <ChevronDown className='h-4 w-4 shrink-0 opacity-50' />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-56 p-0' align='start'>
                        <ul className='max-h-64 overflow-y-auto py-1'>
                          {PHONE_COUNTRY_OPTIONS.map((opt) => (
                            <li key={opt.code}>
                              <button
                                type='button'
                                className={cn(
                                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent',
                                  currentOption.code === opt.code &&
                                    'bg-accent'
                                )}
                                onClick={() => {
                                  setSelectedPhoneCountry(opt)
                                  field.onChange(
                                    localNumber
                                      ? `${opt.dialCode}-${localNumber}`
                                      : ''
                                  )
                                  setPhonePopoverOpen(false)
                                }}
                              >
                                <span
                                  className={cn(
                                    'fi flex-shrink-0',
                                    `fi-${opt.code.toLowerCase()}`
                                  )}
                                  aria-hidden='true'
                                />
                                <span className='flex-1'>{opt.label}</span>
                                <span className='text-muted-foreground'>
                                  {opt.dialCode}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>
                    <Input
                      {...field}
                      value={localNumber}
                      onChange={(e) => {
                        const next = e.target.value.replace(/\D/g, '')
                        field.onChange(
                          next
                            ? `${currentOption.dialCode}-${next}`
                            : ''
                        )
                      }}
                      placeholder='Phone Number'
                      type='tel'
                      inputMode='tel'
                      className='border-0 px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name='acceptedTerms'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <div className='flex items-center gap-2'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className='text-muted-foreground !mt-0 text-xs font-normal'>
                  I have read{' '}
                  <a
                    href='https://www.dropsure.com/privacy-policy/#Terms'
                    className='text-primary underline underline-offset-4'
                    target='_blank'
                    rel='noreferrer'
                  >
                    User Registration Agreement
                  </a>{' '}
                  and{' '}
                  <a
                    href='https://www.dropsure.com/privacy-policy/'
                    className='text-primary underline underline-offset-4'
                    target='_blank'
                    rel='noreferrer'
                  >
                    Privacy Policy
                  </a>
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Account'}
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>
      </form>
    </Form>
  )
}
