import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { BrandsDialogs } from './components/brands-dialogs'
import { BrandsProvider } from './components/brands-provider'
import { BrandItemsTable } from './components/brand-items-table'
import { AddBrandItemDialog } from './components/add-brand-item-dialog'
import { brandTypeGroups } from './data/data'
import { type BrandType } from './data/schema'

export function Brands() {
  const [activeTab, setActiveTab] = useState<BrandType>('logo')
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const handleCreateItem = () => {
    setAddDialogOpen(true)
  }

  const handleAddBrandItem = (data: any) => {
    console.log('添加品牌项目:', data)
    alert(`成功添加${data.brandType}项目: ${data.name}`)
    // 这里可以调用API添加品牌项目
  }

  return (
    <BrandsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>品牌管理</h2>
            <p className='text-muted-foreground'>
              管理您的品牌设计文件，包括Logo、卡片、产品包装和运输包装
            </p>
          </div>
          <Button onClick={handleCreateItem}>
            <Plus className='mr-2 h-4 w-4' />
            添加品牌项目
          </Button>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BrandType)}>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='logo'>Logo</TabsTrigger>
              <TabsTrigger value='card'>卡片</TabsTrigger>
              <TabsTrigger value='product_packaging'>产品包装</TabsTrigger>
              <TabsTrigger value='shipping_packaging'>运输包装</TabsTrigger>
            </TabsList>
            
            {brandTypeGroups.map((group) => (
              <TabsContent key={group.type} value={group.type} className='mt-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='text-lg font-semibold'>{group.label}</h3>
                      <p className='text-sm text-muted-foreground'>
                        管理您的{group.label}设计文件
                      </p>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      共 {group.items.length} 个项目
                    </div>
                  </div>
                  <BrandItemsTable data={group.items} brandType={group.type} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Main>

      <BrandsDialogs />
      <AddBrandItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        brandType={activeTab}
        onAdd={handleAddBrandItem}
      />
    </BrandsProvider>
  )
}
