import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

type Step = 'request' | 'verify' | 'reset'

export function ForgotPassword() {
  const [step, setStep] = useState<Step>('request')

  const titles: Record<Step, string> = {
    request: 'Retrieve password',
    verify: 'Reset your password',
    reset: 'Reset your password',
  }
  const descriptions: Record<Step, string> = {
    request:
      'Enter your email and we will send you a verification code to confirm that the email is yours.',
    verify:
      'Enter the verification code sent to your email to continue.',
    reset:
      'Enter your new password below.',
  }

  return (
    <AuthLayout>
      <div className='mx-auto w-full max-w-md space-y-6 text-center'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {titles[step]}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {descriptions[step]}
          </p>
        </div>

        <ForgotPasswordForm onStepChange={setStep} />

        <p className='text-muted-foreground text-center text-xs'>
          Go back to{' '}
          <Link
            to='/sign-in'
            className='hover:text-primary underline underline-offset-4'
          >
            Login Page
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
