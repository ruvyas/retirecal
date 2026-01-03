export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <a href="/" className="mt-6 text-primary hover:underline">
        Return to Calculator
      </a>
    </div>
  )
}
