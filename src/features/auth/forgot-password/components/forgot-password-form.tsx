import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getResetPassWordCode,
  resetPassword,
  sendCode as sendCodeApi,
} from '@/lib/api/auth'
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  // 图片验证码（右侧图片上的验证码）
  imageCode: z.string().optional(),
  code: z.string().optional(),
  password: z.string().optional(),
})

type Step = 'request' | 'verify' | 'reset'

export function ForgotPasswordForm({
  className,
  onStepChange,
  ...props
}: React.HTMLAttributes<HTMLFormElement> & {
  onStepChange?: (step: Step) => void
}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('request')
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null)
  const [captchaUrl, setCaptchaUrl] = useState<string>('')

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', imageCode: '', code: '', password: '' },
  })

  const handleRefreshCaptcha = () => {
    const emailValue = form.getValues('email')
    if (!emailValue) {
      toast.error('Please enter your email address first.')
      return
    }
    // 通过附加时间戳避免浏览器缓存
    const url = `/captcha?email=${encodeURIComponent(emailValue)}&t=${Date.now()}`
    setCaptchaUrl(url)
  }

  async function handleRequestCode(data: z.infer<typeof formSchema>) {
    if (!data.imageCode?.trim()) {
      form.setError('imageCode', {
        type: 'manual',
        message: 'Please enter the verification code on the right.',
      })
      return
    }

    const loadingToast = toast.loading('Sending verification code...')
    try {
      await getResetPassWordCode(data.email)

      toast.dismiss(loadingToast)
      toast.success('Verification code sent to your email.')
      setSentEmail(data.email)
      setStep('verify')
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send verification code. Please try again.'
      toast.error(errorMessage)
      console.error('Send code error:', error)
    }
  }

  async function handleVerifyCode(data: z.infer<typeof formSchema>) {
    if (!data.code?.trim()) {
      form.setError('code', {
        type: 'manual',
        message: 'Please enter the verification code.',
      })
      return
    }

    const loadingToast = toast.loading('Verifying code...')
    try {
      await sendCodeApi(sentEmail!, data.code.trim())

      toast.dismiss(loadingToast)
      toast.success('Verification successful.')
      setVerifiedCode(data.code.trim())
      setStep('reset')
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Verification failed. Please check the code and try again.'
      toast.error(errorMessage)
      console.error('Verify code error:', error)
    }
  }

  async function handleResetPassword(data: z.infer<typeof formSchema>) {
    if (!data.password?.trim()) {
      form.setError('password', {
        type: 'manual',
        message: 'Please enter your new password.',
      })
      return
    }
    if (!verifiedCode) {
      toast.error('Verification code is missing. Please start over.')
      return
    }

    const loadingToast = toast.loading('Resetting password...')
    try {
      await resetPassword(
        sentEmail!,
        data.password.trim(),
        verifiedCode
      )

      toast.dismiss(loadingToast)
      toast.success('Password reset successfully! Please log in.')
      navigate({ to: '/sign-in' })
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to reset password. Please try again.'
      toast.error(errorMessage)
      console.error('Reset password error:', error)
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (step === 'request') {
        await handleRequestCode(data)
      } else if (step === 'verify') {
        await handleVerifyCode(data)
      } else {
        await handleResetPassword(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3 text-left', className)}
        {...props}
      >
        {step === 'request' && (
          <>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='name@example.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='imageCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please enter the verification code on the right</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        placeholder='Verification code'
                        {...field}
                      />
                      <button
                        type='button'
                        className='flex h-10 w-24 items-center justify-center overflow-hidden rounded border bg-white'
                        onClick={handleRefreshCaptcha}
                      >
                        {captchaUrl ? (
                          <img
                            src={captchaUrl}
                            alt='Verification code'
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <span className='px-1 text-[11px] leading-tight text-muted-foreground'>
                            Click to get code
                          </span>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 'verify' && (
          <>
            {sentEmail && (
              <p className='mb-1 text-center text-sm font-medium'>
                <span className='text-muted-foreground'>Reset for:</span>{' '}
                {sentEmail}
              </p>
            )}
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter the code from your email'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {step === 'reset' && (
          <>
            {sentEmail && (
              <p className='mb-1 text-center text-sm font-medium'>
                <span className='text-muted-foreground'>Reset for:</span>{' '}
                {sentEmail}
              </p>
            )}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type='submit' className='mt-2 w-full' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : step === 'request' ? (
            'Send Verification Code'
          ) : step === 'verify' ? (
            'Send Instructions'
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </Form>
  )
}
