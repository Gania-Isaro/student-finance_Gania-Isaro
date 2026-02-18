/**
 * Student Finance Tracker - Validation Logic
 * Rubric: M3 – Forms & Regex Validation (4+ rules incl. one advanced)
 */

export const Patterns = {
    // 1. Description: Forbid leading/trailing spaces, collapse doubles
    // matches "Lunch" or "Lunch at cafeteria", NOT " Lunch" or "Lunch  "
    description: /^\S+(?: \S+)*$/,

    // 2. Numeric (Amount): Positive number, optional 2 decimal places
    // matches "12", "12.50", "0.99", NOT "-12", "12."
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

    // 3. Category: Letters, spaces, hyphens only
    // matches "Food", "School-Fees", NOT "Food123"
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

    // 4. Date: YYYY-MM-DD format
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

    // 5. Advanced: Duplicate Word Check (Back-reference)
    // catches "coffee coffee"
    duplicateWords: /\b(\w+)\s+\1\b/i
};

export const validate = (field, value) => {
    if (!Patterns[field]) return false;
    return Patterns[field].test(value);
};
