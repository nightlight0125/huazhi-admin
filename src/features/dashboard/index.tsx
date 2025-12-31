import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryCustomerUser, type CustomerUserItem } from '@/lib/api/users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HotSellingProducts } from './components/hot-selling-products'
import { Overview } from './components/overview'

const notifications = [
  {
    title: 'National Day & Mid-Autumn Festival Holiday Schedule',
    date: '2025-09-26',
  },
  {
    title: 'Announcement: Important Update Regarding PayPal Payment Method',
    date: '2025-09-04',
  },
  {
    title: 'Notice of the United States Shipping Price Update',
    date: '2025-05-14',
  },
  {
    title: 'Notice of United States Shipping Update',
    date: '2025-04-25',
  },
  {
    title: 'Payment Method Update Notification',
    date: '2025-03-19',
  },
  {
    title: 'Latest U.S. Tax Policy Notice',
    date: '2025-02-08',
  },
]

export function Dashboard() {
  const authUser = useAuthStore((state) => state.auth.user)
  const [customerUser, setCustomerUser] = useState<CustomerUserItem | null>(
    null
  )

  // 获取客户用户信息
  useEffect(() => {
    const fetchCustomerUser = async () => {
      const userId = authUser?.id
      if (!userId) {
        console.warn('No user ID available')
        return
      }

      try {
        const userData = await queryCustomerUser(userId, 1, 10)
        setCustomerUser(userData)
        console.log('客户用户数据:', userData)
      } catch (error) {
        console.error('Failed to fetch customer user:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load customer user. Please try again.'
        )
        setCustomerUser(null)
      }
    }

    void fetchCustomerUser()
  }, [authUser?.id])

  // 使用 API 返回的数据，如果没有则使用 auth store 的数据作为后备
  const user = customerUser
    ? {
        username:
          customerUser.hzkj_biz_user_username ||
          customerUser.hzkj_biz_user_name ||
          '',
        phone: customerUser.hzkj_biz_user_phone || '',
        email: customerUser.hzkj_biz_user_email || '',
        picture: customerUser.hzkj_biz_user_picturefield || '',
      }
    : {
        username: authUser?.username || '',
        phone: authUser?.phone || '',
        email: authUser?.email || '',
        picture: '',
      }

  return (
    <>
      <Header>
        <HeaderActions />
      </Header>

      <Main fluid>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <div className='flex flex-col gap-4 lg:flex-row'>
              <div className='min-w-0 flex-1'>
                <h2 className='mb-4 text-lg font-bold'>Dashboard</h2>

                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        New Orders
                      </CardTitle>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        className='text-muted-foreground h-4 w-4'
                      >
                        <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>$45,231.89</div>
                      <p className='text-muted-foreground text-xs'>
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Awaiting Payment
                      </CardTitle>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        className='text-muted-foreground h-4 w-4'
                      >
                        <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                        <circle cx='9' cy='7' r='4' />
                        <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>+2350</div>
                      <p className='text-muted-foreground text-xs'>
                        +180.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Paid Orders
                      </CardTitle>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        className='text-muted-foreground h-4 w-4'
                      >
                        <rect width='20' height='14' x='2' y='5' rx='2' />
                        <path d='M2 10h20' />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>+12,234</div>
                      <p className='text-muted-foreground text-xs'>
                        +19% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>
                        Support Tickets
                      </CardTitle>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        className='text-muted-foreground h-4 w-4'
                      >
                        <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>+573</div>
                      <p className='text-muted-foreground text-xs'>
                        +201 since last hour
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className='mt-12'>
                  <Overview />
                </div>
                <HotSellingProducts />
              </div>
              <div className='w-full space-y-3 lg:w-[320px] lg:flex-shrink-0 xl:w-[340px] 2xl:w-[360px]'>
                {/* Account Balance */}
                <div>
                  <h2 className='mb-2 text-base font-bold'>Account Balance</h2>
                  <Card>
                    <CardContent className='flex items-center gap-3 py-3'>
                      <div>
                        <p className='text-foreground text-xl font-bold'>$0</p>
                      </div>
                      <div className='bg-border h-10 w-px' />
                      <div>
                        <p className='text-muted-foreground text-xl font-bold'>
                          €0.00
                        </p>
                      </div>
                      <div className='bg-border h-10 w-px' />
                      <a
                        href='#'
                        className='text-primary flex items-center text-xs font-medium hover:underline'
                      >
                        View Transactions
                      </a>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className='mb-2 text-base font-bold'>
                    My Account Managers
                  </h2>
                  <Card className=''>
                    <CardContent className='flex items-center justify-between py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex flex-col items-center gap-1'>
                          {user.picture ? (
                            <img
                              src={user.picture}
                              alt={user.username}
                              className='h-12 w-12 rounded-full object-cover'
                            />
                          ) : (
                            <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold'>
                              {user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <p className='text-sm font-semibold'>
                            {user.username || ''}
                          </p>
                        </div>
                        <div className='flex flex-col gap-0.5'>
                          {user?.phone && (
                            <a
                              href={`https://api.whatsapp.com/send/?phone=${user.phone}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(
                                  `https://api.whatsapp.com/send/?phone=${user.phone}`,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }}
                              className='text-primary cursor-pointer text-xs hover:underline'
                              style={{ pointerEvents: 'auto' }}
                            >
                              {user.phone}
                            </a>
                          )}
                          {user?.email && (
                            <a
                              href={`mailto:${user.email}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = `mailto:${user.email}`
                              }}
                              className='text-primary cursor-pointer text-xs hover:underline'
                              style={{ pointerEvents: 'auto' }}
                            >
                              {user.email}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {user?.phone && (
                          <button
                            onClick={() => {
                              window.open(
                                `https://api.whatsapp.com/send/?phone=${user.phone}`,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }}
                            className='bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-8 items-center justify-center rounded-full transition-colors'
                          >
                            <svg
                              className='h-4 w-4'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                            </svg>
                          </button>
                        )}
                        {user?.email && (
                          <button
                            onClick={() => {
                              window.location.href = `mailto:${user.email}`
                            }}
                            className='border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground flex h-8 w-8 items-center justify-center rounded-full border transition-colors'
                          >
                            <svg
                              className='h-4 w-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notifications */}
                <div>
                  <h2 className='mb-2 text-base font-bold'>Notifications</h2>
                  <Card>
                    <CardContent className='py-3'>
                      <div className='space-y-0 divide-y'>
                        {notifications.map((notification, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between py-3 ${
                              index === 0 ? 'first:pt-0' : ''
                            } ${index === notifications.length - 1 ? 'last:pb-0' : ''}`}
                          >
                            <div className='flex-1'>
                              <p className='text-sm font-medium'>
                                {notification.title}
                              </p>
                            </div>
                            <div className='flex items-center gap-4'>
                              <div className='text-primary text-sm hover:underline'>
                                Read More
                              </div>
                              <span className='text-xs'>
                                {notification.date}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
