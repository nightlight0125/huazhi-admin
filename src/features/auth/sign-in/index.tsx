import { useSearch } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { UserAuthForm } from './components/user-auth-form'

const reasons = [
  'Source anything from our global warehouses',
  'Learn how to sell anything to anyone',
  'Discover top trending products',
  'Create a brand',
  'Automate fulfilment',
  '24/7 world‑class support',
]

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className='bg-background min-h-svh'>
      <div className='flex h-svh w-full flex-col lg:flex-row'>
        {/* Left marketing panel */}
        <div className='hidden items-center justify-center bg-orange-50 px-10 py-12 text-orange-950 lg:flex lg:w-1/2'>
          <div className='max-w-xl space-y-8 text-left'>
            <div>
              <h1 className='text-3xl font-semibold tracking-tight text-orange-950 lg:text-4xl'>
                Why people love HyperZone
              </h1>
              <p className='mt-2 text-sm text-orange-900/80'>
                Scale your dropshipping business faster with reliable
                fulfilment, curated products and a team that feels in‑house.
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <ul className='space-y-3 text-sm text-orange-950'>
                {reasons.slice(0, 3).map((item) => (
                  <li key={item} className='flex items-start gap-2'>
                    <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500 drop-shadow-sm' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ul className='space-y-3 text-sm text-orange-950'>
                {reasons.slice(3).map((item) => (
                  <li key={item} className='flex items-start gap-2'>
                    <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500 drop-shadow-sm' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className='grid gap-4 md:grid-cols-2'>
              <Card className='border-orange-200/70 bg-white/70 text-orange-950 shadow-none backdrop-blur'>
                <div className='space-y-1 p-4 text-xs text-orange-900/80'>
                  <p className='font-medium tracking-wide text-orange-800/80 uppercase'>
                    Mansa Capitals
                  </p>
                  <p className='italic text-orange-500/90'>
                    Certified Dropsure User
                  </p>
                  <div className='h-px w-full bg-orange-200/80' />
                  <p className='text-base font-semibold text-orange-950'>
                    Meet all your needs!
                  </p>
                  <p>
                    Dropsure is a very suitable agency for me, they finish all
                    the work on time and ship products fast. Thumbs up for
                    Dropsure!
                  </p>
                </div>
              </Card>

              <Card className='border-orange-200/70 bg-white/70 text-orange-950 shadow-none backdrop-blur'>
                <div className='space-y-1 p-4 text-xs text-orange-900/80'>
                  <p className='font-medium tracking-wide text-orange-800/80 uppercase'>
                    Desired Collectibles
                  </p>
                  <p className='italic text-orange-500/90'>
                    Certified Dropsure User
                  </p>
                  <div className='h-px w-full bg-orange-200/80' />
                  <p className='text-base font-semibold text-orange-950'>
                    Dropsure Is Worth A Try!
                  </p>
                  <p>
                    I was introduced by a friend. They really know what
                    they&apos;re doing and take care of fulfilment like an
                    in‑house team.
                  </p>
                </div>
              </Card>
            </div> */}
          </div>
        </div>

        {/* Right login panel */}
        <div className='flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-10'>
          <div className='w-full max-w-md space-y-6'>
            <h1 className='text-2xl font-semibold tracking-tight'>Log in</h1>
            <UserAuthForm redirectTo={redirect} />
          </div>
        </div>
      </div>
    </div>
  )
}
