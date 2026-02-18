window.App = window.App || {};

window.App.UI = (function () {
    const Utils = window.App.Utils;

    const renderTable = (records) => {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;

        if (!Array.isArray(records)) records = [];

        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Date">${record.date}</td>
                <td data-label="Description">${record.description}</td>
                <td data-label="Category"><span class="badge category-${record.category.toLowerCase()}">${record.category}</span></td>
                <td data-label="Amount" class="text-right ${record.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${record.type === 'expense' ? '-' : '+'}${Utils.formatCurrency(record.amount).replace('$', '')} 
                </td>
                <td data-label="Actions" class="text-center">
                    <button class="btn-icon edit" data-id="${record.id}" aria-label="Edit">✏️</button>
                    <button class="btn-icon delete" data-id="${record.id}" aria-label="Delete">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    const updateDashboard = (records) => {
        if (!Array.isArray(records)) records = [];

        const totalIncome = records
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalExpense = records
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);

        const balance = totalIncome - totalExpense;

        // Update DOM
        const balanceEl = document.querySelector('.stat-card.balance .amount');
        const incomeEl = document.querySelector('.stat-card.income .amount');
        const expenseEl = document.querySelector('.stat-card.expense .amount');

        if (balanceEl) balanceEl.textContent = Utils.formatCurrency(balance);
        if (incomeEl) incomeEl.textContent = Utils.formatCurrency(totalIncome);
        if (expenseEl) expenseEl.textContent = Utils.formatCurrency(totalExpense);

        // Budget Progress (Basic implementation)
        const budgetCap = 1000; // Default or read from settings
        const progressBar = document.querySelector('.progress-bar');
        const metaEl = document.querySelector('.stat-card.budget .meta');

        if (progressBar && metaEl) {
            const percentage = Math.min((totalExpense / budgetCap) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            metaEl.textContent = `${Math.round(percentage)}% used (${Utils.formatCurrency(totalExpense)} / ${Utils.formatCurrency(budgetCap)})`;
        }
    };

    const showStatus = (message, type = 'info') => {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
            statusEl.classList.remove('visually-hidden');
            setTimeout(() => statusEl.classList.add('visually-hidden'), 3000);
        }
    };

    const clearForm = () => {
        const form = document.querySelector('.entry-form');
        if (form) form.reset();
    };

    return {
        renderTable,
        updateDashboard,
        showStatus,
        clearForm
    };
})();
