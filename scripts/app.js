const State = window.App.State;
const UI = window.App.UI;
const Utils = window.App.Utils;
const Validator = window.App.Validators;
const Search = window.App.Search;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the data and settings from storage
    const { records, settings } = State.init();

    // Set the theme when the app starts
    const applyInitialTheme = (theme) => {
        if (theme === null) {
            // If no theme is saved, use the computer's dark/light mode
            UI.applyTheme(isDark ? 'dark' : 'light');
        } else {
            UI.applyTheme(theme);
        }
    };
    applyInitialTheme(settings.theme);

    // Change theme automatically if the computer's theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only do this if the user hasn't picked a theme yet
        if (State.getSettings().theme === null) {
            UI.applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Sync settings UI
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) currencySelect.value = settings.currency;

    const budgetCapInput = document.getElementById('budget-cap');
    if (budgetCapInput) budgetCapInput.value = settings.budgetCap;

    const savingsTargetInput = document.getElementById('savings-target');
    if (savingsTargetInput) savingsTargetInput.value = settings.savingsTarget;

    const actualSavingsInput = document.getElementById('actual-savings');
    if (actualSavingsInput) actualSavingsInput.value = settings.actualSavedAmount;

    /**
     * This function updates the labels and input values to match the current currency
     */
    const syncLabels = (forceUpdateValues = false) => {
        const currentSettings = State.getSettings();
        const currentCurrency = currentSettings.currency;

        const capLabel = document.querySelector('.cap-label');
        const targetLabel = document.querySelector('.target-label');
        const actualLabel = document.querySelector('.actual-label');

        if (capLabel) capLabel.textContent = `Monthly Spending Cap (${currentCurrency})`;
        if (targetLabel) targetLabel.textContent = `Monthly Savings Target (${currentCurrency})`;
        if (actualLabel) actualLabel.textContent = `Actual Savings (${currentCurrency})`;

        if (forceUpdateValues) {
            if (budgetCapInput) budgetCapInput.value = Utils.convertFromBase(currentSettings.budgetCap, currentCurrency).toFixed(0);
            if (savingsTargetInput) savingsTargetInput.value = Utils.convertFromBase(currentSettings.savingsTarget, currentCurrency).toFixed(0);
            if (actualSavingsInput) actualSavingsInput.value = Utils.convertFromBase(currentSettings.actualSavedAmount, currentCurrency).toFixed(0);
        }
    };

    let currentQuery = '';
    let currentSort = 'date-desc';

    // This function filters and sorts the data, then updates the page
    const render = () => {
        const allRecords = State.getRecords();
        const filtered = Search.filterRecords(allRecords, currentQuery);
        const sorted = Search.sortRecords(filtered, currentSort);

        // This helps highlight words you are searching for
        const regex = currentQuery ? Search.compileRegex(currentQuery) : null;
        UI.renderTable(sorted, regex);
        UI.updateDashboard(allRecords);
        syncLabels(false);
    };

    // 2. Initial Render
    syncLabels(true); // Put the saved values into the settings boxes
    render();

    // 3. Main Event Listeners
    const form = document.querySelector('.entry-form');
    if (form) form.addEventListener('submit', handleAddRecord);

    const cancelBtn = document.getElementById('cancel-transaction');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            UI.clearForm();
        };
    }

    const tableBody = document.querySelector('.data-table tbody');
    if (tableBody) tableBody.addEventListener('click', handleTableActions);

    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            currentQuery = e.target.value;
            render();
        };
    }

    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.onchange = (e) => {
            currentSort = e.target.value;
            render();
        };
    }

    // 4. Settings Event Listeners
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const currentTheme = State.getSettings().theme;
            let effectiveTheme = currentTheme;

            // If currently in 'auto' mode, detect what's applied to toggle it
            if (effectiveTheme === null) {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }

            const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
            State.updateSettings({ theme: newTheme });
            UI.applyTheme(newTheme);
        };
    }

    if (currencySelect) {
        currencySelect.onchange = (e) => {
            State.updateSettings({ currency: e.target.value });
            syncLabels(true);
            render();
        };
    }

    // Save these numbers when the user types in the settings boxes
    if (budgetCapInput) {
        budgetCapInput.oninput = (e) => {
            const displayVal = parseFloat(e.target.value) || 0;
            const baseVal = Utils.convertToBase(displayVal, State.getSettings().currency);
            State.updateSettings({ budgetCap: baseVal });
            render();
        };
    }

    if (savingsTargetInput) {
        savingsTargetInput.oninput = (e) => {
            const displayVal = parseFloat(e.target.value) || 0;
            const baseVal = Utils.convertToBase(displayVal, State.getSettings().currency);
            State.updateSettings({ savingsTarget: baseVal });
            render();
        };
    }

    if (actualSavingsInput) {
        actualSavingsInput.oninput = (e) => {
            const displayVal = parseFloat(e.target.value) || 0;
            const baseVal = Utils.convertToBase(displayVal, State.getSettings().currency);
            State.updateSettings({ actualSavedAmount: baseVal });
            render();
        };
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.onclick = () => UI.exportData();
    }

    const importInput = document.getElementById('import-input');
    if (importInput) {
        importInput.onchange = (e) => {
            if (e.target.files.length > 0) {
                UI.importData(e.target.files[0]);
            }
        };
    }

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
                State.clearAll();
                render();
                UI.showStatus('All data cleared.', 'info');
            }
        };
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
        // Advanced Regex: Back-reference check for duplicate words (Requirement C)
        if (Validator.Patterns.duplicateWords.test(desc)) {
            alert('Validation Error: Please avoid repeating the same word twice in the description.');
            return;
        }
        if (!typeInput.value) {
            alert('Please select a Transaction Type (Income or Expense).');
            return;
        }
        if (!categoryInput.value || !Validator.validate('category', category)) {
            alert('Please select a valid Category.');
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
        render();
        UI.clearForm();
        if (typeof UI.showStatus === 'function') UI.showStatus('Transaction added!', 'success');
    }

    // This handles clicks in the table like Delete and Edit
    function handleTableActions(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.dataset.id;

        if (btn.classList.contains('delete')) {
            if (confirm('Are you sure you want to delete this?')) {
                State.deleteRecord(id);
                render();
                if (typeof UI.showStatus === 'function') UI.showStatus('Deleted.', 'success');
            }
        }
        // If the user clicks the Edit button
        else if (btn.classList.contains('edit')) {
            const tr = btn.closest('tr');
            const record = State.getRecords().find(r => r.id === btn.dataset.id);
            if (!record) return;

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
                        <option value="Income" ${record.category === 'Income' ? 'selected' : ''}>Income</option>
                        <option value="Other" ${record.category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </td>
                <td><input type="number" step="0.01" value="${record.amount}" class="edit-amount"></td>
                <td class="text-center">
                    <button class="btn-icon save-edit" data-id="${record.id}">Save</button>
                    <button class="btn-icon cancel-edit" data-id="${record.id}">Cancel</button>
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

            // Advanced Regex check for internal edits
            if (Validator.Patterns.duplicateWords.test(updatedData.description)) {
                alert('Validation Error: Repeated words detected.');
                return;
            }

            updatedData.amount = parseFloat(updatedData.amount);

            State.updateRecord(btn.dataset.id, updatedData);
            render();
            if (typeof UI.showStatus === 'function') UI.showStatus('Updated!', 'success');
        }
        // If the user clicks Cancel while editing
        else if (btn.classList.contains('cancel-edit')) {
            render();
        }
    }
});
