import { Card, CardContent } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
                    className='flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50'
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
              {/* <div className='flex items-center gap-2'>
                <Search />
              </div> */}
            </div>
          </CardContent>
        </Card>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <StoresTable data={stores} />
        </div>
      </Main>
    </TasksProvider>
  )
}
