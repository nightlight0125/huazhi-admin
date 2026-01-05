import { useMemo, useState } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { CommissionRecordsTable } from './components/commission-records-table'
import { RecommendedListTable } from './components/recommended-list-table'
import { WithdrawRecordsTable } from './components/withdraw-records-table'
import { commissionRecords, withdrawRecords } from './data/data'

export function AffiliatePlan() {
  const [referralLink] = useState(
    'https://app.dropsure.com/RetailerLogin/Register/MjAyMDY%3d'
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      // TODO: 可以在这里加一个 toast 提示
    } catch (e) {
      console.error('Copy failed', e)
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
        <Tabs defaultValue='referral-links' className='w-full'>
          <TabsList className='mb-4 h-10'>
            <TabsTrigger
              value='referral-links'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Referral Links
            </TabsTrigger>
            <TabsTrigger
              value='commission-records'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Commission Records
            </TabsTrigger>
            <TabsTrigger
              value='withdraw-records'
              className='data-[state=active]:text-primary px-4 text-sm'
            >
              Withdraw Records
            </TabsTrigger>
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
                  value={referralLink}
                  readOnly
                  className='flex-1 rounded-none border-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm'
                />
                <Button
                  type='button'
                  onClick={handleCopy}
                  className='bg-primary hover:bg-primary/90 rounded-none px-4 text-xs font-semibold'
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
            <WithdrawRecordsTable data={withdrawRecords} />
          </TabsContent>

          <TabsContent value='recommended-list'>
            <RecommendedListTable />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
