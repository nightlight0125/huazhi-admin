import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { HelpButton } from '@/components/help-button'
import { LanguageButton } from '@/components/language-button'

export function HeaderActions() {
  return (
    <div className='ms-auto flex items-center space-x-1'>
      <HelpButton />
      <LanguageButton />
      <ConfigDrawer />
      <ProfileDropdown />
    </div>
  )
}

