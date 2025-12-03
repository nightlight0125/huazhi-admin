import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SectionCards } from '@/components/section-cards'
import { QuotesDialogs } from './components/quotes-dialogs'
import { QuotesPrimaryButtons } from './components/quotes-primary-buttons'
import { QuotesProvider } from './components/quotes-provider'
import { QuotesTable } from './components/quotes-table'
import { quotes } from './data/data'

export function Quotes() {
  return (
    <QuotesProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-6'>
          <SectionCards />
        </div>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>询价管理</h2>
            <p className='text-muted-foreground'>
              管理您的产品询价请求和报价信息
            </p>
          </div>
          <QuotesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <QuotesTable data={quotes} />
        </div>
      </Main>

      <QuotesDialogs />
    </QuotesProvider>
  )
}
