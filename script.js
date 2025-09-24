// Elements
const addBtn = document.getElementById("add-btn");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseItems = document.getElementById("expense-items");
const totalEl = document.getElementById("total");
const expenseCountEl = document.getElementById("expense-count");
const remainingBudgetEl = document.getElementById("remaining-budget");
const currencySelector = document.getElementById("currency-selector");
const totalBudgetInput = document.getElementById("total-budget");

let currentCurrency = "USD";
let symbols = { "USD": "$", "EUR": "€", "INR": "₹", "GBP": "£", "JPY": "¥" };
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let totalBudget = parseFloat(localStorage.getItem("totalBudget")) || 1000;
totalBudgetInput.value = totalBudget;

// Charts
let categoryChart, trendChart;

// Initialize Charts
function initCharts() {
  const ctx1 = document.getElementById("categoryChart").getContext("2d");
  const ctx2 = document.getElementById("trendChart").getContext("2d");

  categoryChart = new Chart(ctx1, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: ["#007bff","#00c6ff","#ff6b6b","#feca57","#1dd1a1","#5f27cd","#c8d6e5"] }] },
    options: { plugins: { legend: { labels: { color: "#333" } } } }
  });

  trendChart = new Chart(ctx2, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Expenses Over Time', data: [], backgroundColor: "#007bff" }] },
    options: { scales: { x: { ticks: { color: "#333" } }, y: { ticks: { color: "#333" } } } }
  });
}

// Save to localStorage
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("totalBudget", totalBudget);
}

// Update Summary
function updateSummary() {
  let total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalEl.innerText = `${symbols[currentCurrency]}${total.toFixed(2)}`;
  expenseCountEl.innerText = expenses.length;
  remainingBudgetEl.innerText = `${symbols[currentCurrency]}${(totalBudget - total).toFixed(2)}`;
}

// Render Expenses Table
function renderExpenses() {
  expenseItems.innerHTML = "";
  expenses.forEach(exp => {
    const tr = document.createElement("tr");
    const formattedDate = new Date(exp.date).toLocaleString(); // human-readable
    tr.innerHTML = `
      <td>${exp.title}</td>
      <td>${exp.category}</td>
      <td>${symbols[exp.currency]}${exp.amount.toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td><button class="delete-btn" data-id="${exp.id}">Delete</button></td>
    `;
    expenseItems.appendChild(tr);
  });
}

// Update Charts
function updateCharts() {
  const catData = {};
  expenses.forEach(e => catData[e.category] = (catData[e.category] || 0) + e.amount);
  categoryChart.data.labels = Object.keys(catData);
  categoryChart.data.datasets[0].data = Object.values(catData);
  categoryChart.update();

  trendChart.data.labels = expenses.map(e => new Date(e.date).toLocaleDateString());
  trendChart.data.datasets[0].data = expenses.map(e => e.amount);
  trendChart.update();
}

// Add Expense
addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!title || isNaN(amount)) return alert("Enter valid expense!");

  const expense = {
    id: Date.now(),
    title,
    amount,
    category,
    currency: currentCurrency,
    date: new Date()
  };
  expenses.push(expense);
  saveExpenses();
  renderExpenses();
  updateSummary();
  updateCharts();

  titleInput.value = "";
  amountInput.value = "";
});

// Delete Expense
expenseItems.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = parseInt(e.target.dataset.id);
    expenses = expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderExpenses();
    updateSummary();
    updateCharts();
  }
});

// Currency Change
currencySelector.addEventListener("change", () => {
  currentCurrency = currencySelector.value;
  updateSummary();
  renderExpenses();
  updateCharts();
});

// Total Budget Change
totalBudgetInput.addEventListener("change", () => {
  const value = parseFloat(totalBudgetInput.value);
  if (!isNaN(value) && value >= 0) {
    totalBudget = value;
    saveExpenses();
    updateSummary();
  } else {
    alert("Enter a valid budget amount!");
    totalBudgetInput.value = totalBudget;
  }
});

// Initialize
initCharts();
renderExpenses();
updateSummary();
updateCharts();
