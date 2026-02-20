window.App = window.App || {};

window.App.Search = (function () {
    // 1. Safe Regex Compiler (Assignment Requirement)
    // This function makes a search pattern (regex) from the word you type
    const compileRegex = (query, flags = 'gi') => {
        if (!query) return null;
        try {
            return new RegExp(query, flags);
        } catch (e) {
            // If you type something that is not a valid pattern, we just search for the exact words
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(escaped, flags);
        }
    };

    // 2. Filter Logic
    // This function filters the transactions to find what you are looking for
    const filterRecords = (records, query) => {
        if (!query) return records;

        const regex = compileRegex(query);
        const testRegex = new RegExp(regex.source, 'i');

        return records.filter(record => {
            // Check if the description, category, or amount matches your search
            return testRegex.test(record.description) ||
                testRegex.test(record.category) ||
                testRegex.test(record.amount.toString());
        });
    };

    // 3. Sort Logic
    // This function sorts the transactions (like by date or category)
    const sortRecords = (records, sortBy) => {
        // We make a copy of the data before we sort it
        const sorted = [...records];

        return sorted.sort((a, b) => {
            switch (sortBy) {
                case 'category-asc':
                    return a.category.localeCompare(b.category);
                case 'category-desc':
                    return b.category.localeCompare(a.category);

                case 'amount-asc': // From low to high
                    return a.amount - b.amount;
                case 'amount-desc': // From high to low
                    return b.amount - a.amount;

                case 'date-asc': // From oldest to newest
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc': // From newest to oldest
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    };

    return {
        filterRecords,
        sortRecords,
        compileRegex
    };
})();
