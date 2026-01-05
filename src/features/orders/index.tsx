import { useEffect, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import countries from 'world-countries'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { getUserShopOptions, type ShopOption } from '@/lib/utils/shop-utils'
import { DataTableToolbar } from '@/components/data-table'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import { OrdersProvider } from './components/orders-provider'
import { OrdersStats } from './components/orders-stats'
import { OrdersTable } from './components/orders-table'
import { orderStatuses, platformOrderStatuses } from './data/data'
import { type Order } from './data/schema'

type Option = {
  value: string
  label: string
  flagClass: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Orders() {
  const { auth } = useAuthStore()
  const [table, setTable] = useState<Table<Order> | null>(null)
  const [storeOptions, setStoreOptions] = useState<ShopOption[]>([])

  // 获取店铺列表
  useEffect(() => {
    const fetchStores = async () => {
      const userId = auth.user?.id
      if (!userId) {
        setStoreOptions([])
        return
      }

      try {
        const options = await getUserShopOptions(String(userId))
        setStoreOptions(options)
      } catch (error) {
        console.error('获取店铺列表失败:', error)
        setStoreOptions([])
      }
    }

    void fetchStores()
  }, [])

  const countryOptions: Option[] = countries.map((country) => {
    const code = country.cca2.toLowerCase()
    const flagClass = `fi fi-${code}`

    const FlagIcon: React.FC<{ className?: string }> = ({ className }) => (
      <span className={cn(flagClass, className)} aria-hidden='true' />
    )

    return {
      value: country.cca2,
      label: country.name.common,
      flagClass,
      icon: FlagIcon,
    }
  })

  return (
    <OrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        {table && (
          <div className='mb-6'>
            <DataTableToolbar
              table={table}
              searchPlaceholder='Order No.\SPU\Name'
              dateRange={{
                enabled: true,
                columnId: 'createdAt',
                placeholder: 'Select Date Range',
              }}
              filters={[
                {
                  columnId: 'store',
                  title: 'Store',
                  options: storeOptions.map((s) => ({
                    label: s.label,
                    value: s.value,
                  })),
                },
                {
                  columnId: 'platformOrderStatus',
                  title: 'Store Order Status',
                  options: platformOrderStatuses.map((s) => ({
                    label: s.label,
                    value: s.value,
                  })),
                },
                {
                  columnId: 'status',
                  title: 'Order Status',
                  options: orderStatuses
                    .filter((s) => s.value !== 'all')
                    .map((s) => ({
                      label: s.label,
                      value: s.value,
                    })),
                },
                {
                  columnId: 'country',
                  title: 'Country',
                  options: countryOptions.map((s) => ({
                    label: s.label,
                    value: s.value,
                    icon: s.icon,
                  })),
                },
              ]}
            />
          </div>
        )}
        {table && (
          <div className='mb-6'>
            <OrdersStats
              orders={table.getRowModel().rows.map((r) => r.original)}
            />
          </div>
        )}
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2 gap-x-4'>
          <OrdersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OrdersTable onTableReady={setTable} />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
