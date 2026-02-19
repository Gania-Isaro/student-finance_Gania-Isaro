window.App = window.App || {};

window.App.State = (function () {
    const Storage = window.App.Storage;
    let records = [];
    let settings = { theme: 'light', currency: 'RWF', budgetCap: 1000 };

    const init = () => {
        records = Storage.load();
        settings = Storage.loadSettings();
        return { records, settings };
    };

    const getRecords = () => records;

    const getSettings = () => settings;

    const updateSettings = (newSettings) => {
        settings = { ...settings, ...newSettings };
        Storage.saveSettings(settings);
    };

    const addRecord = (record) => {
        records.push(record);
        Storage.save(records);
    };

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
