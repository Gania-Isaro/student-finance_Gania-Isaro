window.App = window.App || {};

window.App.UI = (function () {
    const Utils = window.App.Utils;
    const State = window.App.State;

    // This function changes the app's theme based on what is passed ('dark' or 'light')
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    // This function puts a highlight around words that match your search
    const highlight = (text, re) => {
        if (!re || !text) return text;
        const stringText = String(text);
        return stringText.replace(re, m => `<mark>${m}</mark>`);
    };

    // This function draws the table with all the money records
    const renderTable = (records, searchRegex = null) => {
        const tbody = document.querySelector('.data-table tbody');
        if (!tbody) return;

        const settings = State.getSettings();
        if (!Array.isArray(records)) records = [];

        tbody.innerHTML = '';

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No records found.</td></tr>';
            return;
        }

        records.forEach(record => {
            const convertedAmount = Utils.convertFromBase(record.amount, settings.currency);
            const tr = document.createElement('tr');

            // Highlight matches
            const descHtml = highlight(record.description, searchRegex);
            const catHtml = highlight(record.category, searchRegex);

            tr.innerHTML = `
                <td data-label="Date">${record.date}</td>
                <td data-label="Description">${descHtml}</td>
                <td data-label="Category"><span class="badge category-${record.category.toLowerCase()}">${catHtml}</span></td>
                <td data-label="Amount" class="text-right ${record.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${record.type === 'expense' ? '-' : '+'}${Utils.formatCurrency(convertedAmount, settings.currency).replace(/[A-Z]{3}/, '').trim()} 
                </td>
                <td data-label="Actions" class="text-center">
                    <button class="btn-icon edit" data-id="${record.id}" aria-label="Edit">Edit</button>
                    <button class="btn-icon delete" data-id="${record.id}" aria-label="Delete">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // This function updates the numbers you see on the dashboard
    const updateDashboard = (records) => {
        if (!Array.isArray(records)) records = [];
        const settings = State.getSettings();

        // 1. Total Records
        const totalRecords = records.length;
        const totalRecordsEl = document.querySelector('.stat-card.total-records .amount');
        if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;

        // 2. Total Income & Total Expense
        const totalIncome = records
            .filter(r => r.type === 'income')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalExpense = records
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);

        const totalBalance = totalIncome - totalExpense;

        const incomeEl = document.querySelector('.stat-card.total-income .amount');
        if (incomeEl) {
            const converted = Utils.convertFromBase(totalIncome, settings.currency);
            incomeEl.textContent = Utils.formatCurrency(converted, settings.currency);
        }

        const expenseEl = document.querySelector('.stat-card.total-expense .amount');
        if (expenseEl) {
            const converted = Utils.convertFromBase(totalExpense, settings.currency);
            expenseEl.textContent = Utils.formatCurrency(converted, settings.currency);
        }

        const balanceEl = document.querySelector('.stat-card.total-balance .amount');
        if (balanceEl) {
            const converted = Utils.convertFromBase(totalBalance, settings.currency);
            balanceEl.textContent = Utils.formatCurrency(converted, settings.currency);
            balanceEl.style.color = totalBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
        }

        // 3. Top Category
        const categoryCounts = records.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {});

        let topCategory = '-';
        let maxCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topCategory = cat;
            }
        }
        const topCategoryEl = document.querySelector('.stat-card.top-category .amount');
        if (topCategoryEl) topCategoryEl.textContent = topCategory;


        // 4. Budget Section
        const budgetCap = Number(settings.budgetCap || 0);
        const progressBar = document.querySelector('.progress-bar');
        const budgetMetaEl = document.querySelector('.stat-card.budget .meta');

        if (progressBar && budgetMetaEl) {
            let percentage = 0;
            if (budgetCap > 0) {
                percentage = Math.min((totalExpense / budgetCap) * 100, 100);
            } else if (totalExpense > 0) {
                percentage = 100;
            }

            progressBar.style.width = `${percentage}%`;
            const convertedExpense = Utils.convertFromBase(totalExpense, settings.currency);
            const convertedCap = Utils.convertFromBase(budgetCap, settings.currency);
            const statusMsg = `${Math.round(percentage)}% used (${Utils.formatCurrency(convertedExpense, settings.currency)} / ${Utils.formatCurrency(convertedCap, settings.currency)})`;
            budgetMetaEl.textContent = statusMsg;

            // This sends an alert if you spend too much
            if (percentage >= 100) {
                showStatus(`Warning: You have reached your budget limit! (${statusMsg})`, 'error', true);
            } else if (percentage >= 80) {
                showStatus(`Notice: You are close to your budget limit. (${statusMsg})`, 'info', false);
            }
        }

        // 4.1 Savings Goal Status (Corrected Independence Requirement)
        const savingsTarget = (settings.savingsTarget !== undefined && settings.savingsTarget !== null) ? settings.savingsTarget : 0;
        const actualSavedAmount = (settings.actualSavedAmount !== undefined && settings.actualSavedAmount !== null) ? settings.actualSavedAmount : 0;

        const savingsEl = document.querySelector('.stat-card.savings-goal .amount');
        const savingsMetaEl = document.querySelector('.stat-card.savings-goal .meta');

        if (savingsEl && savingsMetaEl) {
            // Priority Logic: If balance allows, conceptually "fill" the savings to the target.
            // But also respect if the user manually saved MORE than the target.
            let effectiveSaved = Math.max(actualSavedAmount, Math.min(totalBalance, savingsTarget));

            const remaining = Math.max(0, savingsTarget - effectiveSaved);

            const convertedSaved = Utils.convertFromBase(effectiveSaved, settings.currency);
            const convertedTarget = Utils.convertFromBase(savingsTarget, settings.currency);
            const convertedRemaining = Utils.convertFromBase(remaining, settings.currency);

            savingsEl.textContent = Utils.formatCurrency(convertedSaved, settings.currency);

            if (remaining === 0 && savingsTarget > 0) {
                savingsMetaEl.innerHTML = `Goal: ${Utils.formatCurrency(convertedTarget, settings.currency)} <br><strong>Goal Reached!</strong>`;
                savingsMetaEl.style.color = 'var(--success-color)';
            } else {
                savingsMetaEl.innerHTML = `Goal: ${Utils.formatCurrency(convertedTarget, settings.currency)} <br>Remaining: ${Utils.formatCurrency(convertedRemaining, settings.currency)}`;
                savingsMetaEl.style.color = effectiveSaved > 0 ? 'var(--text-muted)' : 'var(--danger-color)';
            }
        }

        // 6. Surplus Funds Section
        const surplusEl = document.querySelector('.stat-card.surplus-funds .amount');
        const surplusMetaEl = document.querySelector('.stat-card.surplus-funds .meta');

        if (surplusEl && surplusMetaEl) {
            // Surplus is money left over after saving for your goal
            const reservedAmount = Math.max(savingsTarget, actualSavedAmount);
            const surplusValue = totalBalance - reservedAmount;

            const displaySurplus = Math.max(0, surplusValue);
            const convertedSurplus = Utils.convertFromBase(displaySurplus, settings.currency);
            surplusEl.textContent = Utils.formatCurrency(convertedSurplus, settings.currency);

            if (surplusValue < 0) {
                surplusMetaEl.textContent = "You need more money for your savings goal";
                surplusMetaEl.style.color = 'var(--danger-color)';
            } else {
                surplusMetaEl.textContent = "Money available after savings";
                surplusMetaEl.style.color = 'var(--text-muted)';
            }
        }

        // 5. Last 7-Days Trend (Chart)
        renderTrendChart(records);
    };

    // This function draws the spendng chart for the last 7 days
    const renderTrendChart = (records) => {
        const chartContainer = document.querySelector('.chart-placeholder');
        if (!chartContainer) return;

        const settings = State.getSettings();

        // Find the dates for the last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        // Calculate spending for each day
        const dailySpending = days.map(day => {
            const dayTotal = records
                .filter(r => r.date === day && r.type === 'expense')
                .reduce((sum, r) => sum + r.amount, 0);
            return { day, amount: dayTotal };
        });

        // Find the biggest spending day to scale the bars
        const maxSpend = Math.max(...dailySpending.map(d => d.amount), 10);

        // Generate HTML
        chartContainer.innerHTML = dailySpending.map(d => {
            const height = (d.amount / maxSpend) * 100;
            // Get short day name (e.g., "Mon")
            const dayName = new Date(d.day).toLocaleDateString('en-US', { weekday: 'short' });
            const converted = Utils.convertFromBase(d.amount, settings.currency);
            return `
                <div class="bar" style="height: ${height}%; background: var(--accent-gradient);" 
                     title="${dayName}: ${Utils.formatCurrency(converted, settings.currency)}">
                     <span class="bar-label">${dayName}</span>
                </div>
            `;
        }).join('');

        // Adjustments are now handled in CSS
        chartContainer.style.alignItems = 'flex-end';
    };

    // This function saves your data as a file on your computer
    const exportData = () => {
        const data = State.getRecords();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // This function loads your data from a file you select
    const importData = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                let recordsToImport = [];
                let settingsToImport = null;

                if (Array.isArray(data)) {
                    recordsToImport = data;
                } else if (data && typeof data === 'object' && Array.isArray(data.records)) {
                    recordsToImport = data.records;
                    settingsToImport = data.settings;
                } else {
                    showStatus('The file format is not correct.', 'error');
                    return;
                }

                // Check if records look valid
                const isValid = recordsToImport.every(item => item.id && item.amount !== undefined && item.date);
                if (isValid) {
                    State.setRecords(recordsToImport);

                    if (settingsToImport) {
                        State.updateSettings(settingsToImport);
                    }

                    showStatus('Data imported successfully! Reloading...', 'success');

                    // Reload after a short delay to allow status message to be seen
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showStatus('Invalid record format in JSON.', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                showStatus('Error reading JSON file.', 'error');
            }
        };
        reader.readAsText(file);
    };

    // This function shows a status message at the bottom of the screen
    const showStatus = (message, type = 'info', assertive = false) => {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
            statusEl.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
            statusEl.classList.remove('visually-hidden');
            setTimeout(() => statusEl.classList.add('visually-hidden'), 4000);
        }
    };

    const clearForm = () => {
        const form = document.querySelector('.entry-form');
        if (form) form.reset();
    };

    return {
        applyTheme,
        renderTable,
        updateDashboard,
        exportData,
        importData,
        showStatus,
        clearForm
    };
})();
