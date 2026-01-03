import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/formatters'
import type { Assumptions } from '@/lib/types/calculator'

interface AssumptionsAccordionProps {
  assumptions: Assumptions
  className?: string
}

interface AssumptionRowProps {
  label: string
  value: string
  description: string
}

function AssumptionRow({ label, value, description }: AssumptionRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="text-right font-semibold">{value}</div>
    </div>
  )
}

export function AssumptionsAccordion({ assumptions, className }: AssumptionsAccordionProps) {
  return (
    <Accordion type="single" collapsible className={cn('w-full', className)}>
      <AccordionItem value="assumptions">
        <AccordionTrigger>Calculation Assumptions</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1 divide-y">
            <AssumptionRow
              label="Inflation Rate"
              value={formatPercent(assumptions.inflationRate)}
              description="Annual rate at which prices increase over time"
            />
            <AssumptionRow
              label="Pre-Retirement Return"
              value={formatPercent(assumptions.preRetirementReturn)}
              description="Expected annual investment return before retirement"
            />
            <AssumptionRow
              label="Retirement Return"
              value={formatPercent(assumptions.retirementReturn)}
              description="Conservative return rate during retirement"
            />
            <AssumptionRow
              label="Tax Rate"
              value={formatPercent(assumptions.taxRate)}
              description="Blended tax rate on retirement withdrawals"
            />
            <AssumptionRow
              label="Life Expectancy"
              value={`${assumptions.lifeExpectancy} years`}
              description="Planning horizon for retirement savings"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
