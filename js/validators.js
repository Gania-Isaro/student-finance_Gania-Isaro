export function validateDescription(text) {
    if (text.trim() === "") return false;

    const duplicate = /\b(\w+)\s+\1\b/i;
    if (duplicate.test(text)) return false;

    return true;
}

export function validateAmount(amount) {
    const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    return pattern.test(amount);
}

export function validateCategory(category) {
    const pattern = /^[A-Za-z ]+$/;
    return pattern.test(category);
}

export function validateDate(date) {
    if (date === "") return false;

    const selected = new Date(date);
    const today = new Date();

    if (selected > today) return false;

    return true;
}
