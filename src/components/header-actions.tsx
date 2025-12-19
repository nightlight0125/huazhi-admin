import { ConfigDrawer } from '@/components/config-drawer'
import { LanguageButton } from '@/components/language-button'
import { ProfileDropdown } from '@/components/profile-dropdown'

export function HeaderActions() {
  return (
    <div className='ms-auto flex items-center space-x-1'>
      <LanguageButton />
      <ConfigDrawer />
      <ProfileDropdown />
    </div>
  )
}
