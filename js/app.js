// LocalStorage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'ebv_transactions',
  CATEGORIES: 'ebv_categories',
  THEME: 'ebv_theme',
  LIMIT: 'ebv_limit'
};

// Default Initial Categories
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

// Application State
let transactions = [];
let categories = [];
let spendingLimit = 0;
let chartInstance = null;

// DOM Elements
const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');

const customCategoryForm = document.getElementById('customCategoryForm');
const newCategoryInput = document.getElementById('newCategoryInput');

const limitForm = document.getElementById('limitForm');
const spendingLimitInput = document.getElementById('spendingLimitInput');
const limitStatus = document.getElementById('limitStatus');

const totalBalanceEl = document.getElementById('totalBalance');
const transactionListEl = document.getElementById('transactionList');
const sortBySelect = document.getElementById('sortBySelect');

const monthlyFilterSelect = document.getElementById('monthlyFilterSelect');
const monthlyTotalVal = document.getElementById('monthlyTotalVal');
const monthlyCountVal = document.getElementById('monthlyCountVal');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const noChartDataMsg = document.getElementById('noChartData');

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  dateInput.valueAsDate = new Date();

  loadLocalStorage();
  initTheme();
  renderCategoryDropdown();
  renderTransactions();
  renderMonthlySummary();
  initChart();
  updateTotals();

  // Event Listeners
  transactionForm.addEventListener('submit', handleAddTransaction);
  customCategoryForm.addEventListener('submit', handleAddCustomCategory);
  limitForm.addEventListener('submit', handleSetLimit);
  sortBySelect.addEventListener('change', renderTransactions);
  monthlyFilterSelect.addEventListener('change', updateMonthlySummaryDisplay);
  themeToggleBtn.addEventListener('click', toggleTheme);
});

// --- LocalStorage Operations ---
function loadLocalStorage() {
  transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
  categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [...DEFAULT_CATEGORIES];
  spendingLimit = parseFloat(localStorage.getItem(STORAGE_KEYS.LIMIT)) || 0;

  if (spendingLimit > 0) {
    spendingLimitInput.value = spendingLimit;
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

function saveLimit() {
  localStorage.setItem(STORAGE_KEYS.LIMIT, spendingLimit.toString());
}

// --- Theme Toggle Feature ---
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
  updateThemeButton(newTheme);
  updateChartTheme();
}

function updateThemeButton(theme) {
  const icon = themeToggleBtn.querySelector('.icon');
  const text = themeToggleBtn.querySelector('.btn-text');
  if (theme === 'dark') {
    icon.textContent = '☀️';
    text.textContent = 'Light Mode';
  } else {
    icon.textContent = '🌙';
    text.textContent = 'Dark Mode';
  }
}

// --- Categories Handling ---
function renderCategoryDropdown() {
  // Clear existing options except placeholder
  categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function handleAddCustomCategory(e) {
  e.preventDefault();
  const catName = newCategoryInput.value.trim();
  if (!catName) return;

  if (categories.some(c => c.toLowerCase() === catName.toLowerCase())) {
    alert('Category already exists!');
    return;
  }

  categories.push(catName);
  saveCategories();
  renderCategoryDropdown();
  newCategoryInput.value = '';
}

// --- Spending Limit Handling ---
function handleSetLimit(e) {
  e.preventDefault();
  const limitVal = parseFloat(spendingLimitInput.value);
  spendingLimit = isNaN(limitVal) ? 0 : limitVal;
  saveLimit();
  updateTotals();
}

// --- Add / Delete Transactions ---
function handleAddTransaction(e) {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value;

  // Form Validation
  if (!name || isNaN(amount) || amount <= 0 || !category || !date) {
    alert('Please fill in all fields with valid data.');
    return;
  }

  const newTransaction = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    date
  };

  transactions.push(newTransaction);
  saveTransactions();

  // Reset Form
  itemNameInput.value = '';
  amountInput.value = '';
  categorySelect.selectedIndex = 0;
  dateInput.valueAsDate = new Date();

  // Refresh UI
  renderTransactions();
  updateTotals();
  updateChart();
  renderMonthlySummary();
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
  updateTotals();
  updateChart();
  renderMonthlySummary();
}

// --- Sorting Transactions ---
function getSortedTransactions() {
  const sortBy = sortBySelect.value;
  return [...transactions].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0;
  });
}

function renderTransactions() {
  const sorted = getSortedTransactions();
  transactionListEl.innerHTML = '';

  if (sorted.length === 0) {
    transactionListEl.innerHTML = '<li class="empty-list-msg">No transactions added yet.</li>';
    return;
  }

  sorted.forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="item-info">
        <span class="item-name">${escapeHtml(t.name)}</span>
        <div class="item-meta">
          <span class="category-badge">${escapeHtml(t.category)}</span>
          <span>${t.date}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount">-$${t.amount.toFixed(2)}</span>
        <button class="delete-btn" title="Delete item" onclick="deleteTransaction('${t.id}')">&times;</button>
      </div>
    `;
    transactionListEl.appendChild(li);
  });
}

// --- Calculations & Limit Warning ---
function updateTotals() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;

  if (spendingLimit > 0) {
    if (total > spendingLimit) {
      limitStatus.className = 'limit-status exceeded';
      limitStatus.textContent = `⚠️ Warning: Spending exceeds limit of $${spendingLimit.toFixed(2)}!`;
    } else {
      limitStatus.className = 'limit-status';
      limitStatus.textContent = `Limit: $${spendingLimit.toFixed(2)} (${((total/spendingLimit)*100).toFixed(0)}% used)`;
    }
  } else {
    limitStatus.className = 'limit-status';
    limitStatus.textContent = 'Set a spending limit to track overall budget.';
  }
}

// --- Monthly Summary View Feature ---
function renderMonthlySummary() {
  // Populate month selector options based on existing transactions
  const months = new Set();
  transactions.forEach(t => {
    if (t.date) {
      months.add(t.date.substring(0, 7)); // YYYY-MM
    }
  });

  const sortedMonths = Array.from(months).sort().reverse();
  const currentSelection = monthlyFilterSelect.value;

  monthlyFilterSelect.innerHTML = '';
  if (sortedMonths.length === 0) {
    const nowMonth = new Date().toISOString().substring(0, 7);
    sortedMonths.push(nowMonth);
  }

  sortedMonths.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = formatMonthName(m);
    monthlyFilterSelect.appendChild(opt);
  });

  if (currentSelection && sortedMonths.includes(currentSelection)) {
    monthlyFilterSelect.value = currentSelection;
  }

  updateMonthlySummaryDisplay();
}

function updateMonthlySummaryDisplay() {
  const selectedMonth = monthlyFilterSelect.value;
  if (!selectedMonth) return;

  const filtered = transactions.filter(t => t.date && t.date.startsWith(selectedMonth));
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  monthlyTotalVal.textContent = `$${total.toFixed(2)}`;
  monthlyCountVal.textContent = filtered.length;
}

function formatMonthName(yyyyMm) {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

// --- Visualization (Chart.js) ---
function initChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#4c51bf', '#319795', '#ed8936', '#e53e3e', '#38a169',
          '#805ad5', '#d69e2e', '#3182ce', '#b83280', '#4a5568'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text-main').trim()
          }
        }
      }
    }
  });
  updateChart();
}

function updateChart() {
  if (!chartInstance) return;

  // Aggregate amounts by category
  const categoryTotals = {};
  transactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (labels.length === 0) {
    noChartDataMsg.style.display = 'block';
    chartInstance.data.labels = [];
    chartInstance.data.datasets[0].data = [];
  } else {
    noChartDataMsg.style.display = 'none';
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
  }

  chartInstance.update();
}

function updateChartTheme() {
  if (!chartInstance) return;
  const textColor = getComputedStyle(document.body).getPropertyValue('--text-main').trim();
  chartInstance.options.plugins.legend.labels.color = textColor;
  chartInstance.update();
}

// Helper Function
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}