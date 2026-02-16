import { expenses, deleteExpense, updateExpense, getStats } from './state.js';
import { saveExpenses } from './storage.js';
import { highlight } from './search.js';

const tableBody = document.querySelector("#records-table tbody");
const totalCount = document.getElementById("total-count");
const totalAmount = document.getElementById("total-amount");
const topCategory = document.getElementById("top-category");
const last7Days = document.getElementById("last-7-days");
const form = document.getElementById("expense-form");

export function render(searchText = "", ignoreCase = false) {

    tableBody.innerHTML = "";

    expenses.forEach(e => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${highlight(e.description, searchText, ignoreCase)}</td>
            <td>${e.amount}</td>
            <td>${highlight(e.category, searchText, ignoreCase)}</td>
            <td>${e.date}</td>
            <td>
                <button class="edit" data-id="${e.id}">Edit</button>
                <button class="delete" data-id="${e.id}">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    addButtonEvents();
    updateDashboard();
}

function addButtonEvents() {

    document.querySelectorAll(".delete").forEach(btn => {
        btn.onclick = function() {
            deleteExpense(btn.dataset.id);
            saveExpenses();
            render();
        }
    });

    document.querySelectorAll(".edit").forEach(btn => {
        btn.onclick = function() {

            const expense = expenses.find(e => e.id === btn.dataset.id);

            form.description.value = expense.description;
            form.amount.value = expense.amount;
            form.category.value = expense.category;
            form.date.value = expense.date;

            form.dataset.editId = expense.id;
        }
    });
}

function updateDashboard() {

    const stats = getStats();

    totalCount.textContent = stats.totalCount;
    totalAmount.textContent = stats.totalAmount.toFixed(2);
    topCategory.textContent = stats.topCategory;

    last7Days.innerHTML = "";

    stats.last7Days.forEach(amount => {
        const bar = document.createElement("div");
        bar.style.height = amount * 2 + "px";
        last7Days.appendChild(bar);
    });
}
