const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentCurrency = localStorage.getItem("currency") || "USD";

// GEL vs USD ლარის გაცვლითი კურსი – შეგიძლიათ განაახლოთ ეს კურსი საჭიროებისამებრ
const GEL_RATE = 2.68;

transactionFormEl.addEventListener("submit", addTransaction);

const currencyToggleBtn = document.getElementById("currency-toggle");
if (currencyToggleBtn) {
    updateToggleButton();
    currencyToggleBtn.addEventListener("click", () => {
        currentCurrency = currentCurrency === "USD" ? "GEL" : "USD";
        localStorage.setItem("currency", currentCurrency);
        updateToggleButton();
        updateTransactionList();
        updateSummary();
    });
}

function updateToggleButton() {
    if (currencyToggleBtn) {
        currencyToggleBtn.textContent =
            currentCurrency === "USD" ? "Switch to GEL ₾" : "Switch to USD $";
    }
}

function addTransaction(e) {
    e.preventDefault();
    const description = descriptionEl.value.trim();


    let amount = parseFloat(amountEl.value);
    if (currentCurrency === "GEL") {
        amount = amount / GEL_RATE;
    }

    transactions.push({ id: Date.now(), description, amount });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateTransactionList();
    updateSummary();
    transactionFormEl.reset();
}

function updateTransactionList() {
    transactionListEl.innerHTML = "";
    const sortedTransactions = [...transactions].reverse();
    sortedTransactions.forEach((transaction) => {
        const transactionEl = createTransactionElement(transaction);
        transactionListEl.appendChild(transactionEl);
    });
}

function createTransactionElement(transaction) {
    const li = document.createElement("li");
    li.classList.add("transaction");
    li.classList.add(transaction.amount > 0 ? "income" : "expense");

    const displayAmount = convertAmount(transaction.amount);

    li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
      ${formatCurrency(displayAmount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    </span>
    `;
    return li;
}

function updateSummary() {
    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions
        .filter((t) => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + t.amount, 0);

    balanceEl.textContent = formatCurrency(convertAmount(balance));
    incomeAmountEl.textContent = formatCurrency(convertAmount(income));
    expenseAmountEl.textContent = formatCurrency(convertAmount(expenses));
}

function convertAmount(usdAmount) {
    return currentCurrency === "GEL" ? usdAmount * GEL_RATE : usdAmount;
}

function formatCurrency(number) {
    if (currentCurrency === "GEL") {
        return new Intl.NumberFormat("ka-GE", {
            style: "currency",
            currency: "GEL",
        }).format(number);
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(number);
}

function removeTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateTransactionList();
    updateSummary();
}

updateTransactionList();
updateSummary();
