window.App = window.App || {};

window.App.Validators = (function () {
    const Patterns = {
        // No extra spaces at the start or end
        description: /^\S(?:.*\S)?$/,

        // Must be a positive number
        amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

        // Only letters are allowed for categories
        category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

        // The date must be Year-Month-Day
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

        // Check if the same word is typed twice
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
