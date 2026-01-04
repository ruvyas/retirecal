import { cn } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { deriveStatus, type StatusType } from '@/lib/utils/status'

// Re-export for backwards compatibility
export { deriveStatus, type StatusType }

interface StatusIndicatorProps {
  status: StatusType
  message?: string
  className?: string
}

const statusConfig = {
  'on-track': {
    icon: CheckCircle2,
    label: 'On Track',
    description: 'Your retirement savings are on track',
    colorClasses: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    iconClasses: 'text-emerald-600 dark:text-emerald-400',
  },
  'attention-needed': {
    icon: AlertTriangle,
    label: 'Attention Needed',
    description: 'Your retirement plan may need adjustments',
    colorClasses: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    iconClasses: 'text-amber-600 dark:text-amber-400',
  },
  'significant-gap': {
    icon: XCircle,
    label: 'Significant Gap',
    description: 'Your retirement savings have a significant shortfall',
    colorClasses: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    iconClasses: 'text-red-600 dark:text-red-400',
  },
} as const

export function StatusIndicator({ status, message, className }: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg p-3', config.colorClasses, className)}
      role="status"
      aria-live="polite"
      data-testid="status-indicator"
    >
      <Icon className={cn('size-5 shrink-0', config.iconClasses)} aria-hidden="true" />
      <div className="flex flex-col">
        <span className="font-medium">{config.label}</span>
        <span className="sr-only">{config.description}</span>
        {message && <span className="text-sm opacity-80">{message}</span>}
      </div>
    </div>
  )
}
