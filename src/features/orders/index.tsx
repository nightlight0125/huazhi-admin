import { useEffect, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { useAuthStore } from '@/stores/auth-store'
import { getStatesList } from '@/lib/api/logistics'
import { getUserShopOptions, type ShopOption } from '@/lib/utils/shop-utils'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import { OrdersProvider } from './components/orders-provider'
import { OrdersStats } from './components/orders-stats'
import { OrdersTable } from './components/orders-table'
import { platformOrderStatuses } from './data/data'
import { type Order } from './data/schema'

type Option = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

export function Orders() {
  const { auth } = useAuthStore()
  const [table, setTable] = useState<Table<Order> | null>(null)
  const [storeOptions, setStoreOptions] = useState<ShopOption[]>([])
  const [countryOptions, setCountryOptions] = useState<Option[]>([])

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

  // 获取国家列表
  useEffect(() => {
    const fetchCountryOptions = async () => {
      try {
        const locationOptions = await getStatesList()
        const options: Option[] = locationOptions.map((option) => ({
          value: option.id,
          label: option.hzkj_name || option.name || '',
        }))
        setCountryOptions(options)
      } catch (error) {
        setCountryOptions([])
      }
    }
    void fetchCountryOptions()
  }, [])

  return (
    <OrdersProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        {table && (
          <div className='mb-6'>
            <OrdersStats
              orders={table.getRowModel().rows.map((r) => r.original)}
            />
          </div>
        )}
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2 gap-x-4'>
          <OrdersPrimaryButtons table={table} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OrdersTable
            onTableReady={setTable}
            storeOptions={storeOptions.map((s) => ({
              label: s.label,
              value: s.value,
            }))}
            platformOrderStatusOptions={platformOrderStatuses.map((s) => ({
              label: s.label,
              value: s.value,
            }))}
            // orderStatusOptions={orderStatuses
            //   .filter((s) => s.value !== 'all')
            //   .map((s) => ({
            //     label: s.label,
            //     value: s.value,
            //   }))}
            countryOptions={countryOptions}
          />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
