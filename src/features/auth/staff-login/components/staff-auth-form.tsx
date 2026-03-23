import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { getToken, idLogin } from '@/lib/api/auth'
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
  accountId: z.string().min(1, 'Please enter Account ID'),
  bizUserId: z.string().min(1, 'Please enter Biz User ID'),
})

interface StaffAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function StaffAuthForm({
  className,
  redirectTo,
  ...props
}: StaffAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: '',
      bizUserId: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const loadingToast = toast.loading('Signing in...')

    try {
      let token = auth.accessToken
      if (!token || token.trim() === '') {
        token = await getToken()
        auth.setAccessToken(token)
      }
      if (!token || token.trim() === '') {
        throw new Error('Failed to get access token. Please try again.')
      }

      const loginResponse = await idLogin(data.accountId, data.bizUserId)

      const finalToken =
        loginResponse.token || loginResponse.access_token || token
      if (!finalToken || finalToken.trim() === '') {
        throw new Error('Failed to get valid token. Please try again.')
      }

      auth.setAccessToken(finalToken)

      const userData = loginResponse.data as {
        accountId?: string
        id?: string
        email?: string
        roleId?: string
        hzkj_whatsapp1?: string
        customerId?: string
        user?: {
          id?: string
          username?: string
          roleId?: string
          hzkj_whatsapp1?: string
          customerId?: string
        }
        [key: string]: unknown
      }

      const user = {
        accountNo: userData.accountId || userData.id || data.accountId,
        email: userData.email || '',
        role: ['user'],
        exp: Date.now() + 3 * 60 * 60 * 1000,
        id: userData.user?.id || userData.id || data.bizUserId || '',
        username: userData.user?.username || data.accountId || '',
        roleId: userData.roleId || userData.user?.roleId || '',
        hzkj_whatsapp1:
          userData.user?.hzkj_whatsapp1 || userData.hzkj_whatsapp1 || '',
        customerId: userData.user?.customerId || userData.customerId || '',
      }
      auth.setUser(user)

      try {
        const { queryRole } = await import('@/lib/api/users')
        const roleList = await queryRole(1, 100)
        auth.setRoles(roleList)
      } catch {
        // 不阻止登录流程
      }

      toast.dismiss(loadingToast)
      toast.success('Login successful!')

      if (redirectTo) {
        navigate({ to: redirectTo as any, replace: true })
      } else {
        navigate({ to: '/', replace: true })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to sign in. Please check Account ID and Biz User ID.'
      toast.error(errorMessage)
      console.error('Staff login error:', error)
    } finally {
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
          name='accountId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account ID</FormLabel>
              <FormControl>
                <Input placeholder='Enter account ID' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bizUserId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biz User ID</FormLabel>
              <FormControl>
                <Input placeholder='Enter biz user ID' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2 w-full' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className='mt-3 text-center text-sm'>
          <Link
            to='/sign-in'
            className='text-muted-foreground hover:text-foreground underline underline-offset-4'
          >
            Back to normal login
          </Link>
        </div>
      </form>
    </Form>
  )
}
