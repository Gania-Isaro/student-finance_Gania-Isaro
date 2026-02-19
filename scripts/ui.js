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

        // 1. Total Records
        const totalRecords = records.length;
        const totalRecordsEl = document.querySelector('.stat-card.total-records .amount');
        if (totalRecordsEl) totalRecordsEl.textContent = totalRecords;

        // 2. Total Volume (Sum of all record values)
        // assuming we want the sum of the absolute values (money moved)
        const totalVolume = records.reduce((sum, r) => sum + r.amount, 0);
        const totalVolumeEl = document.querySelector('.stat-card.total-volume .amount');
        if (totalVolumeEl) totalVolumeEl.textContent = Utils.formatCurrency(totalVolume);

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


        // 4. Budget (Existing Logic - Updated selectors if needed)
        const totalExpense = records
            .filter(r => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);

        const budgetCap = 1000;
        const progressBar = document.querySelector('.progress-bar');
        const metaEl = document.querySelector('.stat-card.budget .meta');

        if (progressBar && metaEl) {
            const percentage = Math.min((totalExpense / budgetCap) * 100, 100);
            progressBar.style.width = `${percentage}%`;
            metaEl.textContent = `${Math.round(percentage)}% used (${Utils.formatCurrency(totalExpense)} / ${Utils.formatCurrency(budgetCap)})`;
        }

        // 5. Last 7-Days Trend (Chart)
        renderTrendChart(records);
    };

    const renderTrendChart = (records) => {
        const chartContainer = document.querySelector('.chart-placeholder');
        if (!chartContainer) return;

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
            return `
                <div class="bar" style="height: ${height}%; background: var(--accent-gradient);" 
                     title="${dayName}: ${Utils.formatCurrency(d.amount)}">
                     <span class="bar-label" style="font-size: 0.7rem; position: absolute; bottom: -20px; width: 100%; text-align: center;">${dayName}</span>
                </div>
            `;
        }).join('');

        // Ensure container has space for labels
        chartContainer.style.alignItems = 'flex-end';
        chartContainer.style.marginBottom = '20px';
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
