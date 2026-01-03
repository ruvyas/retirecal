# Project Overview

A single-page application (SPA) retirement calculator for Canadian individuals. Built with React 18, Vite, Shadcn UI, and Tailwind CSS. No backend required - all calculations run client-side.

---

# Development workflow

**Always use `bun`, not `npm`.**

```sh
# 1. Make changes

# 2. Typecheck (fast)
bun run typecheck

# 3. Run tests
bun run test -- -t "test name"  # Single Suite
bun run test::file -- "glob"    # Specific files

# 4. Lint after creating or editing
bun run lint:file -- "file1.ts" # Specific files
bun run lint                    # All files
```

## Tech Stack

| Tool         | Version | Purpose                   |
| ------------ | ------- | ------------------------- |
| Bun          | latest  | Package manager & runtime |
| React        | 18.x    | UI framework              |
| Vite         | 5.x     | Build tool & dev server   |
| TypeScript   | 5.x     | Type safety               |
| Tailwind CSS | 3.x     | Styling                   |
| Shadcn UI    | latest  | Component library         |
| Vitest       | latest  | Unit testing              |
| Playwright   | latest  | E2E testing               |

## File Naming Conventions

- **Components**: PascalCase (`InputPanel.tsx`)
- **Utilities/Hooks**: camelCase (`useCalculator.ts`, `formatters.ts`)
- **Types**: camelCase (`calculator.ts`)
- **Tests**: Match source file + `.test.ts` or `.spec.ts`
- **Constants**: camelCase, SCREAMING_SNAKE for values (`constants.ts` with `DEFAULT_INFLATION_RATE`)

## 2. UX Direction

### 2.1 Design Philosophy

Following the frontend-design skill guidelines, the calculator should avoid generic "AI slop" aesthetics and commit to a **bold, distinctive design direction**.

### Tailwind v4

Uses `@tailwindcss/vite` plugin. Dark mode requires this CSS directive:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## Key Architecture Decisions

### 1. Calculation Engine (Pure Functions)

All financial calculations live in as pure functions with no side effects. This enables:

- Easy unit testing with known inputs/outputs
- Reusability across components
- Future extraction to web worker if performance requires

```typescript
// Example function signatures
function calculateFutureValue(principal: number, rate: number, years: number): number
function calculateContributionGrowth(monthly: number, rate: number, months: number): number
```

### 2. State Management (React Only)

No external state library. Use `useReducer` in `useCalculator` hook for complex state

### 3. Component Composition

```
Calculator (container)
├── InputPanel (controlled inputs)
│   ├── AgeSlider ← useCalculator dispatch
│   ├── CurrencyInput ← useCalculator dispatch
│   └── SavingsBreakdown
│       └── CurrencyInput × 3
└── ResultsPanel (read-only display)
    ├── SummaryCards ← useCalculator results
    ├── ProjectionChart ← useCalculator results
    └── StatusIndicator ← derived from results
```

### 4. Shadcn UI Component Usage

| Component     | Use Case                                   |
| ------------- | ------------------------------------------ |
| `Slider`      | Age, retirement age inputs                 |
| `Input`       | Currency fields (wrapped in CurrencyInput) |
| `Card`        | Results display, savings breakdown         |
| `Accordion`   | Assumptions section                        |
| `Collapsible` | Savings breakdown toggle                   |
| `Tooltip`     | Field explanations                         |
| `Label`       | Form field labels                          |

### 5. Styling Approach

- **Tailwind utilities** for layout and spacing
- **CSS variables** for theme colors (defined in `index.css`)
- **No inline styles** except dynamic values (chart dimensions)
- **Mobile-first** responsive breakpoints

## Testing Strategy

### Unit Tests (Vitest)

Located in `tests/unit/`. Test calculation functions with known inputs/outputs.

### E2E Tests (Playwright)

Located in `tests/e2e/`. Test user flows and accessibility.
