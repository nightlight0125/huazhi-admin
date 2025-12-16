import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddressForm } from './address-form'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <div>
      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='grid w-50 grid-cols-2'>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='address'>Address</TabsTrigger>
        </TabsList>
        <TabsContent value='profile' className='mt-6'>
          <ProfileForm />
        </TabsContent>
        <TabsContent value='address' className='mt-6'>
          <AddressForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
