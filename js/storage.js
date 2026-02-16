import { expenses } from './state.js';

const KEY = "expenses_data";

export function saveExpenses() {
    localStorage.setItem(KEY, JSON.stringify(expenses));
}

export function loadExpenses() {
    const data = localStorage.getItem(KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}
