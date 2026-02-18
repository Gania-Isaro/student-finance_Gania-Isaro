window.App = window.App || {};

window.App.Storage = (function () {
    const KEY = 'app:data';

    const load = () => {
        try {
            const data = localStorage.getItem(KEY);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    };

    const save = (data) => {
        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    return {
        load,
        save
    };
})();
