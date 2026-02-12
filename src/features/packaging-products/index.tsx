import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PackagingProductsGrid } from './components/packaging-products-grid'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/_authenticated/packaging-products/')

export function PackagingProducts() {
  const navigate = route.useNavigate()
  const search = route.useSearch()
  const activeTab = search.tab || 'packaging-products'

  const handleTabChange = (value: string) => {
    navigate({
      search: {
        ...search,
        tab: value as 'packaging-products' | 'my-packaging',
      },
    })
  }

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
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
              <PackagingProductsGrid tab='packaging-products' />
            </TabsContent>

            <TabsContent value='my-packaging' className='mt-0'>
              <PackagingProductsGrid tab='my-packaging' />
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
