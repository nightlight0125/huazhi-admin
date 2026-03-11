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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  // 图片验证码（右侧图片上的验证码）
  imageCode: z.string().optional(),
  // 邮箱收到的验证码
  code: z.string().optional(),
  // 新密码
  password: z.string().optional(),
})

type Step = 'request' | 'verify'

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
  const [captchaCode, setCaptchaCode] = useState<string>('')
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false)
  const [showPasswordSuccessDialog, setShowPasswordSuccessDialog] =
    useState(false)

  useEffect(() => {
    onStepChange?.(step)
  }, [step, onStepChange])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // 不给 imageCode 设置默认值，防止出现看起来像「默认验证码」的情况
    defaultValues: { email: '', code: '', password: '' },
  })

  const handleRefreshCaptcha = async () => {
    const emailValue = form.getValues('email')
    if (!emailValue) {
      toast.error('Please enter your email address first.')
      return
    }
    // 确保输入框每次都是空的（避免显示上一次/自动填充的值）
    form.resetField('imageCode', { defaultValue: '' })
    setIsLoadingCaptcha(true)
    setCaptchaCode('')
    try {
      const res = await getResetPassWordCode(emailValue)
      const raw = res.data ?? (res as any).code ?? (res as any).number
      if (raw != null) {
        setCaptchaCode(String(raw))
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to get verification code. Please try again.'
      )
    } finally {
      setIsLoadingCaptcha(false)
    }
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
      // 第一步：带上图片验证码，调用 sendCode 接口，让后端向邮箱发送验证码
      await sendCodeApi(data.email, data.imageCode.trim())

      toast.dismiss(loadingToast)
      toast.success(
        'The verification code has been sent to the mailbox, please check the email!'
      )
      setSentEmail(data.email)
      setStep('verify')
      onStepChange?.('verify')
    } catch (error) {
      toast.dismiss(loadingToast)
      const err = error as any
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to send verification code. Please try again.'

      // 特殊处理：验证码已发送（errorCode === '1001'）
      if (err?.errorCode === '1001') {
        // 切到 verify 步骤，并在验证码输入框下展示后端文案
        setSentEmail(data.email)
        setStep('verify')
        onStepChange?.('verify')

        form.setError('code', {
          type: 'manual',
          message:
            errorMessage ||
            'Verification code already sent, please do not request again.',
        })

        // 可选：给一个 info 提示，而不是错误 toast
        toast.info(
          errorMessage ||
            'Verification code already sent, please check your email.'
        )
      } else {
        toast.error(errorMessage)
      }

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

    const loadingToast = toast.loading('Resetting password...')
    try {
      // 第二步：带上邮箱中的验证码，调用 resetPassword（后端发送新密码邮件）
      await resetPassword(sentEmail!, data.code.trim())

      toast.dismiss(loadingToast)
      setShowPasswordSuccessDialog(true)
    } catch (error) {
      toast.dismiss(loadingToast)
      const err = error as any
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to reset password. Please try again.'

      // 邮箱验证码无效或已过期，需要回到第一步重新获取验证码
      if (err?.errorCode === '1001') {
        // 清空表单所有相关输入，让用户从第一步重新填写
        form.reset({
          email: '',
          imageCode: '',
          code: '',
          password: '',
        })
        setCaptchaCode('')
        setSentEmail(null)

        setStep('request')
        onStepChange?.('request')
        // 不再展示红色错误提示，相当于重新走一遍 Retrieve password 流程
      } else {
        toast.error(errorMessage)
      }

      console.error('Reset password error:', error)
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (step === 'request') {
        await handleRequestCode(data)
      } else {
        await handleVerifyCode(data)
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
                      autoComplete='off'
                      {...field}
                      onChange={(e) => {
                        // 输入邮箱时，强制清空验证码输入框，避免浏览器自动填充/沿用旧值
                        field.onChange(e)
                        form.setValue('imageCode', '')
                      }}
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
                  <FormLabel>
                    Please enter the verification code on the right
                  </FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        placeholder='Verification code'
                        autoComplete='off'
                        {...field}
                      />
                      <button
                        type='button'
                        className='bg-muted/50 text-foreground flex h-10 w-24 min-w-24 items-center justify-center overflow-hidden rounded border font-mono text-lg font-bold tracking-widest'
                        onClick={() => void handleRefreshCaptcha()}
                        disabled={isLoadingCaptcha}
                      >
                        {isLoadingCaptcha ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : captchaCode ? (
                          captchaCode
                        ) : (
                          <span className='text-muted-foreground px-1 text-center text-[11px] leading-tight'>
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

        <Button type='submit' className='mt-2 w-full' disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : step === 'request' ? (
            'Send Verification Code'
          ) : (
            'Send Instructions'
          )}
        </Button>
      </form>

      {/* 密码重置成功 - 点击确认跳转登录页 */}
      {showPasswordSuccessDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-background w-full max-w-sm rounded-lg p-6 text-center shadow-lg'>
            <h2 className='mb-2 text-lg font-semibold'>
              Password sent successfully
            </h2>
            <p className='text-muted-foreground mb-6 text-sm'>
              The password has been sent to the email address, please check
              email!
            </p>
            <Button
              onClick={() => {
                setShowPasswordSuccessDialog(false)
                navigate({ to: '/sign-in' })
              }}
              className='bg-orange-600 hover:bg-orange-700'
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </Form>
  )
}
