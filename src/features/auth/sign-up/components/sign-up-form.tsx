import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { AuthError, getToken, memberSignUp } from '@/lib/api/auth'
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
  email: z.email({
    message: 'Please enter a valid email address',
  }),
  name: z.string().min(1, 'Please enter your name'),
  phone: z
    .string()
    .min(1, 'Please enter your phone number')
    .regex(/^1[3-9]\d{9}$/, 'Please enter a valid phone number'),
  password: z.string().min(1, 'Please enter your password'),
})

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
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
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter your name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='Enter your phone number' {...field} />
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
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
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
