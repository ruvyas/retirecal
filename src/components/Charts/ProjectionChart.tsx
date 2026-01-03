import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

export interface ProjectionDataPoint {
  age: number
  savings: number
  isRetirement: boolean
}

interface ProjectionChartProps {
  data: ProjectionDataPoint[]
  retirementAge: number
  className?: string
}

const chartConfig = {
  savings: {
    label: 'Projected Savings',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ProjectionChart({ data, retirementAge, className }: ProjectionChartProps) {
  // Format currency for Y-axis
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  // Generate accessible data table
  const accessibleData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => ({
      age: d.age,
      savings: formatCurrency(d.savings),
      phase: d.isRetirement ? 'Retirement' : 'Accumulation',
    }))
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex h-64 items-center justify-center rounded-lg bg-muted', className)}
        role="img"
        aria-label="No projection data available"
      >
        <p className="text-muted-foreground">No projection data available</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart
          data={data}
          accessibilityLayer
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="age"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatYAxis}
            width={60}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `Age ${value}`}
                formatter={(value) => [formatCurrency(value as number), 'Savings']}
              />
            }
          />
          <ReferenceLine
            x={retirementAge}
            stroke="var(--chart-2)"
            strokeDasharray="5 5"
            label={{
              value: 'Retirement',
              position: 'top',
              fill: 'var(--muted-foreground)',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="var(--chart-1)"
            fill="url(#savingsGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>

      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>Savings projection by age</caption>
        <thead>
          <tr>
            <th>Age</th>
            <th>Projected Savings</th>
            <th>Phase</th>
          </tr>
        </thead>
        <tbody>
          {accessibleData.map((row) => (
            <tr key={row.age}>
              <td>{row.age}</td>
              <td>{row.savings}</td>
              <td>{row.phase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
