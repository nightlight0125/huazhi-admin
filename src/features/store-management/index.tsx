import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RichTextEditor } from '@/components/rich-text-editor'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksProvider } from '../tasks/components/tasks-provider'
import { StoresTable } from './components/stores-table'
import { stores } from './data/stores'

const platformButtons = [
  {
    name: 'Shopify',
    icon: '/src/assets/brand-icons/shopify.png',
    color: 'text-green-600',
  },
]

export function StoreManagement() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <TasksProvider>
      <Header>
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        {/* Add Store Section */}
        <Card className='mb-6'>
          <CardContent className=''>
            <div className='text-sm font-medium'>Add Store</div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3 rounded-lg px-4 py-3'>
                {platformButtons.map((platform) => (
                  <button
                    key={platform.name}
                    type='button'
                    className='flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50'
                    onClick={() => setDrawerOpen(true)}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className='h-4 w-4 object-contain'
                    />
                    <span>{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StoresTable data={stores} />
        </div>

        {/* 右侧抽屉 */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side='right'
            className='flex h-full w-full flex-col sm:!w-[80vw] sm:!max-w-none'
          >
            {/* 左侧菜单 + 右侧内容 */}
            <div className='flex h-full text-base'>
              {/* 左侧：Listing 类型菜单 */}
              <div className='w-48 border-r bg-gray-50 px-3 py-4'>
                <div className='mb-2 font-semibold'>Manual Listing</div>
                <button className='mb-1 flex w-full items-center rounded-sm bg-orange-500/10 px-2 py-1.5 text-left font-medium text-orange-600'>
                  Custom Editing
                </button>
                <div className='text-muted-foreground mt-4 mb-2 font-semibold'>
                  Template Listing
                </div>
                <button className='text-muted-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left hover:bg-gray-200'>
                  Add New Template
                </button>
              </div>

              {/* 右侧：Tabs + 表单内容 */}
              <div className='flex flex-1 flex-col'>
                <Tabs defaultValue='products' className='flex flex-1 flex-col'>
                  {/* 顶部 Tabs 和提示条 */}
                  <div className='border-b px-6 pt-3 pb-2'>
                    <TabsList className='mb-2 h-8 rounded-none border-b bg-transparent p-0'>
                      <TabsTrigger
                        value='products'
                        className='rounded-none border-b-2 border-transparent px-4 text-base data-[state=active]:border-orange-500 data-[state=active]:text-orange-500'
                      >
                        Products
                      </TabsTrigger>
                      <TabsTrigger
                        value='variant-pricing'
                        className='rounded-none border-b-2 border-transparent px-4 text-base data-[state=active]:border-orange-500 data-[state=active]:text-orange-500'
                      >
                        Variant Pricing
                      </TabsTrigger>
                      <TabsTrigger
                        value='images'
                        className='rounded-none border-b-2 border-transparent px-4 text-base data-[state=active]:border-orange-500 data-[state=active]:text-orange-500'
                      >
                        Images &amp; Videos
                      </TabsTrigger>
                      <TabsTrigger
                        value='description'
                        className='rounded-none border-b-2 border-transparent px-4 text-base data-[state=active]:border-orange-500 data-[state=active]:text-orange-500'
                      >
                        Description
                      </TabsTrigger>
                    </TabsList>
                    <div className='bg-orange-50 px-3 py-1 text-orange-700'>
                      Product data is provided directly by suppliers. Although
                      CJ is committed to protecting intellectual property
                      rights, it cannot ensure that all potential intellectual
                      property disputes are avoided.
                    </div>
                  </div>

                  {/* Tabs 内容 */}
                  <TabsContent
                    value='products'
                    className='flex-1 overflow-auto px-6 py-4 text-base'
                  >
                    <div className='space-y-4'>
                      <div className='space-y-1'>
                        <div className='text-muted-foreground font-medium'>
                          * Store Selection
                        </div>
                        <Input placeholder='Enter Store Name' className='h-8' />
                      </div>

                      <div className='space-y-1'>
                        <div className='text-muted-foreground font-medium'>
                          * Title
                        </div>
                        <Input
                          placeholder='Fashion Ozzy Christmas Elf Doll Xmas Trees Decoration Ornaments Music Godfather Classic Sitting Posture Noel Elf Plush Toys'
                          className='h-8'
                        />
                      </div>

                      <div className='space-y-1'>
                        <div className='text-muted-foreground font-medium'>
                          Tags
                        </div>
                        <Input placeholder='Please add new' className='h-8' />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='variant-pricing'
                    className='flex-1 overflow-auto px-6 py-4 text-base'
                  >
                    <div className='space-y-4'>
                      {/* Top shipping method row */}
                      <div className='space-y-2 rounded-md bg-orange-50 px-4 py-3'>
                        <div className='font-semibold'>
                          Set a Default Shipping Method on CJ
                        </div>
                        <div className='mt-2 grid gap-3 md:grid-cols-3'>
                          <div className='space-y-1'>
                            <div className='text-muted-foreground'>
                              * Shipping From
                            </div>
                            <Select defaultValue='china'>
                              <SelectTrigger className='h-8'>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='china'>China</SelectItem>
                                <SelectItem value='usa'>USA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='space-y-1'>
                            <div className='text-muted-foreground'>
                              Ship My Order(s) Most to
                            </div>
                            <Select defaultValue='anywhere'>
                              <SelectTrigger className='h-8'>
                                <SelectValue placeholder='Select' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='anywhere'>
                                  Ship from anywhere
                                </SelectItem>
                                <SelectItem value='usa'>USA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='space-y-1'>
                            <div className='text-muted-foreground'>
                              Shipping Method
                            </div>
                            <Select>
                              <SelectTrigger className='h-8'>
                                <SelectValue placeholder='Select shipping method' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='default'>Default</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className='text-muted-foreground mt-2 grid gap-3 md:grid-cols-3'>
                          <div>Estimated Delivery Time: --</div>
                          <div>Shipping Cost: --</div>
                          <div>Tracking Information: --</div>
                        </div>
                      </div>

                      {/* Variant pricing table */}
                      <div className='space-y-2'>
                        <div className='text-sm font-semibold'>
                          Variant Pricing
                        </div>

                        {/* Bulk Revise row */}
                        <div className='flex flex-wrap items-center gap-2'>
                          <span>Bulk Revise:</span>
                          <Select defaultValue='price-change'>
                            <SelectTrigger className='h-8 w-40'>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='price-change'>
                                Price Change
                              </SelectItem>
                              <SelectItem value='shipping-fee'>
                                Shipping Fee
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder='Enter value'
                            className='h-8 w-32'
                          />
                          <Button className='h-8 px-4' size='sm'>
                            OK
                          </Button>
                          <span className='text-muted-foreground'>
                            4 variants selected
                          </span>
                        </div>

                        {/* Table */}
                        <div className='overflow-x-auto rounded border'>
                          <table className='w-full border-collapse'>
                            <thead className='text-muted-foreground bg-orange-50'>
                              <tr>
                                <th className='w-8 border-b px-2 py-2 text-left'>
                                  <Checkbox aria-label='Select all' />
                                </th>
                                <th className='w-20 border-b px-2 py-2 text-left'>
                                  Images
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  SKU
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  CJ Color
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  Color
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  RRP
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  CJ Price
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  Shipping Fee
                                </th>
                                <th className='border-b px-2 py-2 text-left'>
                                  Total Dropshipping Price
                                </th>
                                <th className='border-b px-2 py-2 text-left text-orange-500'>
                                  * Your Price
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4].map((row) => (
                                <tr key={row} className='even:bg-orange-50/30'>
                                  <td className='border-b px-2 py-2'>
                                    <Checkbox
                                      aria-label='Select row'
                                      defaultChecked
                                    />
                                  </td>
                                  <td className='border-b px-2 py-2'>
                                    <div className='h-12 w-12 overflow-hidden rounded bg-gray-100' />
                                  </td>
                                  <td className='border-b px-2 py-2'>
                                    CJJT25562260{row}DW
                                  </td>
                                  <td className='border-b px-2 py-2'>Black</td>
                                  <td className='border-b px-2 py-2'>
                                    <Input
                                      value='Black'
                                      className='h-7 w-24 text-center'
                                      readOnly
                                    />
                                  </td>
                                  <td className='border-b px-2 py-2'>
                                    <div className='flex flex-col'>
                                      <span>$14.24</span>
                                      <span className='text-muted-foreground'>
                                        Estimated Profit 325%
                                      </span>
                                    </div>
                                  </td>
                                  <td className='border-b px-2 py-2'>$3.35</td>
                                  <td className='border-b px-2 py-2'>--</td>
                                  <td className='border-b px-2 py-2'>--</td>
                                  <td className='border-b px-2 py-2'>
                                    <Input className='h-7 w-20' />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value='images'
                    className='text-muted-foreground flex-1 overflow-auto px-6 py-4 text-base'
                  >
                    <div className='space-y-4'>
                      <div className='text-sm font-semibold'>Images</div>
                      <div>
                        It is your responsibility to ensure that the pictures
                        you use in your listings do not violate any copyright
                        laws. CJ does not assume liability for infringement
                        claims related to that.
                      </div>

                      <div className='space-y-2'>
                        <div className='font-semibold'>Marketing Picture</div>
                        <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                            <div
                              key={idx}
                              className='relative aspect-[4/5] overflow-hidden rounded border bg-gray-100'
                            >
                              {/* 选中角标 */}
                              <div className='absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded bg-orange-500 text-white'>
                                ✓
                              </div>
                              {/* 放大图标占位 */}
                              <div className='absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded bg-black/40 text-white'>
                                ⤢
                              </div>
                              {/* 图片占位 */}
                              <div className='h-full w-full bg-gradient-to-br from-gray-200 to-gray-300' />
                              {/* Cover Image 标签，仅第一张显示 */}
                              {idx === 0 && (
                                <div className='absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-white'>
                                  Cover Image
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='text-sm font-semibold'>Videos</div>
                        <div>
                          <span className='font-semibold'>Available</span> Only
                          Shopify, Tiktok and Temu stores are currently
                          supported for listing videos.
                        </div>
                        <div className='mt-3 flex flex-wrap gap-4'>
                          <div className='h-32 w-56 overflow-hidden rounded border bg-gray-100' />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value='description'
                    className='text-muted-foreground flex-1 overflow-auto px-6 py-4 text-base'
                  >
                    <div className='space-y-2'>
                      <div className='text-muted-foreground font-medium'>
                        Description
                      </div>
                      <RichTextEditor
                        initialContent={`<p><strong>Overview:</strong><br/>Good material, High quality.<br/>100% Brand New.</p>
<p><strong>Product information:</strong><br/>
Color: Oz doll Christmas elf-red, Oz doll Christmas elf-Green, Oz doll Christmas elf-blue, Oz doll Christmas elf-Black<br/>
Material: Resin<br/>
Size: 16*6 * 5cm<br/>
Category: resin crafts</p>
<p><strong>Packing list:</strong><br/>1* Christmas Decoration</p>
<p><strong>Product Image:</strong></p>`}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            <div className='flex items-center justify-end gap-2 border-t px-4 py-3'>
              <Button
                variant='outline'
                onClick={() => setDrawerOpen(false)}
                className='min-w-[96px]'
              >
                Cancel
              </Button>
              <Button className='min-w-[120px]'>Confirm</Button>
            </div>
          </SheetContent>
        </Sheet>
      </Main>
    </TasksProvider>
  )
}
