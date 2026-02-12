import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { AssociatedStoreProductsTable } from './components/associated-store-products-table'
import { NotAssociatedConnectionView } from './components/not-associated-connection-view'
import { StoreProductsDialogs } from './components/store-products-dialogs'
import { StoreProductsProvider } from './components/store-products-provider'

type AssociateStatus = 'associated' | 'not-associated'

export function StoreProducts() {
  const [activeTab, setActiveTab] = useState<AssociateStatus>('associated')

  return (
    <StoreProductsProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AssociateStatus)}
          className='w-full'
        >
          <TabsList className='grid w-fit grid-cols-2'>
            <TabsTrigger
              value='associated'
              className='data-[state=active]:text-primary'
            >
              Associated
            </TabsTrigger>
            <TabsTrigger
              value='not-associated'
              className='data-[state=active]:text-primary'
            >
              Not Associated
            </TabsTrigger>
          </TabsList>

          <TabsContent value='associated' className='mt-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <AssociatedStoreProductsTable />
            </div>
          </TabsContent>

          <TabsContent value='not-associated' className='mt-4'>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
              <NotAssociatedConnectionView />
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <StoreProductsDialogs />
    </StoreProductsProvider>
  )
}
