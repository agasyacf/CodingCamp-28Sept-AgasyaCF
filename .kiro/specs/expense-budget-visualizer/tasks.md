# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a fully client-side, single-page Expense & Budget Visualizer using plain HTML, CSS, and Vanilla JavaScript. The app records expense transactions, displays a running balance, and visualizes spending via a Chart.js pie chart. All data persists in Local Storage. All five optional features (custom categories, monthly summary, sort order, spending limit highlight, dark/light theme toggle) are included.

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic HTML: header, balance section, two-column layout (form + chart), transaction list section, and placeholder elements for all optional feature controls
  - Add `<link>` to `css/style.css` and `<script>` tags for Chart.js CDN and `js/app.js` (in that order, at end of `<body>`)
  - Create `css/style.css` with an empty file ready for styles
  - Create `js/app.js` with the comment-banner section skeleton (CONSTANTS, STATE, LOCAL STORAGE, VALIDATION, BUSINESS LOGIC, RENDER: BALANCE, RENDER: TRANSACTION LIST, RENDER: PIE CHART, RENDER: FORM, OPTIONAL sections, EVENT HANDLERS, INIT)
  - Add `aria-live="polite"` inline-error regions under each form field and a `role="alert"` system banner container at the top of `<body>`
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Implement constants, state, and Local Storage layer
  - [x] 2.1 Define CONSTANTS and initial appState
    - Define `DEFAULT_CATEGORIES`, `STORAGE_KEY`, and `MAX_AMOUNT` constants in the CONSTANTS section
    - Define the `appState` object with all fields: `transactions`, `categories`, `sortOrder`, `spendingLimit`, `theme`, `activeView`
    - _Requirements: 1.2, 5.1, 5.3_

  - [x] 2.2 Implement `loadFromStorage()` and `persistState()`
    - Write `loadFromStorage()`: reads from `localStorage`, returns `null` on missing data, handles `DOMException` (unavailable) and `SyntaxError` (corrupt) with `showSystemBanner()` calls, removes the corrupt key on parse failure
    - Write `persistState()`: serializes `appState` to the storage schema (transactions + customCategories + sortOrder + spendingLimit + theme), catches write errors with `showSystemBanner()`
    - Write `showSystemBanner(message, type)` helper in the LOCAL STORAGE section to render/auto-dismiss banners
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ]* 2.3 Write property test for storage round-trip (Property 9)
    - **Property 9: Transaction storage round-trip preserves data**
    - **Validates: Requirements 5.1, 5.3**

- [x] 3. Implement pure business logic functions
  - [x] 3.1 Implement `formatCurrency`, `computeBalance`, and `validateTransaction`
    - Write `formatCurrency(amount)`: returns `"$1,234.56"` for positive values and `"-$50.00"` for negative values
    - Write `computeBalance(transactions)`: sums all `amount` fields, rounds to 2 decimal places
    - Write `validateTransaction(name, amount, category)`: returns `{ valid, errors }` — rejects empty name, amount ≤ 0, and missing category
    - _Requirements: 1.3, 1.4, 1.5, 3.1, 3.4, 3.5_

  - [x] 3.2 Write property test for `computeBalance` (Property 6)
    - **Property 6: Balance equals the sum of transaction amounts**
    - **Validates: Requirements 3.1, 3.4, 3.5**

  - [x] 3.3 Write property test for invalid form submissions (Property 2)
    - **Property 2: Invalid form submissions are rejected**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 3.4 Implement `aggregateByCategory` and `isOverLimit`
    - Write `aggregateByCategory(transactions)`: groups by category, sums amounts per category, rounds each to 2 decimal places, returns `{ [category]: total }`
    - Write `isOverLimit(balance, spendingLimit)`: returns `true` when balance > spendingLimit and limit is not `null`; always returns `false` when limit is `null`
    - _Requirements: 4.1, 4.4, 9.3, 9.4_

  - [ ]* 3.5 Write property test for `aggregateByCategory` (Property 7)
    - **Property 7: Chart data matches aggregated category totals**
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 3.6 Write property test for `isOverLimit` (Property 15)
    - **Property 15: Spending limit comparison determines highlight state**
    - **Validates: Requirements 9.3, 9.4**

  - [x] 3.7 Implement `sortTransactions` and `validateSpendingLimit`
    - Write `sortTransactions(transactions, sortOrder)`: returns a sorted copy using a stable sort for `amount-asc`, `amount-desc`, and `category-alpha`; returns input copy unchanged for `null`
    - Write `validateSpendingLimit(value)`: rejects non-numeric, zero, negative, and values > 999,999,999.99
    - _Requirements: 8.2, 9.2_

  - [ ]* 3.8 Write property test for `sortTransactions` ordering invariant (Property 12)
    - **Property 12: Sort ordering invariant holds for all inputs**
    - **Validates: Requirements 8.2**

  - [ ]* 3.9 Write property test for invalid spending limit rejection (Property 14)
    - **Property 14: Invalid spending limits are rejected**
    - **Validates: Requirements 9.2**

- [x] 4. Checkpoint — Ensure all business logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement core render functions
  - [x] 5.1 Implement `renderBalance()`
    - Read `computeBalance(appState.transactions)` and update the Balance Display element's text content
    - Apply the warning highlight class when `isOverLimit(balance, appState.spendingLimit)` returns `true`; remove it otherwise
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.3, 9.4_

  - [x] 5.2 Implement `renderCategoryDropdown()`
    - Populate the category `<select>` with `appState.categories` (DEFAULT_CATEGORIES + custom)
    - Preserve the currently selected value if still valid; otherwise reset to placeholder
    - _Requirements: 1.1, 1.2, 6.2_

  - [x] 5.3 Implement `renderTransactionList()`
    - Re-derive the display list by applying `sortTransactions(appState.transactions, appState.sortOrder)`
    - Build and insert a row for each transaction showing name, formatted amount, category, and a delete button with a `data-id` attribute
    - Render the "no transactions" empty state when the list is empty
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 5.4 Write property test for transaction list renders all transactions (Property 4)
    - **Property 4: Transaction list renders all transactions**
    - **Validates: Requirements 2.1, 2.4**

  - [x] 5.5 Implement `renderPieChart()` / `updatePieChart()`
    - On first call, create the Chart.js `'pie'` instance with formatted tooltip callbacks (name, formatted amount, percentage)
    - On subsequent calls, update `pieChart.data.labels` and `pieChart.data.datasets[0].data` and call `pieChart.update()`
    - Show/hide the chart placeholder message when `appState.transactions` is empty
    - Handle Chart.js CDN unavailability by rendering an inline fallback message
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.6 Implement `renderAll()`
    - Call `renderBalance()`, `renderCategoryDropdown()`, `renderTransactionList()`, and `renderPieChart()` in sequence
    - _Requirements: 5.3_

- [x] 6. Implement add-transaction and delete-transaction flows
  - [x] 6.1 Wire the Input Form submit event handler
    - Read name, amount, and category from the form; call `validateTransaction()`
    - On validation failure: display inline error messages in the `aria-live` regions; do not add a transaction
    - On success: generate a new transaction `{ id: crypto.randomUUID(), name, amount: parseFloat(amount), category, createdAt: new Date().toISOString() }`, push to `appState.transactions`, call `persistState()`, call `renderAll()`, clear form fields
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 5.1_

  - [ ]* 6.2 Write property test for valid transaction add grows the list (Property 1)
    - **Property 1: Valid transaction add grows the list**
    - **Validates: Requirements 1.3**

  - [ ]* 6.3 Write property test for form clears after successful add (Property 3)
    - **Property 3: Form clears after successful add**
    - **Validates: Requirements 1.6**

  - [x] 6.4 Wire the delete button event handler (event delegation on the list container)
    - Read `data-id` from the clicked delete button; filter `appState.transactions` to remove the matching entry
    - Call `persistState()`, then `renderAll()`
    - _Requirements: 2.5, 5.2_

  - [ ]* 6.5 Write property test for delete removes from state and storage (Property 5)
    - **Property 5: Delete removes transaction from state and storage**
    - **Validates: Requirements 2.5, 5.2**

- [x] 7. Checkpoint — Core add/delete/display flows working end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement optional feature: Custom Categories
  - [ ] 8.1 Add custom category UI to `index.html` and style in `css/style.css`
    - Add a text input and "Add Category" button in a custom-category control section
    - Add an inline error `aria-live` region below the input
    - _Requirements: 6.1_

  - [ ] 8.2 Implement `validateCustomCategory(name, existingCategories)` in `js/app.js`
    - Reject empty/whitespace names and names that match any existing category (case-insensitive); reject if custom count already equals 20
    - _Requirements: 6.4, 6.5_

  - [ ]* 8.3 Write property test for custom category validation (Property 10)
    - **Property 10: Custom category validation rejects duplicates and empty names**
    - **Validates: Requirements 6.4, 6.5**

  - [ ] 8.4 Wire the "Add Category" event handler
    - On validation failure: show inline error; no change to state
    - On success: push the trimmed name to a `customCategories` array tracked separately, rebuild `appState.categories` as `[...DEFAULT_CATEGORIES, ...customCategories]`, call `persistState()`, call `renderCategoryDropdown()`
    - _Requirements: 6.2, 6.3_

  - [ ]* 8.5 Write property test for custom category persists to storage (Property 11)
    - **Property 11: Custom category add persists to storage**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 9. Implement optional feature: Transaction Sorting
  - [ ] 9.1 Add sort-order UI to `index.html` and style in `css/style.css`
    - Add a `<select>` with options: default (no sort), Amount ↑, Amount ↓, Category A–Z
    - _Requirements: 8.1_

  - [ ] 9.2 Wire the sort-order change event handler
    - Update `appState.sortOrder` with the selected value; call `persistState()`; call `renderTransactionList()`
    - On page load, restore saved sort order from storage and reflect it in the `<select>` element
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 9.3 Write property test for sort preference persists (Property 13)
    - **Property 13: Sort preference persists and is restored**
    - **Validates: Requirements 8.4**

- [ ] 10. Implement optional feature: Monthly Summary View
  - [ ] 10.1 Implement `groupByMonth(transactions)` in `js/app.js`
    - Parse `createdAt` ISO strings; group by `YYYY-MM`; compute per-category totals and overall month total; return array sorted in reverse chronological order, skipping months with no transactions
    - _Requirements: 7.2, 7.4_

  - [ ]* 10.2 Write property test for monthly grouping excludes empty months (Property 17)
    - **Property 17: Monthly grouping excludes empty months**
    - **Validates: Requirements 7.2, 7.4**

  - [ ] 10.3 Add monthly summary UI and `renderMonthlySummary()` to `index.html` and `js/app.js`
    - Add a "Full List | Monthly Summary" toggle control to `index.html`
    - Implement `renderMonthlySummary()`: call `groupByMonth()`, render one section per month with a heading and per-category rows; show in place of the transaction list when `appState.activeView === 'monthly'`
    - Wire the toggle to update `appState.activeView` and swap the visible view; update within 500 ms of any transaction change
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Implement optional feature: Spending Limit Highlight
  - [ ] 11.1 Add spending limit UI to `index.html` and style in `css/style.css`
    - Add a numeric input and "Set" button for the spending limit below the Balance Display
    - Add an inline error `aria-live` region
    - Add a warning highlight CSS class (e.g., `.balance--over-limit`) with a visually distinct style
    - _Requirements: 9.1_

  - [ ] 11.2 Wire the spending limit "Set" event handler
    - Call `validateSpendingLimit(value)` on submit; show inline error on failure
    - On success: update `appState.spendingLimit`; call `persistState()` (catch write failures per Requirement 9.6 — show error, retain previous value); call `renderBalance()`
    - On page load, restore spending limit from storage
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

  - [ ]* 11.3 Write property test for spending limit persists (Property 16)
    - **Property 16: Spending limit persists and is restored**
    - **Validates: Requirements 9.5**

- [ ] 12. Implement optional feature: Dark/Light Theme Toggle
  - [ ] 12.1 Add theme toggle control to `index.html` and theme CSS to `css/style.css`
    - Add a button/toggle in the header (e.g., "🌙 / ☀️") to `index.html`
    - Define `.theme-dark` CSS class on the root `<html>` or `<body>` element with overrides for all backgrounds, text, borders; ensure contrast ratios meet WCAG 2.1 Level AA (≥ 4.5:1 normal text, ≥ 3:1 large text / UI components)
    - _Requirements: 10.1, 10.5_

  - [ ] 12.2 Wire the theme toggle event handler
    - Toggle `appState.theme` between `'light'` and `'dark'`; add/remove `.theme-dark` class on the root element; call `persistState()`
    - On page load: apply stored theme before any other rendering; default to `'light'` when no value is stored
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ]* 12.3 Write property test for theme activation applies correct class and persists (Property 18)
    - **Property 18: Theme activation applies correct class and persists**
    - **Validates: Requirements 10.2, 10.3**

- [ ] 13. Implement `init()` and wire startup
  - Call `loadFromStorage()` in `init()`, populate `appState` (merge stored custom categories with defaults, restore sortOrder, spendingLimit, and theme), then call `renderAll()`
  - Apply stored theme class before `renderAll()` to avoid a flash of wrong theme
  - Detect Local Storage unavailability at startup (feature-detect with a try/write/read/delete probe); if unavailable, show the full-page unsupported banner per Requirement 12.3
  - Attach all event listeners (form submit, delete delegation, sort change, category add, spending limit set, theme toggle, view toggle)
  - Call `init()` at the end of `js/app.js`
  - _Requirements: 5.3, 5.4, 10.3, 10.4, 12.3_

- [ ] 14. Apply layout and responsive CSS
  - Style the two-column layout (form + chart side by side on wide screens, stacked on narrow screens) in `css/style.css`
  - Style the transaction list (scrollable container), balance display, form fields, buttons, inline error messages, and system banner
  - Style all optional feature controls (sort selector, category input, spending limit input, theme toggle, view toggle)
  - Ensure no elements overlap, are truncated, or obscure others in Chrome, Firefox, Edge, and Safari
  - _Requirements: 2.2, 10.5, 11.1, 11.2, 12.1, 12.2_

- [ ] 15. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP
- All property tests reference specific properties from the design's Correctness Properties section
- The design specifies JavaScript as the implementation language (Vanilla JS, no transpilation)
- No build tools or frameworks — Chart.js is the only external dependency, loaded via CDN
- Optional features (tasks 8–12) are additive and do not require restructuring core tasks (1–7)
- The `tests/` directory is for local development only and is not deployed to GitHub Pages

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "3.4", "3.7"] },
    { "id": 2, "tasks": ["2.3", "3.2", "3.3", "3.5", "3.6", "3.8", "3.9"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.5", "5.6", "10.1"] },
    { "id": 4, "tasks": ["5.4", "6.1", "10.2"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "8.2"] },
    { "id": 6, "tasks": ["6.5", "8.3", "8.4", "9.2"] },
    { "id": 7, "tasks": ["8.5", "9.3", "10.3", "11.2", "12.2"] },
    { "id": 8, "tasks": ["8.1", "9.1", "11.1", "11.3", "12.1", "12.3"] }
  ]
}
```
