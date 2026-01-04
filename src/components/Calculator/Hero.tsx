import { cn } from '@/lib/utils'

interface HeroProps {
  className?: string
}

export function Hero({ className }: HeroProps) {
  return (
    <section className={cn('py-8 text-center md:py-12', className)}>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        Canadian Retirement Calculator
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        Plan your retirement with confidence. See how your savings, contributions, and time horizon
        work together to build your future.
      </p>
    </section>
  )
}
