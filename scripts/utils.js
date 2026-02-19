window.App = window.App || {};

window.App.Utils = (function () {
    const RATES = {
        'RWF': 1,
        'USD': 0.00074,
        'EUR': 0.00069,
        'GBP': 0.00057
    };

    const formatCurrency = (amount, currency = 'USD') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (e) {
            // Fallback for custom or unsupported currencies
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const convertFromBase = (amount, targetCurrency) => {
        const rate = RATES[targetCurrency] || 1;
        return amount * rate;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return {
        formatCurrency,
        convertFromBase,
        formatDate
    };
})();
