import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepperProps {
  currentStep: number
  steps: Array<{
    id: string
    label: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
  }>
  orientation?: 'horizontal' | 'vertical'
  className?: string
  onStepClick?: (stepId: string, stepNumber: number) => void
}

interface StepperItemProps {
  step: number
  currentStep: number
  isLast: boolean
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  orientation?: 'horizontal' | 'vertical'
  onStepClick?: (stepId: string, stepNumber: number) => void
  stepId: string
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ step, currentStep, isLast, label, description, icon: Icon, orientation = 'horizontal', onStepClick, stepId }, ref) => {
    const isCompleted = step < currentStep
    const isCurrent = step === currentStep
    const isUpcoming = step > currentStep

    const handleClick = () => {
      if (onStepClick && (isCompleted || isCurrent)) {
        onStepClick(stepId, step)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          orientation === 'vertical' ? 'flex-col' : 'flex-row'
        )}
      >
        <div 
          className={cn(
            'flex items-center',
            (isCompleted || isCurrent) && onStepClick && 'cursor-pointer'
          )}
          onClick={handleClick}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
              isCompleted && 'border-primary bg-primary text-primary-foreground',
              isCurrent && 'border-primary bg-primary text-primary-foreground',
              isUpcoming && 'border-muted-foreground/25 bg-background text-muted-foreground',
              (isCompleted || isCurrent) && onStepClick && 'hover:opacity-80'
            )}
          >
            {isCompleted ? (
              <Check className="h-4 w-4" />
            ) : Icon ? (
              <Icon className="h-4 w-4" />
            ) : (
              step
            )}
          </div>
          <div className={cn('ml-3', orientation === 'vertical' && 'text-center')}>
            <div
              className={cn(
                'text-sm font-medium',
                isCompleted && 'text-primary',
                isCurrent && 'text-primary',
                isUpcoming && 'text-muted-foreground'
              )}
            >
              {label}
            </div>
            {description && (
              <div className="text-xs text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
        </div>
        {!isLast && (
          <div
            className={cn(
              'flex-1',
              orientation === 'horizontal' ? 'ml-4 h-0.5' : 'mt-4 w-0.5 h-8',
              isCompleted ? 'bg-primary' : 'bg-muted-foreground/25'
            )}
          />
        )}
      </div>
    )
  }
)
StepperItem.displayName = 'StepperItem'

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ currentStep, steps, orientation = 'horizontal', className, onStepClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'items-center' : 'flex-col',
          className
        )}
        {...props}
      >
        {steps.map((step, index) => (
          <StepperItem
            key={step.id}
            step={index + 1}
            currentStep={currentStep}
            isLast={index === steps.length - 1}
            label={step.label}
            description={step.description}
            icon={step.icon}
            orientation={orientation}
            onStepClick={onStepClick}
            stepId={step.id}
          />
        ))}
      </div>
    )
  }
)
Stepper.displayName = 'Stepper'

export { Stepper, StepperItem }
