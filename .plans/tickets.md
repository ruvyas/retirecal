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

- [ ] `src/components/Layout/Header.tsx` with logo placeholder and minimal nav
- [ ] `src/components/Layout/Footer.tsx` with disclaimer placeholder
- [ ] Responsive styling (mobile-first)
- [ ] Components use Tailwind classes matching design aesthetic
- [ ] Unit tests verify components render without errors

---

### TICKET-015: Create CurrencyInput Component

**Description:** Build a currency input component with CAD formatting and thousand separators.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/CurrencyInput.tsx` wraps Shadcn Input
- [ ] Displays value with CAD formatting ($1,234.56)
- [ ] Handles numeric input, strips non-numeric characters
- [ ] Supports min/max value constraints
- [ ] Accessible with proper labels and ARIA attributes
- [ ] Unit tests cover:
  - Value formatting on blur
  - Value parsing on input
  - Min/max constraint enforcement
  - Accessibility attributes present

---

### TICKET-016: Create AgeSlider Component

**Description:** Build an age slider with both slider and numeric input controls.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/AgeSlider.tsx` uses Shadcn Slider
- [ ] Numeric input shows current value and allows override
- [ ] Slider and input stay synchronized
- [ ] Supports configurable min/max (default 18-100)
- [ ] Accessible with proper labels
- [ ] Unit tests cover:
  - Slider value change updates input
  - Input value change updates slider
  - Boundary validation (min/max)
  - Accessibility attributes present

---

### TICKET-017: Create SavingsBreakdown Component

**Description:** Build collapsible section for RRSP, TFSA, and non-registered savings inputs.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/SavingsBreakdown.tsx` uses Shadcn Collapsible
- [ ] Contains 3 CurrencyInput fields (RRSP, TFSA, Non-registered)
- [ ] Shows total savings when collapsed
- [ ] Expands to show individual account inputs
- [ ] Values sum correctly to total
- [ ] Unit tests cover:
  - Collapse/expand functionality
  - Sum calculation accuracy
  - Individual field updates

---

### TICKET-018: Create InputPanel Component

**Description:** Build the main input panel containing all calculator inputs.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/InputPanel.tsx` combines all input components
- [ ] Includes: Current Age, Annual Income, Savings Breakdown, Retirement Age, Monthly Contribution, Annual Retirement Spending
- [ ] Accepts `onChange` callback prop for value updates
- [ ] Debounces changes (150ms) before notifying
- [ ] Mobile-responsive layout (stacked on small screens)
- [ ] Unit tests cover:
  - All inputs render
  - Change callbacks fire correctly
  - Debouncing works as expected

---

### TICKET-019: Create ResultsPanel Component

**Description:** Build the results display panel showing calculated projections.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/ResultsPanel.tsx` uses Shadcn Card
- [ ] Displays: Projected Savings, Years Until Retirement, Retirement Runway, Monthly Income, Gap/Surplus
- [ ] Status indicator with color coding (green/amber/red)
- [ ] Values formatted with currency/number formatting
- [ ] Responsive layout
- [ ] Unit tests cover:
  - All result values display correctly
  - Status indicator shows correct color for each state
  - Formatting applied correctly

---

### TICKET-020: Create StatusIndicator Component

**Description:** Build visual indicator showing retirement readiness status.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/StatusIndicator.tsx` created
- [ ] Three states: on-track (green), attention-needed (amber), significant-gap (red)
- [ ] Clear visual distinction between states
- [ ] Accessible with screen reader text
- [ ] Unit tests cover:
  - Correct color for each status
  - Accessibility text present
  - Status transitions work correctly

---

### TICKET-021: Create AssumptionsAccordion Component

**Description:** Build collapsible section showing and optionally editing calculation assumptions.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/AssumptionsAccordion.tsx` uses Shadcn Accordion
- [ ] Displays: Inflation rate, Expected return rate, Tax rate assumptions
- [ ] Collapsed by default
- [ ] Shows current values with explanatory text
- [ ] Unit tests cover:
  - Accordion expands/collapses
  - All assumption values display correctly

---

### TICKET-022: Create ProjectionChart Component

**Description:** Build visual chart showing savings growth projection over time.

**Acceptance Criteria:**

- [ ] `src/components/Charts/ProjectionChart.tsx` created
- [ ] Shows savings trajectory from current age to life expectancy
- [ ] Highlights retirement age transition point
- [ ] Responsive sizing
- [ ] Accessible with data table alternative or ARIA descriptions
- [ ] Unit tests cover:
  - Chart renders with valid data
  - Handles edge cases (empty data, single point)

---

## Epic 4: Calculator Integration

### TICKET-023: Create useCalculator Hook

**Description:** Build the main state management hook for the calculator.

**Acceptance Criteria:**

- [ ] `src/hooks/useCalculator.ts` manages all calculator state
- [ ] Uses `useReducer` for complex state management
- [ ] Exposes: inputs, results, setInput, reset functions
- [ ] Triggers recalculation on input changes
- [ ] Memoizes expensive calculations
- [ ] Unit tests cover:
  - Initial state is correct
  - Input updates trigger recalculation
  - Reset restores initial state
  - All calculated values are correct

---

### TICKET-024: Wire Calculator Components Together

**Description:** Integrate all calculator components with the useCalculator hook.

**Acceptance Criteria:**

- [ ] `src/components/Calculator/index.tsx` assembles all pieces
- [ ] InputPanel connected to useCalculator dispatch
- [ ] ResultsPanel receives calculated results
- [ ] Real-time updates work end-to-end
- [ ] E2E test verifies: changing input updates results

---

### TICKET-025: Implement Input Validation

**Description:** Add validation logic for all user inputs.

**Acceptance Criteria:**

- [ ] `src/lib/utils/validators.ts` with validation functions
- [ ] Age validation: 18-80 for current, current+1 to 100 for retirement
- [ ] Currency validation: non-negative, within defined bounds
- [ ] Error messages displayed for invalid inputs
- [ ] Invalid inputs don't crash calculations
- [ ] Unit tests cover all validation rules

---

### TICKET-026: Add Formatting Utilities

**Description:** Create utility functions for number and currency formatting.

**Acceptance Criteria:**

- [ ] `src/lib/utils/formatters.ts` with:
  - `formatCurrency(value)`: returns "$1,234.56"
  - `formatNumber(value)`: returns "1,234"
  - `formatYears(value)`: returns "25 years"
  - `parseCurrency(string)`: returns number
- [ ] Handles edge cases: NaN, Infinity, negative
- [ ] Unit tests cover all formatters and parsers

---

## Epic 5: Polish & Testing

### TICKET-027: Implement Design System (Typography & Colors)

**Description:** Apply the "Confident Financial Clarity" design aesthetic.

**Acceptance Criteria:**

- [ ] Typography system with distinctive fonts configured
- [ ] Color palette defined in CSS variables (teals, warm grays, earth tones)
- [ ] Consistent spacing scale applied
- [ ] Dark mode toggle functional
- [ ] Visual consistency across all components

---

### TICKET-028: Add Micro-animations and Transitions

**Description:** Implement subtle animations for input/result interactions.

**Acceptance Criteria:**

- [ ] Result values animate on change
- [ ] Status indicator transitions smoothly between states
- [ ] Accordion/collapsible animations are smooth
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Performance: no janky animations, 60fps target

---

### TICKET-029: Implement Mobile Responsive Layout

**Description:** Ensure full mobile responsiveness for all components.

**Acceptance Criteria:**

- [ ] Input and Results panels stack vertically on mobile (<768px)
- [ ] Touch targets minimum 44x44px
- [ ] Full-width sliders on mobile
- [ ] Sticky results summary option on mobile
- [ ] E2E tests verify layouts at 375px, 768px, 1024px, 1440px

---

### TICKET-030: Accessibility Audit and Fixes

**Description:** Ensure WCAG 2.1 AA compliance.

**Acceptance Criteria:**

- [ ] All inputs have associated labels
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works for entire calculator
- [ ] Screen reader announces result changes
- [ ] Color contrast ratios meet AA standards (4.5:1 text, 3:1 UI)
- [ ] Axe accessibility tests pass in E2E suite

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
