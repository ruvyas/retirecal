import { ReactNode } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent, formatYears } from '@/lib/formatters'

/**
 * A single step in a calculation breakdown
 */
export interface FormulaStep {
  /** Label describing this step */
  label: string
  /** The value for this step */
  value: number
  /** How to format the value */
  format?: 'currency' | 'percent' | 'years' | 'number'
  /** Whether this step is an operator (e.g., "+", "×") */
  isOperator?: boolean
  /** Whether this step is the result/total */
  isResult?: boolean
}

interface FormulaTooltipProps {
  /** The content to trigger the tooltip */
  children: ReactNode
  /** Title describing what's being calculated */
  title: string
  /** Steps in the calculation */
  steps: FormulaStep[]
  /** Additional CSS classes for the trigger */
  className?: string
  /** Side to show the tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Format a value based on the specified format type
 */
function formatValue(value: number, format: FormulaStep['format'] = 'number'): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percent':
      return formatPercent(value)
    case 'years':
      return formatYears(value)
    case 'number':
    default:
      return value.toLocaleString('en-CA', { maximumFractionDigits: 2 })
  }
}

/**
 * FormulaTooltip - Displays a calculation breakdown in a tooltip
 *
 * Shows step-by-step how a value was calculated, with proper formatting
 * for currency, percentages, and other value types.
 */
export function FormulaTooltip({
  children,
  title,
  steps,
  className,
  side = 'top',
}: FormulaTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          'cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-2',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm',
          className
        )}
        aria-label={`${title} - click or hover for calculation details`}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-sm bg-popover text-popover-foreground border shadow-md"
        sideOffset={8}
      >
        <div className="space-y-2 py-1">
          <p className="font-semibold text-sm border-b pb-1">{title}</p>
          <div className="space-y-1 text-xs">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  'flex justify-between gap-4',
                  step.isOperator && 'text-muted-foreground',
                  step.isResult && 'font-semibold border-t pt-1 mt-1'
                )}
              >
                <span>{step.label}</span>
                {!step.isOperator && (
                  <span className="tabular-nums">{formatValue(step.value, step.format)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
