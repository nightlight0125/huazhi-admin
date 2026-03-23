import { useSearch } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { StaffAuthForm } from './components/staff-auth-form'

const reasons = [
  'Business staff login with account credentials',
  'No password required for authorized access',
  'Direct access to user account for support',
]

export function StaffLogin() {
  const { redirect } = useSearch({ from: '/(auth)/staff-login' })

  return (
    <div className='bg-background min-h-svh'>
      <div className='flex h-svh w-full flex-col lg:flex-row'>
        {/* Left panel */}
        <div className='hidden items-center justify-center bg-orange-50 px-10 py-12 text-orange-950 lg:flex lg:w-1/2'>
          <div className='max-w-xl space-y-8 text-left'>
            <div>
              <h1 className='text-3xl font-semibold tracking-tight text-orange-950 lg:text-4xl'>
                Staff Login
              </h1>
              <p className='mt-2 text-sm text-orange-900/80'>
                Authorized business staff can log in to user accounts using
                account ID and biz user ID.
              </p>
            </div>

            <ul className='space-y-3 text-sm text-orange-950'>
              {reasons.map((item) => (
                <li key={item} className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500 drop-shadow-sm' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right login panel */}
        <div className='flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-10'>
          <div className='w-full max-w-md space-y-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Staff Log in
            </h1>
            <p className='text-muted-foreground text-sm'>
              Enter account ID and biz user ID to sign in
            </p>
            <StaffAuthForm redirectTo={redirect} />
          </div>
        </div>
      </div>
    </div>
  )
}
