window.App = window.App || {};

window.App.UI = (function () {
    const Utils = window.App.Utils;
    const State = window.App.State;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    const renderTable = (records) => {
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
            tr.innerHTML = `
                <td data-label="Date">${record.date}</td>
                <td data-label="Description">${record.description}</td>
                <td data-label="Category"><span class="badge category-${record.category.toLowerCase()}">${record.category}</span></td>
                <td data-label="Amount" class="text-right ${record.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${record.type === 'expense' ? '-' : '+'}${Utils.formatCurrency(convertedAmount, settings.currency).replace(/[A-Z]{3}/, '').trim()} 
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


        // 4. Budget
        const budgetCap = (settings.budgetCap !== undefined && settings.budgetCap !== null) ? settings.budgetCap : 1000;
        const progressBar = document.querySelector('.progress-bar');
        const metaEl = document.querySelector('.stat-card.budget .meta');

        if (progressBar && metaEl) {
            let percentage = 0;
            if (budgetCap > 0) {
                percentage = Math.min((totalExpense / budgetCap) * 100, 100);
            } else if (totalExpense > 0) {
                percentage = 100;
            }

            progressBar.style.width = `${percentage}%`;
            const convertedExpense = Utils.convertFromBase(totalExpense, settings.currency);
            const convertedCap = Utils.convertFromBase(budgetCap, settings.currency);
            metaEl.textContent = `${Math.round(percentage)}% used (${Utils.formatCurrency(convertedExpense, settings.currency)} / ${Utils.formatCurrency(convertedCap, settings.currency)})`;
        }

        // 5. Last 7-Days Trend (Chart)
        renderTrendChart(records);
    };

    const renderTrendChart = (records) => {
        const chartContainer = document.querySelector('.chart-placeholder');
        if (!chartContainer) return;

        const settings = State.getSettings();

        // Get last 7 days dates
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
        }

        // Calculate spending (expense) per day
        const dailySpending = days.map(day => {
            const dayTotal = records
                .filter(r => r.date === day && r.type === 'expense')
                .reduce((sum, r) => sum + r.amount, 0);
            return { day, amount: dayTotal };
        });

        // Find max for scaling
        const maxSpend = Math.max(...dailySpending.map(d => d.amount), 10); // Min 10 to avoid div/0

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

    const importData = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    // Check if it looks like our record format
                    const isValid = data.every(item => item.id && item.amount && item.date);
                    if (isValid) {
                        State.setRecords(data);
                        renderTable(data);
                        updateDashboard(data);
                        showStatus('Data imported successfully!', 'success');
                    } else {
                        showStatus('Invalid data format in JSON.', 'error');
                    }
                } else {
                    showStatus('Imported file is not a valid JSON array.', 'error');
                }
            } catch (error) {
                showStatus('Error reading JSON file.', 'error');
            }
        };
        reader.readAsText(file);
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
        applyTheme,
        renderTable,
        updateDashboard,
        exportData,
        importData,
        showStatus,
        clearForm
    };
})();
