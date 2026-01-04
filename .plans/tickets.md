# Canadian Retirement Calculator - Tickets

## Epic 1: Project Setup

### TICKET-001: Initialize Vite + React + TypeScript Project

**Description:** Set up the base project using Bun with Vite, React 18, and TypeScript.

**Acceptance Criteria:**

- [x] Project initialized with `bun create vite` using React + TypeScript template
- [x] Bun lockfile (`bun.lock`) present and committed
- [x] `bun run dev` starts dev server successfully
- [x] `bun run build` produces production build without errors
- [x] TypeScript strict mode enabled in `tsconfig.json`
- [x] Base `App.tsx` renders without errors

---

### TICKET-002: Configure Tailwind CSS v4

**Description:** Install and configure Tailwind CSS with the Vite plugin and dark mode support.

**Acceptance Criteria:**

- [x] `@tailwindcss/vite` plugin installed and configured in `vite.config.ts`
- [x] `index.css` includes Tailwind directives (`@import "tailwindcss"`)
- [x] Dark mode custom variant configured: `@custom-variant dark (&:where(.dark, .dark *))`
- [x] Test utility classes render correctly (e.g., `bg-blue-500`, `dark:bg-gray-900`)
- [x] CSS variables for theme colors defined in `index.css`

---

### TICKET-003: Install and Configure Shadcn UI

**Description:** Set up Shadcn UI component library with initial configuration.

**Acceptance Criteria:**

- [x] Shadcn CLI initialized (`bunx shadcn@latest init`)
- [x] `components.json` configured with correct paths
- [x] `src/components/ui/` directory created
- [x] `src/lib/utils.ts` with `cn()` helper function present
- [x] At least one component installed to verify setup (e.g., Button)
- [x] Component imports resolve correctly

---

### TICKET-004: Set Up Vitest for Unit Testing

**Description:** Configure Vitest as the unit testing framework.

**Acceptance Criteria:**

- [x] Vitest installed and configured in `vite.config.ts`
- [x] Test script added to `package.json`: `"test": "vitest"`
- [x] `tests/unit/` directory created
- [x] Sample test file runs successfully with `bun run test`
- [x] Coverage reporting configured
- [x] Test utilities for React Testing Library installed

---

### TICKET-005: Set Up Playwright for E2E Testing

**Description:** Configure Playwright for end-to-end and accessibility testing.

**Acceptance Criteria:**

- [x] Playwright installed with `bun add -D @playwright/test`
- [x] `playwright.config.ts` created with Chrome/Firefox/Safari browsers
- [x] `tests/e2e/` directory created
- [x] Sample E2E test runs successfully
- [x] Script added: `"test:e2e": "playwright test"`
- [x] Accessibility testing utilities configured (@axe-core/playwright)

---

### TICKET-006: Configure ESLint and Prettier

**Description:** Set up linting and formatting tools for code quality.

**Acceptance Criteria:**

- [x] ESLint configured with TypeScript and React plugins
- [x] Prettier configured with consistent formatting rules
- [x] Scripts added: `"lint": "eslint ."` and `"lint:file": "eslint"`
- [x] Pre-commit integration considered (optional for MVP)
- [x] No linting errors on initial codebase

---

## Epic 2: Calculation Engine

### TICKET-007: Implement Future Value Calculation

**Description:** Create pure function to calculate future value of current savings using compound growth formula: `FV = PV × (1 + r)^n`

**Acceptance Criteria:**

- [x] Function `calculateFutureValue(principal, rate, years)` implemented in `src/lib/calculations/retirement.ts`
- [x] Returns correct value for: $100,000 @ 5% for 10 years = $162,889.46
- [x] Handles edge cases: zero principal, zero rate, zero years
- [x] Unit tests cover:
  - Standard compound growth scenario
  - Edge case: 0 years returns principal unchanged
  - Edge case: 0 rate returns principal unchanged
  - Edge case: 0 principal returns 0
  - Precision to 2 decimal places

---

### TICKET-008: Implement Contribution Growth Calculation

**Description:** Create pure function to calculate future value of regular monthly contributions: `FV = PMT × [((1 + r)^n - 1) / r]`

**Acceptance Criteria:**

- [x] Function `calculateContributionGrowth(monthlyContribution, annualRate, months)` implemented
- [x] Returns correct value for: $500/month @ 5% for 20 years = $205,516.83
- [x] Handles monthly compounding correctly
- [x] Unit tests cover:
  - Standard contribution scenario
  - Edge case: 0 contribution returns 0
  - Edge case: 0 months returns 0
  - Edge case: 0 rate returns sum of contributions
  - Combined scenario: $50,000 initial + $300/month @ 5% for 25 years = $347,970.66

---

### TICKET-009: Implement Retirement Runway Calculation

**Description:** Create pure function to calculate how many years savings will last based on spending rate.

**Acceptance Criteria:**

- [x] Function `calculateRetirementRunway(totalSavings, annualSpending, returnRate)` implemented
- [x] Uses present value of annuity formula solved for n
- [x] Returns correct value for: $500,000 savings, $40,000/year spending, 3% return = ~15.7 years
- [x] Returns Infinity or special value when savings can sustain indefinitely
- [x] Unit tests cover:
  - Standard runway scenario
  - Edge case: spending exceeds sustainable withdrawal (rapid depletion)
  - Edge case: 0 spending returns Infinity
  - Edge case: 0 savings returns 0
  - Edge case: very high savings vs low spending

---

### TICKET-010: Implement Sustainable Monthly Income Calculation

**Description:** Create pure function to calculate safe monthly withdrawal amount based on savings and expected retirement duration.

**Acceptance Criteria:**

- [x] Function `calculateSustainableIncome(totalSavings, returnRate, retirementYears)` implemented
- [x] Uses annuity formula to determine sustainable withdrawal
- [x] Returns monthly amount (annual / 12)
- [x] Unit tests cover:
  - Standard income calculation
  - Edge case: 0 savings returns 0
  - Edge case: short retirement period
  - Edge case: very long retirement period (40+ years)

---

### TICKET-011: Implement Simple Tax Estimation

**Description:** Create function to estimate after-tax withdrawal amounts using simplified blended rate.

**Acceptance Criteria:**

- [x] Function `estimateAfterTaxAmount(grossAmount, taxRate)` implemented in `src/lib/calculations/tax.ts`
- [x] Default tax rate of 25% applied
- [x] Can accept custom tax rate parameter
- [x] Unit tests cover:
  - Standard tax calculation
  - Edge case: 0% tax rate
  - Edge case: 0 gross amount

---

### TICKET-012: Create Constants and Default Assumptions

**Description:** Define all default calculation assumptions as constants.

**Acceptance Criteria:**

- [x] `src/lib/calculations/constants.ts` created with:
  - `DEFAULT_INFLATION_RATE`: 2.0%
  - `DEFAULT_PRE_RETIREMENT_RETURN_CONSERVATIVE`: 4.0%
  - `DEFAULT_PRE_RETIREMENT_RETURN_MODERATE`: 5.5%
  - `DEFAULT_PRE_RETIREMENT_RETURN_AGGRESSIVE`: 7.0%
  - `DEFAULT_RETIREMENT_RETURN`: 3.5%
  - `DEFAULT_LIFE_EXPECTANCY`: 95 years
  - `DEFAULT_WITHDRAWAL_TAX_RATE`: 25%
- [x] All constants exported and typed
- [x] Unit test verifies constants are defined with correct values

---

### TICKET-013: Create TypeScript Types for Calculator

**Description:** Define all TypeScript interfaces and types for the calculator.

**Acceptance Criteria:**

- [x] `src/lib/types/calculator.ts` created with interfaces:
  - `CalculatorInputs`: all user input fields
  - `CalculatorResults`: all output values
  - `Assumptions`: configurable assumptions
  - `SavingsBreakdown`: RRSP, TFSA, non-registered
- [x] All types exported
- [x] Types used in calculation functions
- [x] Validation bounds defined (min/max ages, amounts)

---

## Epic 3: UI Components

### TICKET-014: Create Layout Components (Header/Footer)

**Description:** Build the page layout structure with Header and Footer components.

**Acceptance Criteria:**

- [x] `src/components/Layout/Header.tsx` with logo placeholder and minimal nav
- [x] `src/components/Layout/Footer.tsx` with disclaimer placeholder
- [x] Responsive styling (mobile-first)
- [x] Components use Tailwind classes matching design aesthetic
- [x] Unit tests verify components render without errors

---

### TICKET-015: Create CurrencyInput Component

**Description:** Build a currency input component with CAD formatting and thousand separators.

**Acceptance Criteria:**

- [x] `src/components/Calculator/CurrencyInput.tsx` wraps Shadcn Input
- [x] Displays value with CAD formatting ($1,234.56)
- [x] Handles numeric input, strips non-numeric characters
- [x] Supports min/max value constraints
- [x] Accessible with proper labels and ARIA attributes
- [x] Unit tests cover:
  - Value formatting on blur
  - Value parsing on input
  - Min/max constraint enforcement
  - Accessibility attributes present

---

### TICKET-016: Create AgeSlider Component

**Description:** Build an age slider with both slider and numeric input controls.

**Acceptance Criteria:**

- [x] `src/components/Calculator/AgeSlider.tsx` uses Shadcn Slider
- [x] Numeric input shows current value and allows override
- [x] Slider and input stay synchronized
- [x] Supports configurable min/max (default 18-100)
- [x] Accessible with proper labels
- [x] Unit tests cover:
  - Slider value change updates input
  - Input value change updates slider
  - Boundary validation (min/max)
  - Accessibility attributes present

---

### TICKET-017: Create SavingsBreakdown Component

**Description:** Build collapsible section for RRSP, TFSA, and non-registered savings inputs.

**Acceptance Criteria:**

- [x] `src/components/Calculator/SavingsBreakdown.tsx` uses Shadcn Collapsible
- [x] Contains 3 CurrencyInput fields (RRSP, TFSA, Non-registered)
- [x] Shows total savings when collapsed
- [x] Expands to show individual account inputs
- [x] Values sum correctly to total
- [x] Unit tests cover:
  - Collapse/expand functionality
  - Sum calculation accuracy
  - Individual field updates

---

### TICKET-018: Create InputPanel Component

**Description:** Build the main input panel containing all calculator inputs.

**Acceptance Criteria:**

- [x] `src/components/Calculator/InputPanel.tsx` combines all input components
- [x] Includes: Current Age, Annual Income, Savings Breakdown, Retirement Age, Monthly Contribution, Annual Retirement Spending
- [x] Accepts `onChange` callback prop for value updates
- [x] Debounces changes (150ms) before notifying
- [x] Mobile-responsive layout (stacked on small screens)
- [x] Unit tests cover:
  - All inputs render
  - Change callbacks fire correctly
  - Debouncing works as expected

---

### TICKET-019: Create ResultsPanel Component

**Description:** Build the results display panel showing calculated projections.

**Acceptance Criteria:**

- [x] `src/components/Calculator/ResultsPanel.tsx` uses Shadcn Card
- [x] Displays: Projected Savings, Years Until Retirement, Retirement Runway, Monthly Income, Gap/Surplus
- [x] Status indicator with color coding (green/amber/red)
- [x] Values formatted with currency/number formatting
- [x] Responsive layout
- [x] Unit tests cover:
  - All result values display correctly
  - Status indicator shows correct color for each state
  - Formatting applied correctly

---

### TICKET-020: Create StatusIndicator Component

**Description:** Build visual indicator showing retirement readiness status.

**Acceptance Criteria:**

- [x] `src/components/Calculator/StatusIndicator.tsx` created
- [x] Three states: on-track (green), attention-needed (amber), significant-gap (red)
- [x] Clear visual distinction between states
- [x] Accessible with screen reader text
- [x] Unit tests cover:
  - Correct color for each status
  - Accessibility text present
  - Status transitions work correctly

---

### TICKET-021: Create AssumptionsAccordion Component

**Description:** Build collapsible section showing and optionally editing calculation assumptions.

**Acceptance Criteria:**

- [x] `src/components/Calculator/AssumptionsAccordion.tsx` uses Shadcn Accordion
- [x] Displays: Inflation rate, Expected return rate, Tax rate assumptions
- [x] Collapsed by default
- [x] Shows current values with explanatory text
- [x] Unit tests cover:
  - Accordion expands/collapses
  - All assumption values display correctly

---

### TICKET-022: Create ProjectionChart Component

**Description:** Build visual chart showing savings growth projection over time.

**Acceptance Criteria:**

- [x] `src/components/Charts/ProjectionChart.tsx` created
- [x] Shows savings trajectory from current age to life expectancy
- [x] Highlights retirement age transition point
- [x] Responsive sizing
- [x] Accessible with data table alternative or ARIA descriptions
- [x] Unit tests cover:
  - Chart renders with valid data
  - Handles edge cases (empty data, single point)

---

## Epic 4: Calculator Integration

### TICKET-023: Create useCalculator Hook

**Description:** Build the main state management hook for the calculator.

**Acceptance Criteria:**

- [x] `src/hooks/useCalculator.ts` manages all calculator state
- [x] Uses `useReducer` for complex state management
- [x] Exposes: inputs, results, setInput, reset functions
- [x] Triggers recalculation on input changes
- [x] Memoizes expensive calculations
- [x] Unit tests cover:
  - Initial state is correct
  - Input updates trigger recalculation
  - Reset restores initial state
  - All calculated values are correct

---

### TICKET-024: Wire Calculator Components Together

**Description:** Integrate all calculator components with the useCalculator hook.

**Acceptance Criteria:**

- [x] `src/components/Calculator/Calculator.tsx` assembles all pieces
- [x] InputPanel connected to useCalculator dispatch
- [x] ResultsPanel receives calculated results
- [x] Real-time updates work end-to-end
- [x] E2E test verifies: changing input updates results

---

### TICKET-039: Integrate ProjectionChart into Calculator

**Description:** Integrate the ProjectionChart component into the Calculator/ResultsPanel to display savings growth visualization.

**Acceptance Criteria:**

- [x] ProjectionChart imported and rendered in ResultsPanel or Calculator
- [x] Chart receives projection data from useCalculator hook
- [x] Chart updates in real-time when inputs change
- [x] Proper loading/empty state handling
- [x] Responsive layout with chart sizing
- [x] Unit tests verify chart integration

---

### TICKET-040: Add Calculation Breakdown Values to Results

**Description:** Extend CalculatorResults to include intermediate calculation values needed for formula explanations.

**Acceptance Criteria:**

- [ ] Update `CalculatorResults` type in `src/lib/types/calculator.ts` with:
  - `savingsGrowth`: Growth of initial savings
  - `contributionGrowth`: Growth from monthly contributions
  - `grossMonthlyIncome`: Pre-tax sustainable income
  - `inflationAdjustedSpending`: Spending adjusted for inflation
- [ ] Update `computeResults()` in `src/hooks/useCalculator.ts` to return these values
- [ ] Unit tests verify breakdown values are calculated correctly

---

### TICKET-041: Create Formula Tooltip Component

**Description:** Create a reusable tooltip component that displays calculation breakdowns.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/FormulaTooltip.tsx` created
- [ ] Uses Shadcn Tooltip component
- [ ] Displays step-by-step calculation with values
- [ ] Formats numbers as currency where appropriate
- [ ] Accessible with keyboard navigation
- [ ] Unit tests verify tooltip renders correctly

---

### TICKET-042: Add Tooltips to ResultsPanel Values

**Description:** Wrap result values in tooltips showing how each was calculated.

**Acceptance Criteria:**

- [ ] Projected Savings shows: initial growth + contribution growth breakdown
- [ ] Sustainable Monthly Income shows: portfolio × rate ÷ 12 × (1-tax)
- [ ] Income Gap shows: income - inflation-adjusted spending breakdown
- [ ] Retirement Runway shows: years until savings depleted
- [ ] Tooltips appear on hover with calculation details
- [ ] Mobile-friendly (tap to show on touch devices)
- [ ] Unit tests verify tooltips display correct values

---

### TICKET-026: Add Formatting Utilities

**Description:** Create utility functions for number and currency formatting.

**Acceptance Criteria:**

- [x] `src/lib/formatters.ts` with:
  - `formatCurrency(value)`: returns "$1,234"
  - `formatCurrencyPrecise(value)`: returns "$1,234.56"
  - `formatNumber(value)`: returns "1,234"
  - `formatYears(value)`: returns "25 years"
  - `parseCurrency(string)`: returns number
  - `formatPercent(value)`: returns "5.0%"
- [x] Handles edge cases: NaN, Infinity, negative
- [x] Unit tests cover all formatters and parsers (34 tests)

---

## Epic 5: Polish & Testing

### TICKET-027: Implement Design System (Typography & Colors)

**Description:** Apply the "Confident Financial Clarity" design aesthetic.

**Acceptance Criteria:**

- [x] Typography system with Inter font configured (index.html, index.css)
- [x] Color palette defined in CSS variables (OKLCH color space in index.css)
- [x] Consistent spacing scale documented (index.css comment block)
- [x] Dark mode toggle functional (.dark class switching)
- [x] Visual consistency across all components (heading-1 through heading-4, body-lg, body-base, body-sm utilities)

---

### TICKET-028: Add Micro-animations and Transitions

**Description:** Implement subtle animations for input/result interactions.

**Acceptance Criteria:**

- [x] Result values animate on change (useAnimatedValue hook, AnimatedCurrency/AnimatedNumber)
- [x] Status indicator transitions smoothly between states (transition-colors duration-300)
- [x] Accordion/collapsible animations are smooth (tw-animate-css, existing)
- [x] Animations respect `prefers-reduced-motion` (motion-reduce:transition-none, hook check)
- [x] Performance: 60fps using requestAnimationFrame, tabular-nums for layout stability

---

### TICKET-029: Implement Mobile Responsive Layout

**Description:** Ensure full mobile responsiveness for all components.

**Acceptance Criteria:**

- [x] Input and Results panels stack vertically on mobile (<768px) (grid gap-_ md:grid-cols-_)
- [x] Touch targets minimum 44x44px (input h-11, button h-11, slider size-6 on mobile)
- [x] Full-width sliders on mobile (w-full, larger thumb/track)
- [x] Sticky results summary option on mobile (StickyResultsSummary component)
- [x] E2E tests verify layouts at 375px, 768px, 1024px, 1440px (tests/e2e/responsive.spec.ts)

---

### TICKET-030: Accessibility Audit and Fixes

**Description:** Ensure WCAG 2.1 AA compliance.

**Acceptance Criteria:**

- [x] All inputs have associated labels (htmlFor, aria-label)
- [x] Focus indicators visible on all interactive elements (focus-visible:ring)
- [x] Keyboard navigation works for entire calculator (tabIndex, skip link)
- [x] Screen reader announces result changes (aria-live="polite" on metrics grid)
- [x] Color contrast ratios meet AA standards (muted-foreground darkened to 0.45)
- [x] Axe accessibility tests pass in E2E suite (color-contrast enabled, tests/e2e/accessibility.spec.ts)

---

### TICKET-031: Write E2E Test Suite

**Description:** Create comprehensive Playwright E2E tests.

**Acceptance Criteria:**

- [ ] `tests/e2e/calculator.spec.ts` covers:
  - Full calculation flow with all inputs
  - Input changes update results correctly
  - Slider and input synchronization
  - Edge cases (max values, zero values)
- [ ] `tests/e2e/responsive.spec.ts` covers layouts
- [ ] `tests/e2e/accessibility.spec.ts` covers keyboard nav and screen readers
- [ ] All tests pass consistently

---

### TICKET-032: Cross-browser Testing

**Description:** Verify calculator works across all major browsers.

**Acceptance Criteria:**

- [ ] Chrome (latest) passes all E2E tests
- [ ] Firefox (latest) passes all E2E tests
- [ ] Safari (latest) passes all E2E tests
- [ ] Edge (latest) passes all E2E tests
- [ ] Mobile Safari and Chrome Android tested manually

---

### TICKET-033: Performance Optimization

**Description:** Optimize for fast load and interaction.

**Acceptance Criteria:**

- [ ] Lighthouse Performance score > 90
- [ ] Initial load < 2 seconds on 3G
- [ ] Time to Interactive < 3 seconds
- [ ] Calculation updates feel instant (<100ms perceived)
- [ ] Bundle size analyzed and optimized

---

## Epic 6: Documentation & Launch

### TICKET-034: Create Calculator Tooltips

**Description:** Add educational tooltips explaining each input field.

**Acceptance Criteria:**

- [ ] Each input has info icon with tooltip
- [ ] Tooltips explain field purpose and impact
- [ ] Tooltips use Shadcn Tooltip component
- [ ] Mobile-friendly (tap to show)
- [ ] Accessible to screen readers

---

### TICKET-035: Write Disclaimer Content

**Description:** Create the legal disclaimer for the calculator.

**Acceptance Criteria:**

- [ ] Disclaimer text matches template in plan
- [ ] Displayed in Footer and/or modal on first visit
- [ ] Lists all known limitations clearly
- [ ] Recommends consulting financial advisor

---

### TICKET-036: Create Methodology Documentation

**Description:** Document the calculation methodology for transparency.

**Acceptance Criteria:**

- [ ] Formulas documented and accessible from UI
- [ ] Assumptions explained with rationale
- [ ] Link to methodology from main calculator page
- [ ] Written in plain language for non-experts

---

### TICKET-037: Final QA Pass

**Description:** Complete quality assurance review before launch.

**Acceptance Criteria:**

- [ ] All tickets marked complete
- [ ] No critical or major bugs open
- [ ] All E2E and unit tests passing
- [ ] Lighthouse scores meet targets
- [ ] Accessibility audit complete
- [ ] Cross-browser testing complete
- [ ] Content review complete (no typos, clear language)

---

### TICKET-038: Production Deployment Setup

**Description:** Configure production build and deployment pipeline.

**Acceptance Criteria:**

- [ ] Production build runs without errors
- [ ] Build output optimized (minified, tree-shaken)
- [ ] Deployment target chosen (Vercel/Netlify/etc.)
- [ ] Environment variables configured if needed
- [ ] Deployment documented in README
