import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProductConnectionsDialogs } from './components/product-connections-dialogs'
import { ProductConnectionsProvider } from './components/product-connections-provider'
import { ProductConnectionsTable } from './components/product-connections-table'
import { productConnections } from './data/data'

export function ProductConnections() {
  return (
    <ProductConnectionsProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>产品连接</h2>
            <p className='text-muted-foreground'>
              管理您的产品连接和运输信息
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ProductConnectionsTable data={productConnections} />
        </div>
      </Main>

      <ProductConnectionsDialogs />
    </ProductConnectionsProvider>
  )
}
