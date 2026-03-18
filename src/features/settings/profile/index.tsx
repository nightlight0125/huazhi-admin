import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddressForm } from './address-form'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  const navigate = useNavigate()
  const { tab = 'profile', returnTo } = useSearch({ from: '/_authenticated/settings/' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setLoading(false)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  if (loading) {
    return (
      <div className='flex min-h-[200px] w-full items-center justify-center'>
        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='text-foreground'>
      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({
            to: '/settings',
            search: { tab: value, returnTo },
          })
        }
        className='w-full'
      >
        <TabsList className='grid w-50 grid-cols-2 bg-muted'>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='address'>Address</TabsTrigger>
        </TabsList>
        <TabsContent
          value='profile'
          className='mt-6 rounded-lg border border-border bg-card p-6 shadow-sm'
        >
          <ProfileForm />
        </TabsContent>
        <TabsContent
          value='address'
          className='mt-6 rounded-lg border border-border bg-card p-6 shadow-sm'
        >
          <AddressForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
