const State = window.App.State;
const UI = window.App.UI;
const Validator = window.App.Validators;
const Search = window.App.Search;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State and Search Params
    const records = State.init();
    let currentQuery = '';
    let currentSort = 'date-desc';

    // Helper to Filter -> Sort -> Render
    const render = () => {
        const allRecords = State.getRecords();
        const filtered = Search.filterRecords(allRecords, currentQuery);
        const sorted = Search.sortRecords(filtered, currentSort);

        UI.renderTable(sorted);
        // Requirement: Dashboard usually shows global stats, but if filtering, 
        // user might want to see stats for the filter (e.g. "How much did I spend on Food?").
        // Let's update Dashboard with FILTERED records for better utility.
        UI.updateDashboard(sorted);
    };

    // 2. Initial Render
    render();

    // 3. Event Listeners
    const form = document.querySelector('.entry-form');
    if (form) form.addEventListener('submit', handleAddRecord);

    const tableBody = document.querySelector('.data-table tbody');
    if (tableBody) tableBody.addEventListener('click', handleTableActions);

    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentQuery = e.target.value;
            render();
        });
    }

    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            render();
        });
    }

    // --- Handlers Defined Inside Scope to Access 'render' ---

    function handleAddRecord(e) {
        e.preventDefault();

        const descInput = document.getElementById('desc');
        const amountInput = document.getElementById('amount');
        const categoryInput = document.getElementById('category');
        const dateInput = document.getElementById('date');
        const typeInput = document.getElementById('type');

        const desc = descInput.value;
        const amount = amountInput.value;
        const category = categoryInput.value;
        const date = dateInput.value;

        // Validate
        if (!Validator.validate('description', desc)) {
            alert('Invalid Description: No leading/trailing spaces allowed.');
            return;
        }
        if (!Validator.validate('amount', amount)) {
            alert('Invalid Amount: Must be a positive number (max 2 decimals).');
            return;
        }
        if (!Validator.validate('category', category)) {
            alert('Invalid Category.');
            return;
        }
        if (!Validator.validate('date', date)) {
            alert('Invalid Date.');
            return;
        }

        const newRecord = {
            id: 'rec_' + Date.now(),
            description: desc,
            amount: parseFloat(amount),
            category: category,
            date: date,
            type: typeInput.value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        State.addRecord(newRecord);
        render(); // Use the scoped render function
        UI.clearForm();
        if (typeof UI.showStatus === 'function') UI.showStatus('Record added successfully!', 'success');
    }

    function handleTableActions(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;

        if (btn.classList.contains('delete')) {
            if (confirm('Are you sure you want to delete this record?')) {
                State.deleteRecord(id);
                render(); // Re-render
                if (typeof UI.showStatus === 'function') UI.showStatus('Record deleted.', 'success');
            }
        } else if (btn.classList.contains('edit')) {
            const tr = btn.closest('tr');
            const record = State.getRecords().find(r => r.id === btn.dataset.id);
            if (!record) return;

            // Replace row cells with input fields (Inline Edit UI)
            tr.innerHTML = `
                <td><input type="date" value="${record.date}" class="edit-date"></td>
                <td><input type="text" value="${record.description}" class="edit-desc"></td>
                <td>
                    <select class="edit-category">
                        <option value="Food" ${record.category === 'Food' ? 'selected' : ''}>Food</option>
                        <option value="Transport" ${record.category === 'Transport' ? 'selected' : ''}>Transport</option>
                        <option value="Books" ${record.category === 'Books' ? 'selected' : ''}>Books</option>
                        <option value="Entertainment" ${record.category === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
                        <option value="Fees" ${record.category === 'Fees' ? 'selected' : ''}>Fees</option>
                        <option value="Other" ${record.category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td><input type="number" step="0.01" value="${record.amount}" class="edit-amount"></td>
                <td class="text-center">
                    <button class="btn-icon save-edit" data-id="${record.id}">💾</button>
                    <button class="btn-icon cancel-edit" data-id="${record.id}">❌</button>
                </td>
            `;
        } else if (btn.classList.contains('save-edit')) {
            const tr = btn.closest('tr');
            const updatedData = {
                date: tr.querySelector('.edit-date').value,
                description: tr.querySelector('.edit-desc').value,
                category: tr.querySelector('.edit-category').value,
                amount: tr.querySelector('.edit-amount').value
            };

            if (!Validator.validate('date', updatedData.date)) { alert('Invalid Date'); return; }
            if (!Validator.validate('description', updatedData.description)) { alert('Invalid Description'); return; }
            if (!Validator.validate('category', updatedData.category)) { alert('Invalid Category'); return; }
            if (!Validator.validate('amount', updatedData.amount)) { alert('Invalid Amount'); return; }

            updatedData.amount = parseFloat(updatedData.amount);

            State.updateRecord(btn.dataset.id, updatedData);
            render(); // Re-render
            if (typeof UI.showStatus === 'function') UI.showStatus('Record updated.', 'success');
        } else if (btn.classList.contains('cancel-edit')) {
            render(); // Re-render to cancel
        }
    }
});
