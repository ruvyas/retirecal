import { type ReactNode } from 'react'
import { ChevronDownIcon, CheckCircle2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardSectionProps {
  title: string
  stepNumber: number
  isActive: boolean
  isComplete?: boolean
  onActivate: () => void
  children: ReactNode
  className?: string
}

export function WizardSection({
  title,
  stepNumber,
  isActive,
  isComplete = false,
  onActivate,
  children,
  className,
}: WizardSectionProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card motion-safe:transition-all motion-safe:duration-200',
        isActive && 'ring-2 ring-primary/20 border-primary/40',
        className
      )}
    >
      <button
        type="button"
        onClick={onActivate}
        className={cn(
          'flex w-full items-center justify-between gap-4 p-5 text-left',
          'min-h-[60px] touch-manipulation',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'rounded-xl transition-colors',
          !isActive && 'hover:bg-muted/50'
        )}
        aria-expanded={isActive}
        aria-controls={`wizard-section-${stepNumber}-content`}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold',
              isComplete
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {isComplete ? <CheckCircle2Icon className="h-5 w-5" aria-hidden="true" /> : stepNumber}
          </div>
          <span className="text-lg font-semibold tracking-tight">{title}</span>
        </div>
        <ChevronDownIcon
          className={cn(
            'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
            isActive && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={`wizard-section-${stepNumber}-content`}
        className={cn(
          'grid motion-safe:transition-all motion-safe:duration-200 ease-in-out',
          isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
        aria-hidden={!isActive}
        role="region"
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 pt-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
