window.App = window.App || {};

window.App.State = (function () {
    const Storage = window.App.Storage;
    let records = [];
    let settings = { theme: null, currency: 'RWF', budgetCap: 1000, savingsTarget: 0, actualSavedAmount: 0 };

    // Load the data and settings when the app starts
    const init = () => {
        records = Storage.load();
        settings = Storage.loadSettings();
        return { records, settings };
    };

    const getRecords = () => records;

    const getSettings = () => settings;

    // Update and save the settings (like theme and currency)
    const updateSettings = (newSettings) => {
        settings = { ...settings, ...newSettings };
        Storage.saveSettings(settings);
    };

    // Add a new transaction to the list and save it
    const addRecord = (record) => {
        records.push(record);
        Storage.save(records);
    };

    // Change an existing transaction and save the updates
    const updateRecord = (id, updatedData) => {
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updatedData, updatedAt: new Date().toISOString() };
            Storage.save(records);
        }
    };

    const deleteRecord = (id) => {
        records = records.filter(r => r.id !== id);
        Storage.save(records);
    };

    const clearAll = () => {
        records = [];
        Storage.save(records);
    };

    const setRecords = (newRecords) => {
        records = newRecords;
        Storage.save(records);
    };

    return {
        init,
        getRecords,
        getSettings,
        updateSettings,
        addRecord,
        updateRecord,
        deleteRecord,
        clearAll,
        setRecords
    };
})();
