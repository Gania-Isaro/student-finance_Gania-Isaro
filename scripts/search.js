window.App = window.App || {};

window.App.Search = (function () {
    // 1. Compile Regex Safely
    const compileRegex = (query) => {
        if (!query) return null;
        try {
            // Check if user is typing a raw regex (e.g., /^Starts/)
            // If they are just typing text, escape special chars to treat as literal, 
            // OR let them use regex if advanced. 
            // Requirement says "Live regex search", implying user might type valid regex.
            return new RegExp(query, 'i');
        } catch (e) {
            // Invalid regex (e.g. user typed "["), treat as literal string search
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(escaped, 'i');
        }
    };

    // 2. Filter Logic
    const filterRecords = (records, query) => {
        if (!query) return records;

        const regex = compileRegex(query);
        return records.filter(record => {
            // Search in Description, Category, or Amount
            return regex.test(record.description) ||
                regex.test(record.category) ||
                regex.test(record.amount.toString());
        });
    };

    // 3. Sort Logic
    const sortRecords = (records, sortBy) => {
        // Create a copy to avoid mutating original state
        const sorted = [...records];

        return sorted.sort((a, b) => {
            switch (sortBy) {
                case 'category-asc': // A-Z
                    return a.category.localeCompare(b.category);
                case 'category-desc': // Z-A
                    return b.category.localeCompare(a.category);

                case 'amount-asc': // Low-High
                    return a.amount - b.amount;
                case 'amount-desc': // High-Low
                    return b.amount - a.amount;

                case 'date-asc': // Oldest First
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc': // Newest First (Default)
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    };

    return {
        filterRecords,
        sortRecords
    };
})();
