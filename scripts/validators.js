window.App = window.App || {};

window.App.Validators = (function () {
    const Patterns = {
        // Description: Forbid leading/trailing spaces and collapse doubles
        description: /^\S(?:.*\S)?$/,

        // Amount: Positive integer or 2 decimal places (e.g., 10, 10.5, 10.50)
        amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

        // Category: Letters, spaces, hyphens
        category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

        // Date: YYYY-MM-DD
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

        // Advanced: Catch duplicate words (e.g., "coffee coffee")
        duplicateWords: /\b(\w+)\s+\1\b/i
    };

    const validate = (field, value) => {
        if (!Patterns[field]) return false;
        return Patterns[field].test(value);
    };

    return {
        Patterns,
        validate
    };
})();
