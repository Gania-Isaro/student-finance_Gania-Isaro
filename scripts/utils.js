window.App = window.App || {};

window.App.Utils = (function () {
    const RATES = {
        'RWF': 1,
        'USD': 0.00074,
        'EUR': 0.00069,
        'GBP': 0.00057
    };

    // This function shows the money in a nice way (like $10.00 or 1,000 RWF)
    const formatCurrency = (amount, currency = 'USD') => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (e) {
            // If the currency name is not recognized, show it like this:
            return `${currency} ${amount.toFixed(2)}`;
        }
    };

    const convertFromBase = (amount, targetCurrency) => {
        const rate = RATES[targetCurrency] || 1;
        return amount * rate;
    };

    const convertToBase = (amount, sourceCurrency) => {
        const rate = RATES[sourceCurrency] || 1;
        return amount / rate;
    };

    // This function shows a date in a simple way (like Jan 1, 2024)
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return {
        formatCurrency,
        convertFromBase,
        convertToBase,
        formatDate
    };
})();
