import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { updatePassword } from '@/lib/api/users'
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
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  password: z.string(),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const userId = useAuthStore((state) => state.auth.user?.id)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // 如果能进入这个页面，说明已经通过路由认证检查
    // API 拦截器也会自动检查，所以这里直接使用即可

    const loadingToast = toast.loading('Updating password...')

    try {
      // 加密新密码
      const encryptedPassword = encryptPassword(data.password)

      // 调用重置密码 API（如果未认证，拦截器会自动处理）
      await updatePassword(Number(userId), encryptedPassword)

      toast.dismiss(loadingToast)
      toast.success('Password updated successfully!')
      form.reset()

      // 跳转到登录页面
      navigate({ to: '/sign-in' })
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update password. Please try again.'
      toast.error(errorMessage)
      console.error('Update password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Updating...
            </>
          ) : (
            <>
              Confirm
              <ArrowRight className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
