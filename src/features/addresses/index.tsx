import { getRouteApi } from '@tanstack/react-router'
import { HeaderActions } from '@/components/header-actions'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { AddressesDialogs } from './components/addresses-dialogs'
import { AddressesPrimaryButtons } from './components/addresses-primary-buttons'
import { AddressesProvider } from './components/addresses-provider'
import { AddressesTable } from './components/addresses-table'
import { addresses } from './data/data'

const route = getRouteApi('/_authenticated/addresses/')

export function Addresses() {
  const search = route.useSearch()
  const navigate = route.useNavigate() as any

  return (
    <AddressesProvider>
      <Header fixed>
        <HeaderActions />
      </Header>

      <Main fluid>
        <div className='mb-2 flex flex-wrap items-center justify-end space-y-2'>
          <AddressesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <AddressesTable data={addresses} search={search} navigate={navigate} />
        </div>
      </Main>

      <AddressesDialogs />
    </AddressesProvider>
  )
}

