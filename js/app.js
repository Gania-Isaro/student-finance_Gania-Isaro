import { addExpense, updateExpense, expenses } from './state.js';
import { saveExpenses, loadExpenses } from './storage.js';
import { validateDescription, validateAmount, validateCategory, validateDate } from './validators.js';
import { render } from './ui.js';

const form = document.getElementById("expense-form");
const searchInput = document.getElementById("search-input");
const caseCheckbox = document.getElementById("case-checkbox");

// load saved data
expenses.push(...loadExpenses());
render();

// form submit
form.addEventListener("submit", function(e) {

    e.preventDefault();

    const description = form.description.value;
    const amount = form.amount.value;
    const category = form.category.value;
    const date = form.date.value;

    if (!validateDescription(description) ||
        !validateAmount(amount) ||
        !validateCategory(category) ||
        !validateDate(date)) {

        alert("Invalid input");
        return;
    }

    const expense = {
        id: Date.now().toString(),
        description,
        amount,
        category,
        date
    };

    if (form.dataset.editId) {
        updateExpense(form.dataset.editId, expense);
        delete form.dataset.editId;
    } else {
        addExpense(expense);
    }

    saveExpenses();
    render();

    form.reset();
});

// search
searchInput.addEventListener("input", function() {
    render(searchInput.value, caseCheckbox.checked);
});
