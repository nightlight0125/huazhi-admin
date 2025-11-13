import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { PublishedProductsTable } from './components/published-products-table'
import { publishedProducts } from './data/data'

type PublishedStatus = 'published' | 'publishing' | 'failed'

export function PublishedProducts() {
  const [activeTab, setActiveTab] = useState<PublishedStatus>('published')

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PublishedStatus)}
          className='w-full'
        >
          <TabsList className='grid w-fit grid-cols-3'>
            <TabsTrigger value='published'>Published</TabsTrigger>
            <TabsTrigger value='publishing'>Publishing</TabsTrigger>
            <TabsTrigger value='failed'>Failed</TabsTrigger>
          </TabsList>

          <TabsContent value='published' className='mt-4'>
            <PublishedProductsTable
              data={publishedProducts}
              status='published'
            />
          </TabsContent>

          <TabsContent value='publishing' className='mt-4'>
            <PublishedProductsTable
              data={publishedProducts}
              status='publishing'
            />
          </TabsContent>

          <TabsContent value='failed' className='mt-4'>
            <PublishedProductsTable data={publishedProducts} status='failed' />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
