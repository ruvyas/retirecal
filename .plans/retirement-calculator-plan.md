# Canadian Retirement Calculator — MVP Product Plan

## Summary

A single-page application (SPA) that helps Canadian individuals estimate their retirement readiness through a simple, intuitive inline calculator. The MVP focuses on core savings projections without government benefits (CPP, OAS, QPP, RRIF) to establish a foundation for future enhancements.

---

## 1. Product Features

### 1.1 Core Calculator Inputs

| Input Field                      | Description                            | Validation             |
| -------------------------------- | -------------------------------------- | ---------------------- |
| **Current Age**                  | User's current age                     | 18-80 years            |
| **Annual Income**                | Pre-tax annual income                  | $0 - $10,000,000 CAD   |
| **RRSP Balance**                 | Current RRSP savings                   | $0+                    |
| **TFSA Balance**                 | Current TFSA savings                   | $0+                    |
| **Non-Registered Investments**   | Taxable investment accounts            | $0+                    |
| **Target Retirement Age**        | When user plans to retire              | Current age + 1 to 100 |
| **Monthly Savings Contribution** | How much they plan to save per month   | $0 - $50,000           |
| **Annual Retirement Spending**   | Expected yearly expenses in retirement | $0 - $1,000,000        |

### 1.2 Calculator Outputs

| Output                           | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| **Projected Retirement Savings** | Total accumulated savings at retirement age        |
| **Years Until Retirement**       | Simple countdown                                   |
| **Retirement Runway**            | How many years savings will last based on spending |
| **Monthly Retirement Income**    | Sustainable monthly withdrawal amount              |
| **Savings Gap/Surplus**          | Whether on track or needs adjustment               |
| **Visual Progress Indicator**    | Chart/gauge showing retirement readiness           |

### 1.3 MVP Scope Boundaries

**In Scope:**

- Single-user calculation (no couples in MVP)
- Basic compound growth projections
- Inflation adjustment
- Simple tax estimation for withdrawals
- Real-time calculation updates as inputs change

**Explicitly Out of Scope (Future Phases):**

- CPP/QPP benefits calculation
- OAS benefits calculation
- RRIF mandatory withdrawal rules
- Couples/joint planning
- User accounts/saved scenarios
- Provincial tax variations (use federal baseline)
- Employer matching contributions
- Pension income integration

---

## 2. UX Direction

### 2.1 Design Philosophy

Following the frontend-design skill guidelines, the calculator should avoid generic "AI slop" aesthetics and commit to a **bold, distinctive design direction**.

**Recommended Aesthetic: "Confident Financial Clarity"**

- Clean, editorial feel with generous whitespace
- Strong typographic hierarchy using distinctive fonts (avoid Inter, Roboto)
- Consider fonts like: Söhne, GT America, Neue Haas Grotesk, or similar refined sans-serifs
- Accent color palette that feels trustworthy but not boring (deep teals, warm grays, or sophisticated earth tones)
- Subtle micro-animations on input changes and result updates
- Dark mode support as primary or toggle option

### 2.2 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Minimal Nav (About | FAQ)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO SECTION                                               │
│  ─────────────                                              │
│  Headline: "How ready are you for retirement?"              │
│  Subhead: Brief value prop (1 sentence)                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CALCULATOR SECTION (Main Focus)                            │
│  ───────────────────────────────                            │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │                     │  │                     │          │
│  │   INPUT PANEL       │  │   RESULTS PANEL     │          │
│  │                     │  │                     │          │
│  │   • Age slider      │  │   • Savings at      │          │
│  │   • Income input    │  │     retirement      │          │
│  │   • Savings fields  │  │   • Monthly income  │          │
│  │   • Retirement age  │  │   • Years funded    │          │
│  │   • Monthly contrib │  │   • Visual chart    │          │
│  │   • Spending target │  │   • Status message  │          │
│  │                     │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ASSUMPTIONS ACCORDION (Collapsed by default)               │
│  ─────────────────────────────────────────────              │
│  • Inflation rate                                           │
│  • Expected return rate                                     │
│  • Tax rate assumptions                                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  EDUCATIONAL FOOTER                                         │
│  ─────────────────                                          │
│  Brief disclaimer + links to methodology                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Input Interaction Patterns

**Progressive Disclosure:**

- Start with essential fields visible (age, income, total savings)
- "Show advanced options" reveals account-type breakdown and assumptions
- Results update in real-time as user adjusts any input

**Input Components (Shadcn UI):**

- **Age & Retirement Age**: Slider with numeric input override
- **Currency Fields**: Input with CAD formatting, thousand separators
- **Savings Breakdown**: Collapsible card with RRSP/TFSA/Non-reg fields
- **Results**: Card component with clear visual hierarchy

**Feedback Mechanisms:**

- Immediate calculation on input change (debounced 150ms)
- Subtle animation on result updates
- Color-coded status (green = on track, amber = attention needed, red = significant gap)
- Tooltips explaining each field's impact

### 2.4 Mobile Responsiveness

- Stack input and results panels vertically on mobile
- Full-width sliders with large touch targets
- Sticky results summary at bottom on mobile
- Collapsible input sections to reduce scroll

### 2.5 Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation for all inputs
- Screen reader announcements for result changes
- Sufficient color contrast ratios
- Focus indicators on all interactive elements

---

## 3. Calculation Logic & Verification

### 3.1 Core Formulas

**Future Value of Current Savings:**

```
FV = PV × (1 + r)^n

Where:
- PV = Current savings (sum of RRSP + TFSA + Non-reg)
- r = Annual real return rate (nominal return - inflation)
- n = Years until retirement
```

**Future Value of Monthly Contributions:**

```
FV_contributions = PMT × [((1 + r)^n - 1) / r]

Where:
- PMT = Monthly contribution (annualized for calculation)
- r = Monthly real return rate
- n = Number of months until retirement
```

**Total Projected Savings:**

```
Total = FV_current_savings + FV_contributions
```

**Retirement Runway (Years Funded):**

```
Using present value of annuity formula solved for n:

n = -ln(1 - (PV × r / PMT)) / ln(1 + r)

Where:
- PV = Total savings at retirement
- r = Real return rate in retirement
- PMT = Annual spending in retirement
```

**Sustainable Monthly Income:**

```
Monthly_Income = (Total_Savings × r_retirement) / (1 - (1 + r_retirement)^(-expected_retirement_years)) / 12
```

### 3.2 Default Assumptions (Configurable)

| Assumption                           | Default Value | Rationale                       |
| ------------------------------------ | ------------- | ------------------------------- |
| Inflation Rate                       | 2.0%          | Bank of Canada target           |
| Pre-retirement Return (Conservative) | 4.0% nominal  | Balanced portfolio              |
| Pre-retirement Return (Moderate)     | 5.5% nominal  | Growth-tilted portfolio         |
| Pre-retirement Return (Aggressive)   | 7.0% nominal  | Equity-heavy portfolio          |
| Retirement Return                    | 3.5% nominal  | More conservative in retirement |
| Life Expectancy                      | 95 years      | Conservative estimate           |
| Withdrawal Tax Rate                  | 25%           | Simplified blended rate         |

### 3.3 Verification Strategy

#### Unit Testing (Calculation Engine)

Create a standalone calculation module with comprehensive unit tests:

```
Test Cases to Implement:
─────────────────────────

1. BASIC COMPOUND GROWTH
   Input: $100,000 @ 5% for 10 years
   Expected: $162,889.46

2. CONTRIBUTION ACCUMULATION
   Input: $500/month @ 5% for 20 years
   Expected: $205,516.83

3. COMBINED SCENARIO
   Input: $50,000 initial + $300/month @ 5% for 25 years
   Expected: $169,317.75 + $178,636.74 = $347,954.49

4. RETIREMENT RUNWAY
   Input: $500,000 savings, $40,000/year spending, 3% return
   Expected: ~15.7 years

5. EDGE CASES
   - Zero savings, zero contributions → $0 projection
   - Retirement age = current age → Current savings only
   - Very high spending vs savings → Immediate depletion warning
   - Maximum values → No overflow errors
```

#### Manual Verification Methods

1. **Spreadsheet Comparison**
   - Build identical calculations in Excel/Google Sheets
   - Input 10 test scenarios, compare outputs
   - Document any discrepancies > 0.01%

2. **Third-Party Calculator Cross-Reference**
   - Compare results against 3 established calculators:
     - Wealthsimple (reference)
     - Sun Life retirement calculator
     - RBC retirement calculator
   - Note: Exact match not expected due to different assumptions
   - Verify directional accuracy and reasonable ranges

3. **Financial Advisor Review**
   - Have a CFP review calculation methodology
   - Validate assumption ranges are reasonable
   - Sign-off on disclaimer language

#### Automated Testing Suite

```
Test Categories:
────────────────

├── Unit Tests (Vitest)
│   ├── calculation-engine.test.ts
│   │   ├── futureValue()
│   │   ├── contributionGrowth()
│   │   ├── retirementRunway()
│   │   └── sustainableIncome()
│   ├── input-validation.test.ts
│   │   ├── age bounds
│   │   ├── currency formatting
│   │   └── negative value handling
│   └── tax-estimation.test.ts
│
├── Integration Tests (Playwright)
│   ├── calculator-flow.spec.ts
│   │   ├── Input changes update results
│   │   ├── Slider and input sync
│   │   └── Reset functionality
│   ├── responsive.spec.ts
│   │   ├── Mobile layout
│   │   ├── Tablet layout
│   │   └── Desktop layout
│   └── accessibility.spec.ts
│       ├── Keyboard navigation
│       ├── Screen reader labels
│       └── Focus management
│
└── Visual Regression (Playwright)
    ├── calculator-states.spec.ts
    │   ├── Empty state
    │   ├── Filled state
    │   ├── Error state
    │   └── Success state
    └── responsive-screenshots.spec.ts
```

### 3.4 Known Limitations to Document

The calculator must clearly communicate these limitations to users:

1. **No Government Benefits**: Does not include CPP, OAS, QPP income
2. **Simplified Tax Treatment**: Uses flat estimated tax rate, not actual marginal rates
3. **No Provincial Variation**: Does not account for provincial tax differences
4. **Constant Returns Assumed**: Does not model market volatility or sequence-of-returns risk
5. **Inflation Constant**: Assumes steady inflation rate
6. **No Couples Planning**: Single-person calculations only
7. **No RRIF Rules**: Does not model mandatory RRIF withdrawals after age 71

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Runtime          | Bun                                                    |
| Framework        | React 18                                               |
| Build Tool       | Vite                                                   |
| UI Components    | Shadcn UI                                              |
| Styling          | Tailwind CSS                                           |
| Testing          | Playwright (E2E), Vitest (Unit)                        |
| State Management | React useState/useReducer (no external library needed) |

### 4.2 Project Structure

```
retirement-calculator/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn components
│   │   ├── Calculator/
│   │   │   ├── InputPanel.tsx
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── AssumptionsAccordion.tsx
│   │   │   └── index.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── Charts/
│   │       └── ProjectionChart.tsx
│   ├── lib/
│   │   ├── calculations/
│   │   │   ├── retirement.ts      # Core calculation engine
│   │   │   ├── tax.ts             # Tax estimation helpers
│   │   │   └── constants.ts       # Default assumptions
│   │   ├── utils/
│   │   │   ├── formatters.ts      # Currency, number formatting
│   │   │   └── validators.ts      # Input validation
│   │   └── types/
│   │       └── calculator.ts      # TypeScript interfaces
│   ├── hooks/
│   │   └── useCalculator.ts       # Main calculation hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── unit/
│   │   └── calculations.test.ts
│   ├── e2e/
│   │   ├── calculator.spec.ts
│   │   └── accessibility.spec.ts
│   └── fixtures/
│       └── test-scenarios.json
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── playwright.config.ts
```

### 4.3 Component Hierarchy

```
App
├── Header
├── HeroSection
├── Calculator
│   ├── InputPanel
│   │   ├── AgeSlider (Shadcn Slider)
│   │   ├── CurrencyInput (Shadcn Input + formatting)
│   │   ├── SavingsBreakdown
│   │   │   ├── Collapsible (Shadcn)
│   │   │   └── CurrencyInput × 3
│   │   ├── RetirementAgeSlider
│   │   └── SpendingInput
│   ├── ResultsPanel
│   │   ├── SummaryCard (Shadcn Card)
│   │   ├── ProjectionChart
│   │   └── StatusIndicator
│   └── AssumptionsAccordion (Shadcn Accordion)
└── Footer
```

---

## 5. Ticket Breakdown Suggestions

### Epic 1: Project Setup

- [ ] Initialize Vite + React + TypeScript project with Bun
- [ ] Configure Tailwind CSS
- [ ] Install and configure Shadcn UI
- [ ] Set up Playwright for E2E testing
- [ ] Set up Vitest for unit testing
- [ ] Configure ESLint + Prettier

### Epic 2: Calculation Engine

- [ ] Implement future value calculation function
- [ ] Implement contribution growth calculation
- [ ] Implement retirement runway calculation
- [ ] Implement sustainable income calculation
- [ ] Create constants file with default assumptions
- [ ] Write unit tests for all calculation functions
- [ ] Create test scenarios spreadsheet for verification

### Epic 3: UI Components

- [ ] Create layout components (Header, Footer)
- [ ] Build AgeSlider component with Shadcn
- [ ] Build CurrencyInput component with formatting
- [ ] Build SavingsBreakdown collapsible section
- [ ] Build ResultsPanel with summary cards
- [ ] Build AssumptionsAccordion
- [ ] Implement responsive layout

### Epic 4: Calculator Integration

- [ ] Create useCalculator hook
- [ ] Wire up inputs to calculation engine
- [ ] Implement real-time result updates
- [ ] Add status indicators (on-track/needs-attention)
- [ ] Add result animations

### Epic 5: Polish & Testing

- [ ] Implement chosen design aesthetic (typography, colors, spacing)
- [ ] Add micro-animations and transitions
- [ ] Write E2E tests with Playwright
- [ ] Accessibility audit and fixes
- [ ] Cross-browser testing
- [ ] Performance optimization

### Epic 6: Documentation & Launch

- [ ] Write methodology documentation
- [ ] Create disclaimer content
- [ ] Add educational tooltips
- [ ] Final QA pass
- [ ] Production deployment setup

---

## 6. Success Metrics (Post-Launch)

| Metric                         | Target                             |
| ------------------------------ | ---------------------------------- |
| Page Load Time                 | < 2 seconds                        |
| Lighthouse Performance Score   | > 90                               |
| Lighthouse Accessibility Score | 100                                |
| Calculator Completion Rate     | > 70% of visitors input all fields |
| Bounce Rate                    | < 40%                              |
| Time on Page                   | > 2 minutes                        |

---

## 7. Future Enhancements (Post-MVP)

**Phase 2: Government Benefits**

- CPP/QPP calculation based on contribution history
- OAS eligibility and clawback calculation
- RRIF mandatory withdrawal modeling

**Phase 3: Couples Planning**

- Joint retirement scenarios
- Income splitting optimization
- Spousal RRSP strategies

**Phase 4: Advanced Features**

- User accounts with saved scenarios
- Multiple scenario comparison
- Export to PDF report
- Provincial tax accuracy
- Integration with actual account data (with consent)

---

## Appendix A: Competitor Analysis Summary

| Feature                | Wealthsimple | Sun Life | Our MVP |
| ---------------------- | ------------ | -------- | ------- |
| CPP/OAS Integration    | ✓            | ✓        | ✗       |
| Account Type Breakdown | Partial      | ✓        | ✓       |
| Real-time Updates      | ✓            | ✗        | ✓       |
| Couples Support        | ✓            | ✓        | ✗       |
| Visual Projections     | ✓            | ✓        | ✓       |
| Mobile Responsive      | ✓            | ✓        | ✓       |
| No Login Required      | ✓            | ✓        | ✓       |

---

## Appendix B: Disclaimer Template

> **Important:** This calculator provides estimates for educational purposes only and should not be considered financial advice. Results are based on simplified assumptions and do not account for government benefits (CPP, OAS, QPP), actual tax brackets, market volatility, or individual circumstances. Consult a qualified financial advisor for personalized retirement planning.
