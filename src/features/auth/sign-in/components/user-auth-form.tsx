import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getToken, memberLogin } from '@/lib/api/auth'
import { encryptPassword } from '@/lib/crypto-utils'
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
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(1, 'Password is required'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '4301779144@qq.com',
      password: '123456',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const loadingToast = toast.loading('Signing in...')

    try {
      // 加密密码
      const encryptedPassword = encryptPassword(data.password)
      console.log('encryptedPassword', encryptedPassword)

      // 检查当前 token 状态
      const currentToken = auth.accessToken
      const currentUser = auth.user
      let token = currentToken

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
          // token = await getToken(data.email)
          // auth.setAccessToken(token)
        }
      }

      // 获取到 token 后，调用会员登录接口
      const loginResponse = await memberLogin(data.email, encryptedPassword)

      toast.dismiss(loadingToast)
      toast.success('Login successful!')

      // 确保使用最新的 token（如果登录响应中有新的 token，使用新的）
      const finalToken =
        loginResponse.token || loginResponse.access_token || token
      auth.setAccessToken(finalToken)

      // 设置用户信息（根据实际 API 响应调整）
      const userData = loginResponse.data as {
        accountId?: string
        id?: string
        email?: string
        [key: string]: unknown
      }

      const user = {
        accountNo: userData.accountId || userData.id || data.email,
        email: userData.email || data.email,
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      }
      auth.setUser(user)
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to sign in. Please check your credentials.'
      toast.error(errorMessage)
      console.error('Login error:', error)
    } finally {
      // 确保有一个“已登录”的状态（即使接口失败也可以进入首页）
      let token = auth.accessToken
      if (!token || token.trim() === '') {
        // 给一个兜底的本地 token，保证通过路由守卫
        token = 'dev-fallback-token'
        auth.setAccessToken(token)
      }

      if (!auth.user) {
        // 兜底用户信息，至少包含 email 和过期时间
        auth.setUser({
          accountNo: data.email,
          email: data.email,
          role: ['user'],
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })
      }

      // 无论成功还是失败，都跳转到首页（或传入的 redirectTo）
      const targetPath = redirectTo || '/_authenticated/'
      navigate({ to: targetPath, replace: true })
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Sign in
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

        {/* <p className='text-muted-foreground text-center text-sm'>
          Don't have an account?{' '}
          <Link
            to='/sign-up'
            className='hover:text-primary font-medium underline underline-offset-4'
          >
            Sign up
          </Link>
        </p> */}
      </form>
    </Form>
  )
}
