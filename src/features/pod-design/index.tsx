import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export function PodDesign() {
  return (
    <>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">POD Design</h1>
            <p className="text-muted-foreground">
              POD Design page is under development.
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}

