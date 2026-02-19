window.App = window.App || {};

window.App.Storage = (function () {
    const KEY = 'app:data';

    const SETTINGS_KEY = 'app:settings';

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

    const loadSettings = () => {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            if (!data) return { theme: 'light', currency: 'RWF', budgetCap: 1000, savingsTarget: 0 };
            const settings = JSON.parse(data);
            if (settings.savingsTarget === undefined) settings.savingsTarget = 0;
            return settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return { theme: 'light', currency: 'RWF', budgetCap: 1000, savingsTarget: 0 };
        }
    };

    const saveSettings = (settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    return {
        load,
        save,
        loadSettings,
        saveSettings
    };
})();
