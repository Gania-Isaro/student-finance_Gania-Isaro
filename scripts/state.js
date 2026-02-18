window.App = window.App || {};

window.App.State = (function () {
    const Storage = window.App.Storage;
    let records = [];

    const init = () => {
        records = Storage.load();
        return records;
    };

    const getRecords = () => records;

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

    return {
        init,
        getRecords,
        addRecord,
        updateRecord,
        deleteRecord
    };
})();
