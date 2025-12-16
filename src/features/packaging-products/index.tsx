import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PackagingProductsGrid } from './components/packaging-products-grid'
import { packagingProducts } from './data/data'

export function PackagingProducts() {
  const [activeTab, setActiveTab] = useState<
    'packaging-products' | 'my-packaging'
  >('packaging-products')

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'packaging-products' | 'my-packaging')
            }
            className='w-full'
          >
            <TabsList className='mb-4 grid h-9 w-fit grid-cols-2 gap-1'>
              <TabsTrigger
                value='packaging-products'
                className='data-[state=active]:text-primary flex h-8 items-center gap-2 px-3 py-1.5 text-sm'
              >
                Packaging Products
              </TabsTrigger>
              <TabsTrigger
                value='my-packaging'
                className='data-[state=active]:text-primary flex h-8 items-center gap-2 px-3 py-1.5 text-sm'
              >
                My Packaging
              </TabsTrigger>
            </TabsList>

            <TabsContent value='packaging-products' className='mt-0'>
              <PackagingProductsGrid data={packagingProducts} />
            </TabsContent>

            <TabsContent value='my-packaging' className='mt-0'>
              <PackagingProductsGrid data={packagingProducts} />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
