import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'

const notificationsFormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean().default(false).optional(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
}

interface NotificationData {
  hzkj_security_emails: boolean
  hzkj_communication_emails: boolean
  hzkj_marketing_emails: boolean
  hzkj_social_emails: boolean
}

interface GetNotificationsResponse {
  data?: {
    rows: NotificationData[]
    totalCount?: number
  }
  rows?: NotificationData[]
  totalCount?: number
  errorCode: string
  message: string | null
  status: boolean
}

export function NotificationsForm() {
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  // 加载通知设置数据
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const userId = auth.user?.id
        if (!userId) {
          setIsLoading(false)
          return
        }

        // 调用获取通知设置的 API
        const response = await apiClient.post<GetNotificationsResponse>(
          '/v2/hzkj/hzkj_member/hzkj_member_customer/getNotifications',
          {
            data: {
              id: userId,
            },
            pageSize: 10,
            pageNo: 1,
          }
        )

        const rows = response.data?.data?.rows || response.data?.rows
        if (response.data?.status && rows && rows.length > 0) {
          const notificationData = rows[0]
          const formData = {
            communication_emails: Boolean(
              notificationData.hzkj_communication_emails
            ),
            marketing_emails: Boolean(notificationData.hzkj_marketing_emails),
            social_emails: Boolean(notificationData.hzkj_social_emails),
            security_emails: Boolean(notificationData.hzkj_security_emails),
            mobile: false,
          }

          console.log('回填的表单数据:', formData)

          form.reset(formData)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadNotifications()
  }, [auth.user?.id])

  const boolToString = (value: boolean | undefined): string => {
    return value ? '1' : '0'
  }

  const onSubmit = async (data: NotificationsFormValues) => {
    try {
      const userId = auth.user?.id

      const requestData = {
        data: [
          {
            id: userId,
            hzkj_security_emails: boolToString(data.security_emails),
            hzkj_communication_emails: boolToString(data.communication_emails),
            hzkj_marketing_emails: boolToString(data.marketing_emails),
            hzkj_social_emails: boolToString(data.social_emails),
          },
        ],
      }

      // 调用 API
      const response = await apiClient.post(
        '/v2/hzkj/hzkj_member/hzkj_member_customer/saveNotifications',
        requestData
      )

      if (response.data?.status !== false) {
        toast.success('Notifications updated successfully')
        form.setValue('mobile', false)
      } else {
        const errorMessage =
          response.data?.message || 'Failed to update notifications'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to update notifications:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update notifications. Please try again.'
      )
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground text-sm'>
          Loading notifications...
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='relative'>
          <h3 className='mb-4 text-lg font-medium'>Email Notifications</h3>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='communication_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Communication emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about your account activity.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='marketing_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Marketing emails
                    </FormLabel>
                    <FormDescription>
                      Receive emails about new products, features, and more.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='social_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Social emails</FormLabel>
                    <FormDescription>
                      Receive emails for friend requests, follows, and more.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='security_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Security emails</FormLabel>
                    <FormDescription>
                      Receive emails about your account activity and security.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name='mobile'
          render={({ field }) => (
            <FormItem className='relative flex flex-row items-start'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>
                  Use different settings for my mobile devices
                </FormLabel>
                <FormDescription>
                  You can manage your mobile notifications in the{' '}
                  <Link
                    to='/settings'
                    className='underline decoration-dashed underline-offset-4 hover:decoration-solid'
                  >
                    mobile settings
                  </Link>{' '}
                  page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type='submit'>Update notifications</Button>
      </form>
    </Form>
  )
}
