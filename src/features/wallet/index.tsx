import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { WalletRechargeDialog } from './components/wallet-recharge-dialog'
import { WalletStats } from './components/wallet-stats'
import { WalletTable } from './components/wallet-table'
import { walletRecords, walletStats } from './data/wallet-records'

export function Wallet() {
  const [showRechargeDialog, setShowRechargeDialog] = useState(false)

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
        {/* 钱包统计 */}
        <div className='mb-6'>
          <WalletStats stats={walletStats} />
        </div>

        {/* 钱包记录列表 */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <WalletTable data={walletRecords} />
        </div>
      </Main>

      <WalletRechargeDialog
        open={showRechargeDialog}
        onOpenChange={setShowRechargeDialog}
      />
    </>
  )
}
