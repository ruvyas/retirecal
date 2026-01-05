import { useState, useCallback, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CurrencyInput } from './CurrencyInput'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'
import type { SavingsBreakdown as SavingsBreakdownType } from '@/lib/types/calculator'

interface SavingsBreakdownProps {
  value: SavingsBreakdownType
  onChange: (value: SavingsBreakdownType) => void
  disabled?: boolean
  className?: string
}

export function SavingsBreakdown({
  value,
  onChange,
  disabled = false,
  className,
}: SavingsBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  const total = value.rrsp + value.tfsa + value.nonRegistered + value.cash

  const handleRrspChange = useCallback(
    (rrsp: number) => {
      onChange({ ...value, rrsp })
    },
    [value, onChange]
  )

  const handleTfsaChange = useCallback(
    (tfsa: number) => {
      onChange({ ...value, tfsa })
    },
    [value, onChange]
  )

  const handleNonRegisteredChange = useCallback(
    (nonRegistered: number) => {
      onChange({ ...value, nonRegistered })
    },
    [value, onChange]
  )

  const handleCashChange = useCallback(
    (cash: number) => {
      onChange({ ...value, cash })
    },
    [value, onChange]
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('space-y-2', className)}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left',
          'min-h-[44px]', // Minimum touch target for mobile accessibility
          'hover:bg-accent/50 transition-colors',
          disabled && 'pointer-events-none opacity-50'
        )}
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Current Savings</span>
          <span className="text-lg font-semibold text-primary">{formatCurrency(total)}</span>
        </div>
        <ChevronDown
          className={cn(
            'size-5 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent id={contentId} className="space-y-3 pt-2">
        <CurrencyInput
          id="savings-rrsp"
          label="RRSP"
          value={value.rrsp}
          onChange={handleRrspChange}
          helpText="Registered Retirement Savings Plan"
          disabled={disabled}
        />
        <CurrencyInput
          id="savings-tfsa"
          label="TFSA"
          value={value.tfsa}
          onChange={handleTfsaChange}
          helpText="Tax-Free Savings Account"
          disabled={disabled}
        />
        <CurrencyInput
          id="savings-non-registered"
          label="Non-Registered"
          value={value.nonRegistered}
          onChange={handleNonRegisteredChange}
          helpText="Non-registered investment accounts"
          disabled={disabled}
        />
        <CurrencyInput
          id="savings-cash"
          label="Cash / Savings Account"
          value={value.cash}
          onChange={handleCashChange}
          helpText="Cash savings (0% growth)"
          disabled={disabled}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
