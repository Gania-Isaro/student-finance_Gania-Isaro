export let expenses = [];

export function addExpense(expense) {
    expenses.push(expense);
}

export function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
}

export function updateExpense(id, newData) {
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenses[index] = newData;
    }
}

export function getStats() {

    let totalAmount = 0;
    let categoryCount = {};
    let today = new Date();
    let last7 = [];

    for (let i = 0; i < 7; i++) {
        last7.push(0);
    }

    expenses.forEach(e => {

        totalAmount += parseFloat(e.amount);

        if (!categoryCount[e.category]) {
            categoryCount[e.category] = 0;
        }
        categoryCount[e.category]++;

        let diff = Math.floor((today - new Date(e.date)) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff < 7) {
            last7[6 - diff] += parseFloat(e.amount);
        }
    });

    let topCategory = "None";
    let max = 0;

    for (let cat in categoryCount) {
        if (categoryCount[cat] > max) {
            max = categoryCount[cat];
            topCategory = cat;
        }
    }

    return {
        totalCount: expenses.length,
        totalAmount,
        topCategory,
        last7Days: last7
    };
}
