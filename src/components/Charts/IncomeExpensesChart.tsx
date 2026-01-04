import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

interface IncomeExpensesChartProps {
  sustainableIncome: number
  desiredSpending: number
  className?: string
}

const chartConfig = {
  amount: {
    label: 'Amount',
  },
  income: {
    label: 'Sustainable Income',
    color: 'var(--chart-1)',
  },
  spending: {
    label: 'Desired Spending',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function IncomeExpensesChart({
  sustainableIncome,
  desiredSpending,
  className,
}: IncomeExpensesChartProps) {
  const gap = sustainableIncome - desiredSpending
  const isOnTrack = gap >= 0

  const data = useMemo(
    () => [
      {
        name: 'Sustainable Income',
        amount: sustainableIncome,
        fill: 'var(--chart-1)',
      },
      {
        name: 'Desired Spending',
        amount: desiredSpending,
        fill: 'var(--chart-2)',
      },
    ],
    [sustainableIncome, desiredSpending]
  )

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Monthly Income vs Spending</h3>
        <p className="text-sm text-muted-foreground">
          {isOnTrack ? (
            <span className="text-emerald-600 dark:text-emerald-400">
              You have a surplus of {formatCurrency(gap)}/month ({formatCurrency(gap * 12)}/year)
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              You have a shortfall of {formatCurrency(Math.abs(gap))}/month (
              {formatCurrency(Math.abs(gap) * 12)}/year)
            </span>
          )}
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-48 w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatYAxis} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={140}
            tick={{ fontSize: 14 }}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="text-sm text-muted-foreground">Sustainable Income</div>
          <div className="text-xl font-semibold tabular-nums">
            {formatCurrency(sustainableIncome)}/mo
          </div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {formatCurrency(sustainableIncome * 12)}/yr
          </div>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="text-sm text-muted-foreground">Desired Spending</div>
          <div className="text-xl font-semibold tabular-nums">
            {formatCurrency(desiredSpending)}/mo
          </div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {formatCurrency(desiredSpending * 12)}/yr
          </div>
        </div>
      </div>
    </div>
  )
}
