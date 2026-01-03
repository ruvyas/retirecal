import { cn } from '@/lib/utils'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t bg-muted/50', className)}>
      <div className="container max-w-screen-xl px-4 py-6 md:px-8">
        <div className="text-center text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes
            only. Results should not be considered financial advice.
          </p>
          <p>Please consult a qualified financial advisor before making retirement decisions.</p>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground/70">
          &copy; {new Date().getFullYear()} RetireCal. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
