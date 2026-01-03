import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-14 max-w-screen-xl items-center px-4 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary" aria-label="RetireCal">
            RetireCal
          </span>
        </div>
        <nav className="ml-auto flex items-center gap-4" aria-label="Main navigation">
          {/* Future: Add navigation items or dark mode toggle */}
        </nav>
      </div>
    </header>
  )
}
