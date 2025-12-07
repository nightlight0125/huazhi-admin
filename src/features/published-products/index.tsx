import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PublishedProductsTable } from './components/published-products-table'
import { publishedProducts } from './data/data'

type PublishedStatus = 'published' | 'publishing' | 'failed'

export function PublishedProducts() {
  const [activeTab, setActiveTab] = useState<PublishedStatus>('published')

  return (
    <>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PublishedStatus)}
          className='w-full'
        >
          <TabsList className='grid w-fit grid-cols-2'>
            <TabsTrigger
              value='published'
              className='data-[state=active]:text-primary'
            >
              Published
            </TabsTrigger>
            <TabsTrigger
              value='failed'
              className='data-[state=active]:text-primary'
            >
              Failed
            </TabsTrigger>
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
