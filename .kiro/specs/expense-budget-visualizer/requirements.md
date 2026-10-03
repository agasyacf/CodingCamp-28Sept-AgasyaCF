# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses by category, view a running total balance, and visualize spending distribution through a pie chart. The app is built with HTML, CSS, and Vanilla JavaScript, stores all data in the browser's Local Storage, and requires no backend server or complex setup. Users can optionally extend the app with custom categories, monthly summaries, transaction sorting, spending limit highlights, and a dark/light mode toggle. The app can be deployed as a standalone web page via GitHub Pages.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application.
- **Transaction**: A single expense record consisting of an Item Name, Amount, and Category.
- **Transaction_List**: The scrollable on-screen list displaying all recorded Transactions.
- **Input_Form**: The HTML form used to enter a new Transaction.
- **Balance_Display**: The UI element at the top of the page showing the current total balance.
- **Category**: A classification label assigned to a Transaction. Default categories are Food, Transport, and Fun.
- **Custom_Category**: A user-defined Category beyond the three defaults.
- **Pie_Chart**: A visual chart rendered by Chart.js showing spending distribution by Category.
- **Local_Storage**: The browser's Local Storage API used to persist Transaction data client-side.
- **Monthly_Summary**: A filtered view showing Transactions grouped by calendar month with per-category subtotals.
- **Spending_Limit**: A user-defined maximum amount for total or per-category spending.
- **Theme**: The visual color scheme of the App, either light or dark.
- **Sort_Order**: The user-selected ordering applied to the Transaction_List (by Amount ascending/descending or by Category alphabetically).

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill out a form with an item name, amount, and category, so that I can record a new expense quickly.

#### Acceptance Criteria

1. THE Input_Form SHALL display a text field for Item Name (maximum 100 characters), a numeric field for Amount (range 0.01–999,999,999.99), and a dropdown selector for Category.
2. THE Input_Form SHALL populate the Category dropdown with exactly the default options: Food, Transport, and Fun (plus any Custom_Categories that have been added).
3. WHEN the user submits the Input_Form with all fields filled and Amount greater than zero, THE App SHALL add a new Transaction containing the entered Item Name, Amount, and Category to the Transaction_List.
4. WHEN the user submits the Input_Form with one or more empty fields, THE Input_Form SHALL display a validation error message identifying each empty field by name and SHALL NOT add a Transaction.
5. WHEN the user submits the Input_Form with an Amount of zero or less, THE Input_Form SHALL display a validation error message stating that the amount must be greater than zero and SHALL NOT add a Transaction.
6. WHEN a Transaction is successfully added, THE Input_Form SHALL clear the Item Name field, clear the Amount field, and reset the Category dropdown to show no selection or its placeholder value.

---

### Requirement 2: Transaction List

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions, so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display every recorded Transaction, each showing its Item Name, Amount, and Category.
2. WHILE the number of Transactions exceeds the visible area, THE Transaction_List SHALL be scrollable so all Transactions remain accessible.
3. WHEN a Transaction is added or deleted, THE Transaction_List SHALL update within 500 milliseconds to reflect the current set of Transactions without requiring a page reload.
4. THE Transaction_List SHALL display a delete button for each Transaction entry.
5. WHEN the user activates the delete button for a Transaction, THE App SHALL remove that Transaction from the Transaction_List and from Local_Storage.
6. IF Local_Storage contains no recorded Transactions, THEN THE Transaction_List SHALL display a message indicating that no transactions have been recorded.

---

### Requirement 3: Total Balance Display

**User Story:** As a user, I want to see my total balance at the top of the page, so that I can quickly understand my overall spending.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of all Transaction Amounts as the current total balance, formatted with a currency symbol and 2 decimal places (e.g., $50.00).
2. WHEN a Transaction is added, THE Balance_Display SHALL update to reflect the new total without requiring a page reload.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update to reflect the revised total without requiring a page reload.
4. WHILE no Transactions have been recorded, THE Balance_Display SHALL show a balance of $0.00.
5. WHEN the total balance is negative, THE Balance_Display SHALL display the value with a leading minus sign (e.g., -$50.00).

---

### Requirement 4: Spending Pie Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going at a glance.

#### Acceptance Criteria

1. THE Pie_Chart SHALL render a pie chart using Chart.js that shows one segment per Category present in the Transaction_List, where each segment's size is proportional to that Category's total transaction amount as a percentage of all transactions.
2. WHEN a Transaction is added or deleted, THE Pie_Chart SHALL update automatically within 500 milliseconds to reflect the new spending distribution by Category.
3. WHILE no Transactions have been recorded, THE Pie_Chart SHALL display a placeholder state containing a message indicating no spending data is available, instead of rendering an empty chart or producing an error.
4. THE Pie_Chart SHALL display a legend listing each Category name and its corresponding total amount rounded to 2 decimal places.
5. WHEN the user hovers over a pie segment, THE Pie_Chart SHALL display a tooltip showing the Category name, total amount rounded to 2 decimal places, and percentage of total spending rounded to 1 decimal place.

---

### Requirement 5: Local Storage Persistence

**User Story:** As a user, I want my transactions to be saved in my browser, so that my data is preserved when I close and reopen the app.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL write the updated Transaction dataset to Local_Storage.
2. WHEN a Transaction is deleted, THE App SHALL write the updated Transaction dataset to Local_Storage.
3. WHEN the App loads, THE App SHALL read all previously stored Transactions from Local_Storage and render them in the Transaction_List, Balance_Display, and Pie_Chart; if Local_Storage contains no Transaction data, THE App SHALL render an empty Transaction dataset.
4. IF Local_Storage is unavailable when the App attempts a read or write operation, THEN THE App SHALL display an error message indicating Local_Storage is unavailable and continue operating with an empty Transaction dataset.
5. IF Local_Storage contains Transaction data that cannot be parsed, THEN THE App SHALL display an error message indicating the stored data is corrupted and continue operating with an empty Transaction dataset.

---

### Requirement 6: Custom Categories (Optional)

**User Story:** As a user, I want to create my own spending categories, so that I can track expenses that don't fit the default options.

#### Acceptance Criteria

1. WHERE custom categories are enabled, THE App SHALL provide a UI control that allows the user to enter and save a Custom_Category name of 1 to 50 characters.
2. WHEN the user saves a Custom_Category, THE App SHALL add it to the Category dropdown in the Input_Form.
3. WHEN a Custom_Category is added, THE App SHALL persist it in Local_Storage so it is available after page reload.
4. IF the user attempts to save a Custom_Category with an empty name or a name that matches an existing Category (case-insensitive), THEN THE App SHALL display a validation error and SHALL NOT add the duplicate or empty category.
5. IF the total number of custom categories would exceed 20, THEN THE App SHALL display a validation error and SHALL NOT add the new category.

---

### Requirement 7: Monthly Summary View (Optional)

**User Story:** As a user, I want to see a summary of my spending grouped by month, so that I can review trends over time.

#### Acceptance Criteria

1. WHERE the monthly summary is enabled, THE App SHALL provide a UI control to switch between the full Transaction_List view and the Monthly_Summary view.
2. WHEN the Monthly_Summary view is active, THE App SHALL display Transactions grouped by calendar month in reverse chronological order, showing the total amount spent per Category for each month.
3. WHILE the Monthly_Summary view is active, WHEN a Transaction is added or deleted, THE Monthly_Summary SHALL update within 500 milliseconds to reflect the change.
4. WHILE the Monthly_Summary view is active, IF no Transactions exist for a given month, THEN THE App SHALL not display that month in the Monthly_Summary.

---

### Requirement 8: Transaction Sorting (Optional)

**User Story:** As a user, I want to sort my transaction list by amount or category, so that I can quickly find and compare entries.

#### Acceptance Criteria

1. WHERE sorting is enabled, THE App SHALL display a Sort_Order selector offering options: Amount (ascending), Amount (descending), and Category (alphabetically by category name).
2. WHERE sorting is enabled, WHEN the user selects a Sort_Order, THE Transaction_List SHALL re-render in the selected order within 200 milliseconds; transactions with equal sort values SHALL retain their original insertion order.
3. WHERE sorting is enabled, WHEN a Transaction is added while a Sort_Order is active, THE Transaction_List SHALL insert the new Transaction in the correct position per the active Sort_Order; if the new Transaction's sort value equals existing entries, it SHALL appear after all existing entries with the same value.
4. WHERE sorting is enabled, WHEN the user selects a Sort_Order, THE App SHALL persist the selected Sort_Order in Local_Storage.
5. WHERE sorting is enabled, WHEN the page loads and a Sort_Order is present in Local_Storage, THE Transaction_List SHALL apply that Sort_Order immediately, within 200 milliseconds of render.
6. WHERE sorting is enabled, IF Local_Storage does not contain a valid Sort_Order on page load, THEN THE App SHALL display the Transaction_List in default insertion order with no Sort_Order selected.

---

### Requirement 9: Spending Limit Highlight (Optional)

**User Story:** As a user, I want to set a spending limit and be alerted when I exceed it, so that I can stay within my budget.

#### Acceptance Criteria

1. WHERE spending limits are enabled, THE App SHALL provide a UI control for the user to enter a numeric Spending_Limit greater than 0 and no greater than 999,999,999.99.
2. IF the user enters a Spending_Limit that is non-numeric, zero, negative, or exceeds 999,999,999.99, THEN THE App SHALL display a validation error and SHALL NOT save the invalid value.
3. WHEN the total balance exceeds the Spending_Limit, THE Balance_Display SHALL apply a distinct warning highlight style (visually different from its normal display style) to indicate the limit has been exceeded.
4. WHEN the total balance is at or below the Spending_Limit, THE Balance_Display SHALL display in its default style with no warning highlight applied.
5. WHEN the user confirms a valid Spending_Limit entry, THE App SHALL persist the Spending_Limit value in Local_Storage so it is restored on page reload.
6. IF a Local_Storage write fails when saving the Spending_Limit, THEN THE App SHALL display an error message and retain the previously saved Spending_Limit value if one existed.

---

### Requirement 10: Dark/Light Mode Toggle (Optional)

**User Story:** As a user, I want to switch between dark and light display modes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHERE theme toggling is enabled, THE App SHALL display a toggle control that switches the Theme between light and dark.
2. WHEN the user activates the toggle, THE App SHALL apply the selected Theme to all visible UI elements, including backgrounds, text, borders, and chart elements, without requiring a page reload.
3. WHEN the page loads and a Theme value is present in Local_Storage, THE App SHALL apply the stored Theme before rendering any UI elements.
4. IF no Theme value is present in Local_Storage, THEN THE App SHALL apply the light Theme as the default.
5. WHILE any Theme is active, THE App SHALL ensure all text elements maintain a contrast ratio of at least 4.5:1 and all large text and UI component boundaries maintain a contrast ratio of at least 3:1 against their background, in accordance with WCAG 2.1 Level AA.

---

### Requirement 11: Single-File Structure Constraint

**User Story:** As a developer, I want the project to follow a clean folder structure, so that the codebase stays maintainable.

#### Acceptance Criteria

1. THE App SHALL contain exactly one CSS file located in a `css/` directory at the project root, and that file SHALL be named `style.css`.
2. THE App SHALL contain exactly one JavaScript file located in a `js/` directory at the project root, and that file SHALL be named `app.js`.
3. THE App SHALL load all styles exclusively from the single CSS file and all scripts exclusively from the single JavaScript file, with no inline `<style>` blocks, inline `style` attributes, inline `<script>` blocks, or external CDN style/script references present in any HTML file.

---

### Requirement 12: Browser Compatibility

**User Story:** As a user, I want the app to work in any modern browser, so that I'm not restricted to a specific browser.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari, where "function correctly" means adding expenses, viewing charts, filtering data, and persisting data all operate without functional errors.
2. THE App SHALL render all UI elements and charts in each supported browser without any elements overlapping, being truncated, becoming invisible, or obscuring other elements.
3. IF Local_Storage is unavailable in the user's browser, THEN THE App SHALL display a message informing the user that the browser is not supported because Local_Storage is required.
