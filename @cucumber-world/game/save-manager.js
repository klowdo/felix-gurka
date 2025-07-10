/**
 * Save Manager - Handles game save/load functionality with localStorage
 * Part of Cucumber World RPG
 */

class SaveManager {
    constructor() {
        this.maxSaveSlots = 5;
        this.saveKeyPrefix = 'cucumber_world_save_';
        this.settingsKey = 'cucumber_world_settings';
        this.defaultSettings = {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7,
            lastPlayedSlot: null
        };
    }

    /**
     * Create a new save game
     * @param {number} slot - Save slot number (1-5)
     * @param {string} playerName - Player's chosen name
     * @returns {Object} New save data object
     */
    createNewSave(slot, playerName = 'Player') {
        if (!this.isValidSlot(slot)) {
            throw new Error(`Invalid save slot: ${slot}. Must be between 1 and ${this.maxSaveSlots}`);
        }

        const saveData = {
            version: '1.0.0',
            playerName: playerName,
            createdAt: new Date().toISOString(),
            lastSaved: new Date().toISOString(),
            playTime: 0, // in seconds
            
            // World and progression
            currentWorld: 'garden',
            currentArea: 'vegetable_patch',
            unlockedWorlds: ['garden'],
            
            // Player inventory and team
            inventory: [],
            team: [], // Array of fruit instance IDs
            maxTeamSize: 6,
            
            // Game progress tracking
            gameProgress: {
                battlesWon: 0,
                battlesLost: 0,
                fruitsCollected: 0,
                cucumbersDefeated: [],
                itemsFound: 0,
                areasExplored: ['vegetable_patch'],
                achievements: []
            },
            
            // Player stats and resources
            playerStats: {
                level: 1,
                experience: 0,
                coins: 100,
                items: {
                    'potion': 3,
                    'super_potion': 0
                }
            },
            
            // Settings specific to this save
            saveSettings: {
                difficulty: 'normal',
                autoSave: true
            }
        };

        this.saveGame(slot, saveData);
        return saveData;
    }

    /**
     * Save game data to localStorage
     * @param {number} slot - Save slot number
     * @param {Object} saveData - Game data to save
     * @returns {boolean} Success status
     */
    saveGame(slot, saveData) {
        if (!this.isValidSlot(slot)) {
            console.error(`Invalid save slot: ${slot}`);
            return false;
        }

        try {
            // Update save timestamp
            saveData.lastSaved = new Date().toISOString();
            
            // Convert to JSON and save
            const saveKey = this.getSaveKey(slot);
            const jsonData = JSON.stringify(saveData, null, 2);
            
            localStorage.setItem(saveKey, jsonData);
            console.log(`Game saved to slot ${slot}`);
            return true;
        } catch (error) {
            console.error(`Failed to save game to slot ${slot}:`, error);
            return false;
        }
    }

    /**
     * Load game data from localStorage
     * @param {number} slot - Save slot number
     * @returns {Object|null} Loaded save data or null if not found
     */
    loadGame(slot) {
        if (!this.isValidSlot(slot)) {
            console.error(`Invalid save slot: ${slot}`);
            return null;
        }

        try {
            const saveKey = this.getSaveKey(slot);
            const jsonData = localStorage.getItem(saveKey);
            
            if (!jsonData) {
                console.log(`No save data found in slot ${slot}`);
                return null;
            }

            const saveData = JSON.parse(jsonData);
            
            // Validate save data structure
            if (!this.validateSaveData(saveData)) {
                console.error(`Invalid save data in slot ${slot}`);
                return null;
            }

            console.log(`Game loaded from slot ${slot}`);
            return saveData;
        } catch (error) {
            console.error(`Failed to load game from slot ${slot}:`, error);
            return null;
        }
    }

    /**
     * Delete a save game
     * @param {number} slot - Save slot number
     * @returns {boolean} Success status
     */
    deleteSave(slot) {
        if (!this.isValidSlot(slot)) {
            console.error(`Invalid save slot: ${slot}`);
            return false;
        }

        try {
            const saveKey = this.getSaveKey(slot);
            localStorage.removeItem(saveKey);
            console.log(`Save slot ${slot} deleted`);
            return true;
        } catch (error) {
            console.error(`Failed to delete save slot ${slot}:`, error);
            return false;
        }
    }

    /**
     * Get information about all save slots
     * @returns {Array} Array of save slot information
     */
    getAllSaveInfo() {
        const saveInfo = [];

        for (let slot = 1; slot <= this.maxSaveSlots; slot++) {
            const saveData = this.loadGame(slot);
            
            if (saveData) {
                saveInfo.push({
                    slot: slot,
                    exists: true,
                    playerName: saveData.playerName,
                    level: saveData.playerStats.level,
                    playTime: this.formatPlayTime(saveData.playTime),
                    lastSaved: new Date(saveData.lastSaved).toLocaleString(),
                    currentWorld: saveData.currentWorld,
                    fruitsCollected: saveData.gameProgress.fruitsCollected,
                    battlesWon: saveData.gameProgress.battlesWon
                });
            } else {
                saveInfo.push({
                    slot: slot,
                    exists: false,
                    empty: true
                });
            }
        }

        return saveInfo;
    }

    /**
     * Auto-save functionality
     * @param {number} slot - Save slot number
     * @param {Object} saveData - Game data to save
     * @returns {boolean} Success status
     */
    autoSave(slot, saveData) {
        if (saveData.saveSettings?.autoSave !== false) {
            return this.saveGame(slot, saveData);
        }
        return false;
    }

    /**
     * Export save data as downloadable file
     * @param {number} slot - Save slot number
     * @returns {string|null} JSON string of save data
     */
    exportSave(slot) {
        const saveData = this.loadGame(slot);
        if (!saveData) {
            return null;
        }

        return JSON.stringify(saveData, null, 2);
    }

    /**
     * Import save data from JSON string
     * @param {number} slot - Target save slot
     * @param {string} jsonData - JSON string of save data
     * @returns {boolean} Success status
     */
    importSave(slot, jsonData) {
        try {
            const saveData = JSON.parse(jsonData);
            
            if (!this.validateSaveData(saveData)) {
                console.error('Invalid save data format');
                return false;
            }

            return this.saveGame(slot, saveData);
        } catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }

    /**
     * Get and save game settings
     * @returns {Object} Current settings
     */
    getSettings() {
        try {
            const settingsData = localStorage.getItem(this.settingsKey);
            if (settingsData) {
                return { ...this.defaultSettings, ...JSON.parse(settingsData) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        
        return { ...this.defaultSettings };
    }

    /**
     * Save game settings
     * @param {Object} settings - Settings to save
     * @returns {boolean} Success status
     */
    saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...settings };
            
            localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
            console.log('Settings saved');
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Availability status
     */
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage info
     */
    getStorageInfo() {
        if (!this.isLocalStorageAvailable()) {
            return { available: false };
        }

        let totalSize = 0;
        let saveSlotSizes = {};

        // Calculate size of each save slot
        for (let slot = 1; slot <= this.maxSaveSlots; slot++) {
            const saveKey = this.getSaveKey(slot);
            const data = localStorage.getItem(saveKey);
            if (data) {
                const size = new Blob([data]).size;
                saveSlotSizes[slot] = size;
                totalSize += size;
            }
        }

        // Calculate settings size
        const settingsData = localStorage.getItem(this.settingsKey);
        const settingsSize = settingsData ? new Blob([settingsData]).size : 0;

        return {
            available: true,
            totalSize: totalSize + settingsSize,
            saveSlotSizes: saveSlotSizes,
            settingsSize: settingsSize,
            formattedSize: this.formatBytes(totalSize + settingsSize)
        };
    }

    // Private helper methods

    /**
     * Validate save slot number
     * @param {number} slot - Slot number to validate
     * @returns {boolean} Is valid
     */
    isValidSlot(slot) {
        return Number.isInteger(slot) && slot >= 1 && slot <= this.maxSaveSlots;
    }

    /**
     * Get localStorage key for save slot
     * @param {number} slot - Save slot number
     * @returns {string} localStorage key
     */
    getSaveKey(slot) {
        return `${this.saveKeyPrefix}${slot}`;
    }

    /**
     * Validate save data structure
     * @param {Object} saveData - Save data to validate
     * @returns {boolean} Is valid
     */
    validateSaveData(saveData) {
        const requiredFields = [
            'playerName', 'currentWorld', 'inventory', 'team',
            'gameProgress', 'playerStats'
        ];

        return requiredFields.every(field => saveData.hasOwnProperty(field));
    }

    /**
     * Format play time from seconds to readable format
     * @param {number} seconds - Play time in seconds
     * @returns {string} Formatted time string
     */
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Format bytes to readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted size string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveManager;
} else if (typeof window !== 'undefined') {
    window.SaveManager = SaveManager;
}