import { useEffect, useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { queryCustomerTrace } from '@/lib/api/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { CommissionRecordsTable } from './components/commission-records-table'
import { RecommendedListTable } from './components/recommended-list-table'
import { WithdrawRecordsTable } from './components/withdraw-records-table'
import { commissionRecords } from './data/data'

export function AffiliatePlan() {
  const { auth } = useAuthStore()
  const [referralLink, setReferralLink] = useState(
    'https://app.dropsure.com/RetailerLogin/Register/MjAyMDY%3d'
  )
  const [isLoadingLink, setIsLoadingLink] = useState(false)
  const [activeTab, setActiveTab] = useState('referral-links')

  // 当切换到 Referral Links tab 时，获取注册链接
  useEffect(() => {
    const fetchRegistrationLink = async () => {
      const userId = auth.user?.customerId || auth.user?.id
      if (!userId || activeTab !== 'referral-links') {
        return
      }

      setIsLoadingLink(true)
      try {
        const result = await queryCustomerTrace(String(userId), 1, 10)

        // 从返回的 rows 数组中获取第一个元素的 hzkj_registration_link 字段
        if (result.rows && result.rows.length > 0) {
          const registrationLink = result.rows[0]?.hzkj_registration_link
          if (registrationLink && typeof registrationLink === 'string') {
            setReferralLink(registrationLink)
          }
        }
      } catch (error) {
        console.error('Failed to fetch registration link:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load registration link. Please try again.'
        )
      } finally {
        setIsLoadingLink(false)
      }
    }

    void fetchRegistrationLink()
  }, [activeTab, auth.user?.customerId, auth.user?.id])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast.success('Link copied to clipboard')
    } catch (e) {
      console.error('Copy failed', e)
      toast.error('Failed to copy link')
    }
  }

  const totalCommission = useMemo(() => {
    return commissionRecords.reduce((sum, record) => sum + record.commission, 0)
  }, [])

  const handleCashOut = () => {
    // TODO: Implement cash out logic
    console.log('Cash out clicked')
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='mb-4 h-10'>
            <TabsTrigger
              value='referral-links'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Referral Links
            </TabsTrigger>
            {/* <TabsTrigger
              value='commission-records'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Commission Records
            </TabsTrigger> */}
            {/* <TabsTrigger
              value='withdraw-records'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Withdraw Records
            </TabsTrigger> */}
            <TabsTrigger
              value='recommended-list'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Recommended List
            </TabsTrigger>
          </TabsList>

          <TabsContent value='referral-links' className='space-y-8'>
            {/* Recommended link section */}
            <div className='space-y-3'>
              <h2 className='text-lg font-medium'>Recommended link</h2>
              <div className='bg-background flex h-10 overflow-hidden rounded-md border text-sm shadow-sm'>
                <Input
                  value={isLoadingLink ? 'Loading...' : referralLink}
                  readOnly
                  disabled={isLoadingLink}
                  className='flex-1 rounded-none border-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm'
                />
                <Button
                  type='button'
                  onClick={handleCopy}
                  disabled={isLoadingLink}
                  className='bg-primary hover:bg-primary/90 rounded-none px-4 text-xs font-semibold disabled:opacity-50'
                >
                  <Copy className='mr-1 h-3 w-3' />
                  Copy
                </Button>
              </div>
            </div>

            {/* Dropsure Affiliate Program section */}
            <div className='space-y-4'>
              <h2 className='text-lg font-medium'>
                Dropsure Affiliate Program
              </h2>
              <div className='flex flex-col items-start gap-8 lg:flex-row'>
                {/* Left side - Illustration */}

                {/* Right side - Steps */}
                <div className='flex-1 space-y-6'>
                  <div className='space-y-2'>
                    <div className='flex items-start gap-3'>
                      <div className='bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
                        1
                      </div>
                      <p className='pt-1 text-sm leading-relaxed'>
                        Become a Dropsure Affiliate and make money by promoting
                        Dropsure with your friends and followers.
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-start gap-3'>
                      <div className='bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
                        2
                      </div>
                      <p className='pt-1 text-sm leading-relaxed'>
                        When they sign up and start placing orders on Dropsure.
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-start gap-3'>
                      <div className='bg-primary text-primary-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold'>
                        3
                      </div>
                      <p className='pt-1 text-sm leading-relaxed'>
                        You will get 1% commission of orders your customer
                        placed on Dropsure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='commission-records'>
            <CommissionRecordsTable
              data={commissionRecords}
              totalCommission={totalCommission}
              onCashOut={handleCashOut}
            />
          </TabsContent>

          <TabsContent value='withdraw-records'>
            <WithdrawRecordsTable />
          </TabsContent>

          <TabsContent value='recommended-list'>
            <RecommendedListTable />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
